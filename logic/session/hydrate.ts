import type { Exercise, WorkoutSession } from "@/types";

import type { RecommendedSlot } from "../recommender";
import type { ActiveExerciseState } from "./types";

/** Arma el estado de ejercicios activos a partir de una recomendación recién creada en la base de datos. */
export function buildActiveExercisesFromSlots(slots: RecommendedSlot[], sessionExerciseIds: string[]): ActiveExerciseState[] {
  return slots.map((slot, index) => ({
    sessionExerciseId: sessionExerciseIds[index],
    exercise: slot.exercise,
    targetSets: slot.targetSets,
    targetRepsMin: slot.targetRepsMin,
    targetRepsMax: slot.targetRepsMax,
    targetRestSeconds: slot.targetRestSeconds,
    status: "pending",
    loggedSets: [],
  }));
}

/** Reconstruye el estado de ejercicios activos a partir de una sesión guardada (para reanudarla). */
export function buildActiveExercisesFromSession(session: WorkoutSession, exercisesById: Map<string, Exercise>): ActiveExerciseState[] {
  return session.exercises.map((se) => {
    const exercise = exercisesById.get(se.substitutedWithExerciseId ?? se.exerciseId);
    if (!exercise) {
      throw new Error(`No se encontró el ejercicio ${se.exerciseId} al reanudar la sesión`);
    }
    return {
      sessionExerciseId: se.id,
      exercise,
      targetSets: se.targetSets ?? 3,
      targetRepsMin: se.targetRepsMin ?? 8,
      targetRepsMax: se.targetRepsMax ?? 12,
      targetRestSeconds: se.targetRestSeconds ?? 60,
      status: se.status,
      loggedSets: se.sets.map((s) => ({ reps: s.reps, weightKg: s.weightKg, rpe: s.rpe })),
    };
  });
}
