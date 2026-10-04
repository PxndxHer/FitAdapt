import type { Exercise, ExerciseType, Goal, MovementPattern, MuscleGroup } from "@/types";

import { estimateMuscleFatigue } from "./fatigue";
import { isEquipmentAvailable, isSafeForInjuries, scoreExercise } from "./scoring";
import type { MuscleFatigueMap, RecommendedSlot, RecommendedWorkout, RecommenderContext, ScoredExercise } from "./types";

/** Tiempo reservado para calentamiento y transiciones entre ejercicios, fuera del trabajo en sí. */
const TRANSITION_BUFFER_SECONDS = 180;
const MAX_SLOTS = 8;

/** Patrones que se intentan cubrir primero, en este orden, antes de rellenar con lo mejor puntuado. */
const PRIORITY_PATTERNS: MovementPattern[] = [
  "squat",
  "hinge",
  "horizontal_push",
  "horizontal_pull",
  "vertical_push",
  "vertical_pull",
  "core",
];

const OVERALL_FATIGUE_REST_THRESHOLD = 65;
const HIGH_FATIGUE_MUSCLE_COUNT_THRESHOLD = 3;

function buildExerciseIndex(exercises: Exercise[]): Map<string, Exercise> {
  return new Map(exercises.map((e) => [e.id, e]));
}

/** Candidatos seguros para este perfil: equipo disponible y ninguna zona lesionada en juego. */
function safeCandidates(context: RecommenderContext): Exercise[] {
  return context.exercises.filter(
    (e) => isEquipmentAvailable(e, context.profile.equipment) && isSafeForInjuries(e, context.profile.injuries)
  );
}

function rankedCandidates(exercises: Exercise[], context: RecommenderContext, fatigue: MuscleFatigueMap): ScoredExercise[] {
  return exercises.map((e) => scoreExercise(e, context, fatigue)).sort((a, b) => b.score - a.score);
}

function estimatedSets(exercise: Exercise, goal: Goal) {
  const range = exercise.recommendedRanges[goal];
  const sets = range ? Math.round((range.sets[0] + range.sets[1]) / 2) : 3;
  const restSeconds = range ? Math.round((range.restSeconds[0] + range.restSeconds[1]) / 2) : 60;
  const repsMin = range?.repsMin ?? 8;
  const repsMax = range?.repsMax ?? 12;
  const seconds = sets * exercise.secondsPerSet + Math.max(0, sets - 1) * restSeconds;
  return { seconds, sets, repsMin, repsMax, restSeconds };
}

function toSlot(scored: ScoredExercise, goal: Goal): RecommendedSlot {
  const est = estimatedSets(scored.exercise, goal);
  return {
    exercise: scored.exercise,
    targetSets: est.sets,
    targetRepsMin: est.repsMin,
    targetRepsMax: est.repsMax,
    targetRestSeconds: est.restSeconds,
    explanation: scored.explanation,
  };
}

/**
 * Arma el entrenamiento de hoy según el tiempo disponible: cubre primero los
 * patrones de movimiento prioritarios (uno por tipo) con el mejor candidato
 * disponible, y rellena el tiempo restante con lo mejor puntuado en general.
 * Siempre deja pasar al menos un ejercicio, aunque exceda ligeramente el
 * presupuesto de tiempo, para no devolver un entrenamiento vacío.
 */
export function recommendTodayWorkout(context: RecommenderContext, options: { availableMinutes: number }): RecommendedWorkout {
  const budgetSeconds = Math.max(0, options.availableMinutes * 60 - TRANSITION_BUFFER_SECONDS);
  const fatigue = estimateMuscleFatigue(context.recentSets, buildExerciseIndex(context.exercises), context.now);
  const candidates = rankedCandidates(safeCandidates(context), context, fatigue);

  const slots: RecommendedSlot[] = [];
  const usedIds = new Set<string>();
  let usedSeconds = 0;

  const tryAdd = (scored: ScoredExercise): boolean => {
    if (usedIds.has(scored.exercise.id)) return false;
    const est = estimatedSets(scored.exercise, context.profile.goal);
    if (usedSeconds + est.seconds > budgetSeconds && slots.length > 0) return false;

    slots.push(toSlot(scored, context.profile.goal));
    usedIds.add(scored.exercise.id);
    usedSeconds += est.seconds;
    return true;
  };

  for (const pattern of PRIORITY_PATTERNS) {
    if (slots.length >= MAX_SLOTS || usedSeconds >= budgetSeconds) break;
    const best = candidates.find((c) => c.exercise.movementPattern === pattern && !usedIds.has(c.exercise.id));
    if (best) tryAdd(best);
  }

  for (const scored of candidates) {
    if (slots.length >= MAX_SLOTS || usedSeconds >= budgetSeconds) break;
    tryAdd(scored);
  }

  const estimatedMinutes = Math.round((usedSeconds + TRANSITION_BUFFER_SECONDS) / 60);
  return { slots, estimatedMinutes };
}

