export type AdaptiveAdjustmentType =
  | "load_increase"
  | "load_decrease"
  | "exercise_replaced"
  | "program_restructure"
  | "calorie_adjustment"
  | "volume_adjustment"
  | "deload_suggestion";

export type AdaptiveAdjustment = {
  id: string;
  createdAt: string;
  type: AdaptiveAdjustmentType;
  exerciseId: string | null;
  programId: string | null;
  /** Explicación en lenguaje sencillo, lista para mostrarse al usuario. */
  message: string;
  /** Valores antes/después u otro contexto, específico de cada `type`. */
  details: Record<string, unknown>;
};
