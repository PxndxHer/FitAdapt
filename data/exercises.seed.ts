import type { Exercise } from "@/types";
import { CARDIO_EXERCISES } from "./exercises/cardio";
import { CORE_EXERCISES } from "./exercises/core";
import { HINGE_EXERCISES } from "./exercises/hinge";
import { LEGS_EXERCISES } from "./exercises/legs";
import { MISC_EXERCISES } from "./exercises/misc";
import { MOBILITY_EXERCISES } from "./exercises/mobility";
import { PULL_EXERCISES } from "./exercises/pull";
import { PUSH_EXERCISES } from "./exercises/push";

/**
 * Semilla de ejercicios para que el generador de programas y el registro de
 * entrenamientos tengan datos reales desde el primer arranque. Se inserta
 * una sola vez (ver `db/seed.ts`); cada ejercicio nuevo que llegue en una
 * fase futura se agrega sin tocar los ids ya usados, para no romper
 * referencias desde `program_exercises` o el historial del usuario.
 *
 * Fase B: ampliada de ~30 a 150+ ejercicios. El contenido se organiza en
 * `data/exercises/*.ts` por patrón de movimiento / grupo muscular dominante
 * y se combina aquí. Los ids originales de la Fase A se conservaron.
 *
 * v3: 123 ejercicios ganaron una foto real (`imageKey`), emparejados contra
 * el dataset público free-exercise-db (ver assets/exercises/).
 */
export const EXERCISES_SEED_VERSION = 3;

export const EXERCISES_SEED: Exercise[] = [
  ...PUSH_EXERCISES,
  ...PULL_EXERCISES,
  ...LEGS_EXERCISES,
  ...HINGE_EXERCISES,
  ...CORE_EXERCISES,
  ...CARDIO_EXERCISES,
  ...MOBILITY_EXERCISES,
  ...MISC_EXERCISES,
];
