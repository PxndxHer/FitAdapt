import type { WorkoutSession } from "@/types";

import type { AdaptiveHint } from "./adaptiveHints";
import { suggestNextLoad } from "./adaptiveHints";
import { estimateSessionCalories } from "./calories";
import { isPersonalRecord } from "./records";

export type SessionSummary = {
  durationMin: number;
  totalVolumeKg: number;
  totalSets: number;
  estimatedCalories: number;
  personalRecords: { exerciseId: string; exerciseName: string }[];
  adaptiveHints: AdaptiveHint[];
};

export type ExerciseInfo = { name: string; met: number };
export type HistoricalSet = { reps: number; weightKg: number };

/**
 * Arma el resumen final de una sesión terminada: duración, volumen total
 * (reps × peso), calorías estimadas, récords personales batidos (comparando
 * cada serie contra el historial de ese ejercicio) y sugerencias de ajuste
 * de carga para la próxima vez. Pura: toda la información ya viene resuelta
 * desde la base de datos, nada se consulta aquí.
 */
export function buildSessionSummary(
  session: WorkoutSession,
  exerciseInfo: Map<string, ExerciseInfo>,
  historicalSetsByExercise: Map<string, HistoricalSet[]>,
  weightKg: number
): SessionSummary {
  let totalVolumeKg = 0;
  let totalSets = 0;
  const setMets: number[] = [];
  const personalRecords: { exerciseId: string; exerciseName: string }[] = [];
  const adaptiveHints: AdaptiveHint[] = [];

  for (const ex of session.exercises) {
    if (ex.status !== "completed" || ex.sets.length === 0) continue;
    const info = exerciseInfo.get(ex.exerciseId);
    if (!info) continue;

    const historical = historicalSetsByExercise.get(ex.exerciseId) ?? [];
    let hitPr = false;

    for (const set of ex.sets) {
      totalVolumeKg += set.reps * set.weightKg;
      totalSets += 1;
      setMets.push(info.met);
      if (isPersonalRecord({ reps: set.reps, weightKg: set.weightKg }, historical)) {
        hitPr = true;
      }
    }

    if (hitPr) {
      personalRecords.push({ exerciseId: ex.exerciseId, exerciseName: info.name });
    }

    const hint = suggestNextLoad(
      ex.exerciseId,
      info.name,
      ex.sets.map((s) => ({ reps: s.reps, weightKg: s.weightKg, rpe: s.rpe }))
    );
    if (hint) adaptiveHints.push(hint);
  }

  const durationMin = session.durationMin ?? 0;

  return {
    durationMin,
    totalVolumeKg: Math.round(totalVolumeKg),
    totalSets,
    estimatedCalories: Math.round(estimateSessionCalories(setMets, durationMin, weightKg)),
    personalRecords,
    adaptiveHints,
  };
}
