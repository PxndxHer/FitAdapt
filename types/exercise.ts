import type { Equipment, Goal, InjuryArea } from "./profile";

export type MuscleGroup =
  | "chest"
  | "upper_back"
  | "lats"
  | "traps"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "lower_back"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves"
  | "adductors"
  | "abductors"
  | "neck"
  | "full_body";

export type ExerciseType = "strength" | "hypertrophy" | "cardio" | "mobility" | "hiit" | "stretching";

export type MovementPattern =
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "lunge"
  | "core"
  | "carry"
  | "rotation"
  | "isometric"
  | "cardio";

/** Rango recomendado de series/reps/descanso para un objetivo concreto. */
export type RepRange = {
  sets: [number, number];
  repsMin: number;
  repsMax: number;
  restSeconds: [number, number];
};

export type Exercise = {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  type: ExerciseType;
  equipment: Equipment[];
  /** 1 = muy fácil, 5 = muy avanzado. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  movementPattern: MovementPattern;
  /** Compuesto (involucra varias articulaciones) vs. de aislamiento (una sola). */
  isCompound: boolean;
  /** Se entrena un lado del cuerpo a la vez (ej. zancada, remo a una mano). */
  isUnilateral: boolean;
  instructions: string[];
  commonMistakes: string[];
  /** Zonas articulares que este ejercicio estresa; el recomendador las cruza con las lesiones del perfil. */
  injuryFlags: InjuryArea[];
  /** Series/reps/descanso recomendados según el objetivo del usuario. Puede faltar algún objetivo si no aplica. */
  recommendedRanges: Partial<Record<Goal, RepRange>>;
  /** Duración estimada de una serie activa, en segundos (sin contar el descanso). */
  secondsPerSet: number;
  /** MET aproximado, usado para estimar calorías quemadas. */
  met: number;
  easierVariantId: string | null;
  harderVariantId: string | null;
  /** Clave de imagen/animación local empaquetada (Fase D). null = usar ilustración genérica del grupo muscular. */
  imageKey: string | null;
};
