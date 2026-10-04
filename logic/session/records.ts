export type SetRecord = { reps: number; weightKg: number };

/** Estimación de 1RM (fórmula de Epley): el peso que, en teoría, podrías levantar una sola vez. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/**
 * true si `candidate` supera el mejor 1RM estimado del historial. Series sin
 * peso externo (isométricos o bodyweight puro, weightKg = 0) nunca cuentan
 * como récord: no hay una carga que comparar.
 */
export function isPersonalRecord(candidate: SetRecord, historical: SetRecord[]): boolean {
  if (candidate.weightKg <= 0) return false;
  const candidateOneRm = estimateOneRepMax(candidate.weightKg, candidate.reps);
  const bestHistorical = historical.reduce((max, s) => Math.max(max, estimateOneRepMax(s.weightKg, s.reps)), 0);
  return candidateOneRm > bestHistorical;
}
