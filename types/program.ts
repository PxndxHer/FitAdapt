import type { Goal } from "./profile";

export type SplitType = "full_body" | "upper_lower" | "push_pull_legs";

export type ProgramStatus = "active" | "completed" | "archived";

export type ProgramExerciseSlot = {
  id: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRestSeconds: number;
  isWarmup: boolean;
  isCooldown: boolean;
  /** Carga actual sugerida; el motor adaptativo la va ajustando entre sesiones. */
  currentWeightKg: number | null;
};

export type ProgramDay = {
  id: string;
  dayIndex: number;
  name: string;
  exercises: ProgramExerciseSlot[];
};

export type WorkoutProgram = {
  id: string;
  name: string;
  goal: Goal;
  splitType: SplitType;
  daysPerWeek: number;
  sessionDurationMin: number;
  /** Duración del bloque en semanas (4-6), con la última siendo de descarga. */
  blockLengthWeeks: number;
  status: ProgramStatus;
  days: ProgramDay[];
  createdAt: string;
  activatedAt: string | null;
  deactivatedAt: string | null;
};