/** Igual que `recommendTodayWorkout`, pero limitado a un grupo muscular o tipo de ejercicio elegido. */
export function generateQuickWorkout(
  context: RecommenderContext,
  criteria: { muscleGroup?: MuscleGroup; type?: ExerciseType },
  options: { availableMinutes: number }
): RecommendedWorkout {
  const filteredExercises = context.exercises.filter(
    (e) =>
      (!criteria.muscleGroup || e.primaryMuscle === criteria.muscleGroup || e.secondaryMuscles.includes(criteria.muscleGroup)) &&
      (!criteria.type || e.type === criteria.type)
  );

  return recommendTodayWorkout({ ...context, exercises: filteredExercises }, options);
}

/**
 * Sugiere sustitutos para un ejercicio, en niveles cada vez más amplios hasta
 * encontrar candidatos seguros: primero mismo músculo primario o patrón de
 * movimiento; si una lesión descarta a todos (ej. sentadilla con rodilla
 * lesionada), amplía a ejercicios que comparten algún músculo secundario con
 * el original (ej. hip thrust o peso muerto rumano, que entrenan pierna sin
 * cargar tanto la rodilla); como último recurso, cualquier ejercicio seguro
 * mejor puntuado. Así nunca deja al usuario sin alternativa.
 */
export function suggestSubstitutes(exerciseId: string, context: RecommenderContext, count = 3): ScoredExercise[] {
  const original = context.exercises.find((e) => e.id === exerciseId);
  if (!original) return [];

  const fatigue = estimateMuscleFatigue(context.recentSets, buildExerciseIndex(context.exercises), context.now);
  const safe = safeCandidates(context).filter((e) => e.id !== exerciseId);

  const tiers: Exercise[][] = [
    safe.filter((e) => e.primaryMuscle === original.primaryMuscle || e.movementPattern === original.movementPattern),
    safe.filter(
      (e) =>
        e.secondaryMuscles.includes(original.primaryMuscle) ||
        original.secondaryMuscles.includes(e.primaryMuscle) ||
        e.secondaryMuscles.some((m) => original.secondaryMuscles.includes(m))
    ),
    safe,
  ];

  const pool = tiers.find((candidates) => candidates.length > 0) ?? [];
  return rankedCandidates(pool, context, fatigue).slice(0, count);
}

export type RestDaySuggestion = {
  shouldRest: boolean;
  reason: string;
  suggestedExercises: ScoredExercise[];
};

/** Sugiere descanso activo/movilidad cuando la fatiga acumulada reciente es alta. */
export function suggestRestOrMobilityDay(context: RecommenderContext): RestDaySuggestion {
  const fatigue = estimateMuscleFatigue(context.recentSets, buildExerciseIndex(context.exercises), context.now);
  const values = Object.values(fatigue).filter((v): v is number => typeof v === "number");
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const highFatigueCount = values.filter((v) => v >= OVERALL_FATIGUE_REST_THRESHOLD).length;

  const shouldRest = average >= OVERALL_FATIGUE_REST_THRESHOLD || highFatigueCount >= HIGH_FATIGUE_MUSCLE_COUNT_THRESHOLD;

  if (!shouldRest) {
    return {
      shouldRest: false,
      reason: "Tu fatiga acumulada es baja: puedes entrenar con normalidad hoy.",
      suggestedExercises: [],
    };
  }

  const mobilityPool = context.exercises.filter(
    (e) => (e.type === "mobility" || e.type === "stretching") && isEquipmentAvailable(e, context.profile.equipment)
  );

  return {
    shouldRest: true,
    reason: "Acumulas bastante fatiga en varios grupos musculares: hoy es buen día para descanso activo o movilidad.",
    suggestedExercises: rankedCandidates(mobilityPool, context, fatigue).slice(0, 5),
  };
}
