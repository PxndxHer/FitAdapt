import { MUSCLE_LABELS } from "@/constants/labels";
import type { Equipment, Exercise, ExperienceLevel, Goal, InjuryArea, MovementPattern, MuscleGroup } from "@/types";

import { muscleRecovery } from "./fatigue";
import type { MuscleFatigueMap, RecommenderContext, RecommenderProfile, ScoredExercise } from "./types";

/** Pesos de cada factor en la puntuación final. Deben sumar 1. */
export const WEIGHTS = {
  goalFit: 0.25,
  recovery: 0.3,
  preference: 0.2,
  variety: 0.15,
  patternBalance: 0.1,
} as const;

/** Ventana, en semanas, para penalizar la repetición de un mismo ejercicio. */
export const VARIETY_WINDOW_WEEKS = 6;
/** Ventana, en semanas, para aprender preferencias a partir de completados/saltados/sustituidos. */
export const PREFERENCE_WINDOW_WEEKS = 8;
/** Ventana, en semanas, para medir el equilibrio reciente entre patrones de movimiento opuestos. */
const PATTERN_BALANCE_WINDOW_WEEKS = 2;

const IDEAL_DIFFICULTY_RANGE: Record<ExperienceLevel, [number, number]> = {
  beginner: [1, 2],
  intermediate: [2, 4],
  advanced: [3, 5],
};

/** Qué tan bien encaja el tipo de ejercicio con el objetivo del usuario (0-1). */
const TYPE_GOAL_AFFINITY: Record<Exercise["type"], Partial<Record<Goal, number>>> = {
  strength: { strength: 1, gain_muscle: 0.8, health: 0.6, endurance: 0.4, lose_fat: 0.5 },
  hypertrophy: { gain_muscle: 1, strength: 0.6, health: 0.6, lose_fat: 0.6, endurance: 0.4 },
  cardio: { lose_fat: 1, endurance: 1, health: 0.8, gain_muscle: 0.3, strength: 0.2 },
  hiit: { lose_fat: 1, endurance: 0.9, health: 0.7, gain_muscle: 0.4, strength: 0.3 },
  mobility: { health: 1, endurance: 0.5, lose_fat: 0.4, gain_muscle: 0.3, strength: 0.3 },
  stretching: { health: 1, endurance: 0.4, lose_fat: 0.3, gain_muscle: 0.3, strength: 0.3 },
};

const OPPOSING_PATTERNS: Partial<Record<MovementPattern, MovementPattern>> = {
  horizontal_push: "horizontal_pull",
  horizontal_pull: "horizontal_push",
  vertical_push: "vertical_pull",
  vertical_pull: "vertical_push",
  squat: "hinge",
  hinge: "squat",
};

export function isEquipmentAvailable(exercise: Exercise, available: Equipment[]): boolean {
  return exercise.equipment.some((eq) => available.includes(eq));
}

/** Exclusión dura: si el ejercicio estresa una zona que el perfil reporta lesionada, no es seguro. */
export function isSafeForInjuries(exercise: Exercise, injuries: InjuryArea[]): boolean {
  if (injuries.length === 0) return true;
  return !exercise.injuryFlags.some((area) => injuries.includes(area));
}

function weeksBetween(fromIso: string, toIso: string): number {
  const diffMs = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 7);
}

/** true si `performedAt` cayó dentro de los últimos `windowWeeks`, respecto a `now`. */
function isWithinWeeks(performedAt: string, now: string, windowWeeks: number): boolean {
  const weeksAgo = weeksBetween(performedAt, now);
  return weeksAgo >= 0 && weeksAgo <= windowWeeks;
}

function levelFit(exercise: Exercise, level: ExperienceLevel): number {
  const [min, max] = IDEAL_DIFFICULTY_RANGE[level];
  if (exercise.difficulty >= min && exercise.difficulty <= max) return 1;
  const distance = exercise.difficulty < min ? min - exercise.difficulty : exercise.difficulty - max;
  return Math.max(0, 1 - distance * 0.3);
}

function goalTypeFit(exercise: Exercise, goal: Goal): number {
  return TYPE_GOAL_AFFINITY[exercise.type]?.[goal] ?? 0.5;
}

/** Compatibilidad con el objetivo (tipo de ejercicio) y el nivel (dificultad) del usuario. */
function goalFit(exercise: Exercise, profile: RecommenderProfile): number {
  return 0.5 * levelFit(exercise, profile.experienceLevel) + 0.5 * goalTypeFit(exercise, profile.goal);
}

function averageRecovery(muscles: MuscleGroup[], map: MuscleFatigueMap): number {
  if (muscles.length === 0) return 1;
  const sum = muscles.reduce((acc, m) => acc + muscleRecovery(map, m), 0);
  return sum / muscles.length;
}

function recoveryFit(exercise: Exercise, fatigue: MuscleFatigueMap): number {
  return 0.7 * muscleRecovery(fatigue, exercise.primaryMuscle) + 0.3 * averageRecovery(exercise.secondaryMuscles, fatigue);
}

/**
 * Sube la puntuación de ejercicios que el usuario suele completar; la baja
 * para los que suele saltar o sustituir. Sin historial, queda neutral con un
 * ligero optimismo (para no penalizar ejercicios nunca antes vistos).
 */
