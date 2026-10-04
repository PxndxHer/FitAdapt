export type LoggedSet = { reps: number; weightKg: number; rpe: number };

export type AdaptiveHint = {
  exerciseId: string;
  message: string;
  suggestedWeightDeltaKg: number;
};

/**
 * Sugerencia de ajuste de carga para la próxima vez, a partir del RPE
 * promedio reportado en la sesión. No es un motor adaptativo completo con
 * historial de varias semanas (eso queda para una fase futura): es una
 * heurística directa — esfuerzo bajo sube la carga ~5%, esfuerzo muy alto
 * sugiere mantener o bajar. RPE 7-8 se considera un rango saludable sin
 * necesidad de ajuste.
 */
export function suggestNextLoad(exerciseId: string, exerciseName: string, sets: LoggedSet[]): AdaptiveHint | null {
  if (sets.length === 0) return null;

  const avgRpe = sets.reduce((a, s) => a + s.rpe, 0) / sets.length;
  const avgWeight = sets.reduce((a, s) => a + s.weightKg, 0) / sets.length;

  if (avgRpe <= 6) {
    const delta = avgWeight > 0 ? Math.max(1, Math.round(avgWeight * 0.05 * 2) / 2) : 0;
    return {
      exerciseId,
      suggestedWeightDeltaKg: delta,
      message:
        avgWeight > 0
          ? `${exerciseName}: tu esfuerzo fue bajo (RPE ${avgRpe.toFixed(1)}). Prueba +${delta}kg la próxima vez.`
          : `${exerciseName}: tu esfuerzo fue bajo (RPE ${avgRpe.toFixed(1)}). Prueba una variante más difícil la próxima vez.`,
    };
  }

  if (avgRpe >= 9) {
    const delta = avgWeight > 0 ? -Math.max(1, Math.round(avgWeight * 0.05 * 2) / 2) : 0;
    return {
      exerciseId,
      suggestedWeightDeltaKg: delta,
      message: `${exerciseName}: tu esfuerzo fue muy alto (RPE ${avgRpe.toFixed(1)}). Considera mantener o bajar la carga la próxima vez.`,
    };
  }

  return null;
}
