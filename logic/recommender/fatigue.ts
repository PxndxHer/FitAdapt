import type { Exercise, MuscleGroup } from "@/types";

import type { MuscleFatigueMap, RecentSetLog } from "./types";

/** Horas tras las que una serie se considera ya totalmente recuperada (48-72h según el requerimiento). */
export const RECOVERY_WINDOW_HOURS = 72;

/** Cuánto estímulo recibe un músculo secundario, relativo al primario, en el mismo ejercicio. */
const SECONDARY_MUSCLE_FACTOR = 0.5;

function hoursBetween(fromIso: string, toIso: string): number {
  const diffMs = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Estima, para cada grupo muscular, cuánta fatiga acumulada queda en este
 * momento (0 = recuperado, 100 = muy fatigado) a partir de las series
 * registradas recientemente. Cada serie aporta un estímulo proporcional al
 * esfuerzo percibido (RPE, hasta 10) que decae linealmente hasta cero en
 * `RECOVERY_WINDOW_HOURS`. El músculo primario del ejercicio recibe el
 * estímulo completo; cada secundario recibe la mitad.
 */
export function estimateMuscleFatigue(
  recentSets: RecentSetLog[],
  exercisesById: Map<string, Exercise>,
  now: string
): MuscleFatigueMap {
  const fatigue: Record<string, number> = {};

  for (const set of recentSets) {
    const exercise = exercisesById.get(set.exerciseId);
    if (!exercise) continue;

    const hoursAgo = hoursBetween(set.performedAt, now);
    if (hoursAgo < 0 || hoursAgo >= RECOVERY_WINDOW_HOURS) continue;

    const remainingFraction = 1 - hoursAgo / RECOVERY_WINDOW_HOURS;
    const stimulus = set.rpe * remainingFraction;

    addFatigue(fatigue, exercise.primaryMuscle, stimulus);
    for (const muscle of exercise.secondaryMuscles) {
      addFatigue(fatigue, muscle, stimulus * SECONDARY_MUSCLE_FACTOR);
    }
  }

  const clamped: MuscleFatigueMap = {};
  for (const [muscle, value] of Object.entries(fatigue)) {
    clamped[muscle as MuscleGroup] = Math.min(100, value);
  }
  return clamped;
}

function addFatigue(map: Record<string, number>, muscle: MuscleGroup, amount: number): void {
  map[muscle] = (map[muscle] ?? 0) + amount;
}

/** Fatiga de un músculo puntual; 0 (recuperado) si no hay datos recientes. */
export function muscleFatigue(map: MuscleFatigueMap, muscle: MuscleGroup): number {
  return map[muscle] ?? 0;
}

/** 1 = totalmente recuperado, 0 = muy fatigado. */
export function muscleRecovery(map: MuscleFatigueMap, muscle: MuscleGroup): number {
  return 1 - muscleFatigue(map, muscle) / 100;
}
