/**
 * kcal ≈ MET × 3.5 × peso(kg) / 200 por minuto — fórmula estándar del
 * Compendio de Actividades Físicas, la misma base que usan la mayoría de
 * apps de fitness para estimar gasto calórico a partir del MET.
 */
export function estimateCalories(met: number, weightKg: number, minutes: number): number {
  return ((met * 3.5 * weightKg) / 200) * minutes;
}

/**
 * Calorías de toda la sesión: promedia el MET de cada serie completada
 * (así un ejercicio con más series pesa más en el promedio) y lo aplica
 * sobre la duración total real de la sesión, descanso incluido.
 */
export function estimateSessionCalories(setMets: number[], totalDurationMin: number, weightKg: number): number {
  if (setMets.length === 0 || totalDurationMin <= 0) return 0;
  const avgMet = setMets.reduce((a, b) => a + b, 0) / setMets.length;
  return estimateCalories(avgMet, weightKg, totalDurationMin);
}