function preferenceFit(exercise: Exercise, context: RecommenderContext): number {
  const relevant = context.recentOutcomes.filter(
    (o) => o.exerciseId === exercise.id && isWithinWeeks(o.performedAt, context.now, PREFERENCE_WINDOW_WEEKS)
  );
  const chosenAsSubstitute = context.recentOutcomes.filter(
    (o) => o.substitutedWithExerciseId === exercise.id && isWithinWeeks(o.performedAt, context.now, PREFERENCE_WINDOW_WEEKS)
  ).length;

  if (relevant.length === 0 && chosenAsSubstitute === 0) {
    return 0.6;
  }

  const completed = relevant.filter((o) => o.status === "completed").length;
  const avoided = relevant.filter((o) => o.status === "skipped" || o.status === "substituted").length;
  const total = completed + avoided || 1;
  const completionRate = completed / total;
  const substituteBonus = Math.min(0.2, chosenAsSubstitute * 0.05);

  return Math.min(1, completionRate + substituteBonus);
}

function isMainStrengthLift(exercise: Exercise): boolean {
  return exercise.type === "strength" && exercise.isCompound;
}

/**
 * Penaliza repetir exactamente el mismo ejercicio demasiadas veces en la
 * ventana reciente, salvo los ejercicios principales de fuerza (compuestos),
 * que toleran repetirse cada semana sin penalización.
 */
function varietyFit(exercise: Exercise, context: RecommenderContext): number {
  const occurrences = context.recentOutcomes.filter(
    (o) => o.exerciseId === exercise.id && o.status === "completed" && isWithinWeeks(o.performedAt, context.now, VARIETY_WINDOW_WEEKS)
  ).length;

  if (occurrences === 0) return 1;

  const tolerance = isMainStrengthLift(exercise) ? VARIETY_WINDOW_WEEKS : 2;
  const penaltyPerExtra = isMainStrengthLift(exercise) ? 0.05 : 0.2;
  const penalty = Math.max(0, occurrences - tolerance) * penaltyPerExtra;
  return Math.max(0, 1 - penalty);
}

/** Prioriza patrones de movimiento poco entrenados frente a su opuesto (empuje/tirón, rodilla/cadera). */
function patternBalanceFit(exercise: Exercise, context: RecommenderContext): number {
  const opposing = OPPOSING_PATTERNS[exercise.movementPattern];
  if (!opposing) return 0.7;

  const countOf = (pattern: MovementPattern) =>
    context.recentOutcomes.filter((o) => {
      if (o.status !== "completed" || !isWithinWeeks(o.performedAt, context.now, PATTERN_BALANCE_WINDOW_WEEKS)) return false;
      const ex = context.exercises.find((e) => e.id === o.exerciseId);
      return ex?.movementPattern === pattern;
    }).length;

  const own = countOf(exercise.movementPattern);
  const opposite = countOf(opposing);

  if (own + opposite === 0) return 0.7;
  if (opposite > own) return 1;
  if (opposite === own) return 0.7;
  return 0.4;
}

function daysSinceLastTrained(exercise: Exercise, context: RecommenderContext): number | null {
  const sameMuscle = context.recentOutcomes.filter((o) => {
    if (o.status !== "completed") return false;
    const ex = context.exercises.find((e) => e.id === o.exerciseId);
    return ex?.primaryMuscle === exercise.primaryMuscle;
  });
  if (sameMuscle.length === 0) return null;

  const mostRecent = sameMuscle.reduce((latest, o) => (o.performedAt > latest ? o.performedAt : latest), sameMuscle[0].performedAt);
  return Math.max(0, Math.round(weeksBetween(mostRecent, context.now) * 7));
}

function buildReasons(
  exercise: Exercise,
  parts: { goalFit: number; recovery: number; preference: number; variety: number; patternBalance: number },
  context: RecommenderContext
): string[] {
  const reasons: string[] = [];
  const muscleName = MUSCLE_LABELS[exercise.primaryMuscle];

  if (parts.recovery > 0.8) {
    const daysRest = daysSinceLastTrained(exercise, context);
    reasons.push(
      daysRest !== null
        ? `Tu ${muscleName} está recuperado y no lo entrenas desde hace ${daysRest} día${daysRest === 1 ? "" : "s"}.`
        : `Tu ${muscleName} está recuperado.`
    );
  } else if (parts.recovery < 0.4) {
    reasons.push(`Tu ${muscleName} todavía está fatigado de un entrenamiento reciente.`);
  }

  if (parts.patternBalance >= 1) {
    reasons.push("Ayuda a equilibrar tu entrenamiento: últimamente trabajaste más el patrón opuesto.");
  }

  if (parts.preference > 0.75) {
    reasons.push("Sueles completar este ejercicio sin saltarlo.");
  } else if (parts.preference < 0.35) {
    reasons.push("Lo has saltado o sustituido seguido, así que se incluye con menor prioridad.");
  }

  if (parts.variety < 0.6) {
    reasons.push("Se repite poco para darle lugar a otros ejercicios similares.");
  }

  if (parts.goalFit >= 0.85) {
    reasons.push("Encaja bien con tu objetivo y tu nivel actual.");
  }

  if (reasons.length === 0) {
    reasons.push("Buena opción para tu entrenamiento de hoy.");
  }

  return reasons;
}

/** Combina todos los factores ponderados en una sola puntuación, con una explicación en español. */
export function scoreExercise(exercise: Exercise, context: RecommenderContext, fatigue: MuscleFatigueMap): ScoredExercise {
  const parts = {
    goalFit: goalFit(exercise, context.profile),
    recovery: recoveryFit(exercise, fatigue),
    preference: preferenceFit(exercise, context),
    variety: varietyFit(exercise, context),
    patternBalance: patternBalanceFit(exercise, context),
  };

  const score =
    WEIGHTS.goalFit * parts.goalFit +
    WEIGHTS.recovery * parts.recovery +
    WEIGHTS.preference * parts.preference +
    WEIGHTS.variety * parts.variety +
    WEIGHTS.patternBalance * parts.patternBalance;

  const reasons = buildReasons(exercise, parts, context);

  return { exercise, score, reasons, explanation: reasons[0] };
}
