export type SessionExerciseStatus = "pending" | "completed" | "skipped" | "substituted";

export type SessionStatus = "in_progress" | "completed" | "skipped";

export type SessionSet = {
  id: string;
  setIndex: number;
  /** Repeticiones, o segundos sostenidos para ejercicios isométricos. */
  reps: number;
  weightKg: number;
  /** Esfuerzo percibido, 1-10. */
  rpe: number;
  completed: boolean;
};

export type SessionExercise = {
  id: string;
  exerciseId: string;
  orderIndex: number;
  status: SessionExerciseStatus;
  substitutedWithExerciseId: string | null;
  /** Objetivo planeado para este ejercicio (de la recomendación que armó la sesión). */
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetRestSeconds: number | null;
  sets: SessionSet[];
};

export type WorkoutSession = {
  id: string;
  programDayId: string | null;
  date: string;
  startedAt: string;
  endedAt: string | null;
  durationMin: number | null;
  status: SessionStatus;
  notes: string | null;
  /** Índice (0-based) del ejercicio en curso; permite reanudar donde se quedó. */
  currentExerciseIndex: number;
  exercises: SessionExercise[];
};
