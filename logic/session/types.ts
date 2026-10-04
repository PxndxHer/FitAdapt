import type { Exercise, SessionExerciseStatus } from "@/types";

export type LoggedSetInput = { reps: number; weightKg: number; rpe: number };

export type ActiveExerciseState = {
  sessionExerciseId: string;
  exercise: Exercise;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRestSeconds: number;
  status: SessionExerciseStatus;
  loggedSets: LoggedSetInput[];
};

export type ActiveSessionPhase = "countdown" | "logging" | "resting" | "done";
