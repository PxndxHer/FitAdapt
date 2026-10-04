import type { Goal } from "@/types";
import type { RepRange } from "@/types";

/**
 * Presets de series/reps/descanso reutilizables para no repetir los mismos
 * literales en cada ejercicio. Cada función cubre las 5 claves de `Goal`.
 * Para ejercicios isométricos (plancha, hollow hold, estiramientos), los
 * campos `repsMin`/`repsMax` representan SEGUNDOS de mantenimiento, no
 * repeticiones — es una convención aceptada en todo el dataset.
 */

/** Movimientos compuestos pesados: sentadilla, press banca, peso muerto, dominada, remo con barra. */
export function rangesCompound(): Partial<Record<Goal, RepRange>> {
  return {
    strength: { sets: [4, 5], repsMin: 3, repsMax: 6, restSeconds: [150, 180] },
    gain_muscle: { sets: [3, 4], repsMin: 8, repsMax: 12, restSeconds: [75, 90] },
    lose_fat: { sets: [3, 4], repsMin: 12, repsMax: 15, restSeconds: [45, 60] },
    endurance: { sets: [2, 3], repsMin: 15, repsMax: 20, restSeconds: [30, 45] },
    health: { sets: [2, 3], repsMin: 10, repsMax: 15, restSeconds: [45, 60] },
  };
}

/** Ejercicios de aislamiento con pesas/máquina/polea: curl, elevación, extensión. */
export function rangesIsolation(): Partial<Record<Goal, RepRange>> {
  return {
    strength: { sets: [3, 4], repsMin: 6, repsMax: 8, restSeconds: [90, 120] },
    gain_muscle: { sets: [3, 4], repsMin: 10, repsMax: 15, restSeconds: [60, 75] },
    lose_fat: { sets: [3, 3], repsMin: 15, repsMax: 20, restSeconds: [30, 45] },
    endurance: { sets: [2, 3], repsMin: 15, repsMax: 20, restSeconds: [30, 30] },
    health: { sets: [2, 3], repsMin: 10, repsMax: 15, restSeconds: [45, 45] },
  };
}

/** Ejercicios básicos de peso corporal: flexión, sentadilla sin peso, zancada, fondo. */
export function rangesBodyweight(): Partial<Record<Goal, RepRange>> {
  return {
    strength: { sets: [4, 5], repsMin: 6, repsMax: 10, restSeconds: [120, 150] },
    gain_muscle: { sets: [3, 4], repsMin: 10, repsMax: 15, restSeconds: [60, 90] },
    lose_fat: { sets: [3, 4], repsMin: 15, repsMax: 20, restSeconds: [30, 45] },
    endurance: { sets: [2, 3], repsMin: 15, repsMax: 25, restSeconds: [30, 45] },
    health: { sets: [2, 3], repsMin: 10, repsMax: 15, restSeconds: [45, 60] },
  };
}

/** Isométricos: plancha, side plank, wall sit, hollow hold. Reps = segundos de mantenimiento. */
export function rangesIsometric(): Partial<Record<Goal, RepRange>> {
  return {
    strength: { sets: [3, 4], repsMin: 30, repsMax: 60, restSeconds: [60, 90] },
    gain_muscle: { sets: [3, 4], repsMin: 30, repsMax: 45, restSeconds: [45, 60] },
    lose_fat: { sets: [3, 4], repsMin: 20, repsMax: 40, restSeconds: [30, 45] },
    endurance: { sets: [3, 4], repsMin: 45, repsMax: 90, restSeconds: [30, 45] },
    health: { sets: [2, 3], repsMin: 20, repsMax: 40, restSeconds: [45, 60] },
  };
}

/** Cardio continuo (trote, bici, remo, elíptica, caminata). Reps = minutos aproximados. */
export function rangesCardioSteady(): Partial<Record<Goal, RepRange>> {
  return {
    lose_fat: { sets: [1, 1], repsMin: 20, repsMax: 35, restSeconds: [0, 60] },
    gain_muscle: { sets: [1, 1], repsMin: 10, repsMax: 15, restSeconds: [60, 90] },
    strength: { sets: [1, 1], repsMin: 5, repsMax: 10, restSeconds: [60, 90] },
    endurance: { sets: [1, 1], repsMin: 25, repsMax: 45, restSeconds: [0, 60] },
    health: { sets: [1, 1], repsMin: 15, repsMax: 30, restSeconds: [0, 60] },
  };
}

/** Intervalos de alta intensidad (burpees, sprints, battle ropes, kettlebell swing). Reps = segundos de trabajo por ronda. */
export function rangesHiit(): Partial<Record<Goal, RepRange>> {
  return {
    lose_fat: { sets: [4, 6], repsMin: 20, repsMax: 40, restSeconds: [15, 30] },
    gain_muscle: { sets: [3, 5], repsMin: 20, repsMax: 30, restSeconds: [30, 45] },
    strength: { sets: [3, 4], repsMin: 10, repsMax: 20, restSeconds: [60, 90] },
    endurance: { sets: [5, 8], repsMin: 20, repsMax: 40, restSeconds: [15, 20] },
    health: { sets: [3, 5], repsMin: 20, repsMax: 30, restSeconds: [30, 45] },
  };
}

/** Movilidad dinámica y estiramientos. Reps = repeticiones o segundos de mantenimiento según el ejercicio. */
export function rangesMobility(): Partial<Record<Goal, RepRange>> {
  return {
    strength: { sets: [2, 3], repsMin: 15, repsMax: 20, restSeconds: [15, 30] },
    gain_muscle: { sets: [2, 3], repsMin: 15, repsMax: 20, restSeconds: [15, 30] },
    lose_fat: { sets: [2, 3], repsMin: 15, repsMax: 20, restSeconds: [15, 30] },
    endurance: { sets: [2, 3], repsMin: 20, repsMax: 30, restSeconds: [15, 30] },
    health: { sets: [2, 3], repsMin: 20, repsMax: 30, restSeconds: [15, 30] },
  };
}

/** Carries (paseo del granjero, carry unilateral). Reps = metros/pasos aproximados por serie. */
export function rangesCarry(): Partial<Record<Goal, RepRange>> {
  return {
    strength: { sets: [3, 4], repsMin: 20, repsMax: 30, restSeconds: [90, 120] },
    gain_muscle: { sets: [3, 4], repsMin: 20, repsMax: 40, restSeconds: [60, 75] },
    lose_fat: { sets: [3, 4], repsMin: 30, repsMax: 50, restSeconds: [30, 45] },
    endurance: { sets: [2, 3], repsMin: 40, repsMax: 60, restSeconds: [30, 45] },
    health: { sets: [2, 3], repsMin: 20, repsMax: 40, restSeconds: [45, 60] },
  };
}
