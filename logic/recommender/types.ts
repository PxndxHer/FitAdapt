import type { Equipment, Exercise, ExperienceLevel, Goal, InjuryArea, MuscleGroup } from "@/types";

/** Una serie ya registrada por el usuario; se usa para estimar la fatiga muscular reciente. */
export type RecentSetLog = {
  /** Fecha y hora ISO en que se completó la serie. */
  performedAt: string;
  exerciseId: string;
  /** Esfuerzo percibido 1-10. */
  rpe: number;
};

/** Qué pasó con un ejercicio la última vez que apareció en un entrenamiento (preferencias + variedad). */
export type RecentExerciseOutcome = {
  performedAt: string;
  exerciseId: string;
  status: "completed" | "skipped" | "substituted";
  /** Si status es "substituted", el ejercicio que el usuario eligió en su lugar. */
  substitutedWithExerciseId: string | null;
};

export type RecommenderProfile = {
  goal: Goal;
  experienceLevel: ExperienceLevel;
  equipment: Equipment[];
  injuries: InjuryArea[];
};

/**
 * Todo lo que el recomendador necesita para decidir. Ningún dato se lee de
 * la base de datos aquí: las funciones de `logic/recommender` son puras y
 * reciben esto ya armado (por quien las llame desde la UI o desde pruebas).
 */
export type RecommenderContext = {
  /** Fecha/hora actual en ISO. Se recibe como parámetro -nunca `Date.now()` interno- para que todo sea determinista y testeable. */
  now: string;
  profile: RecommenderProfile;
  exercises: Exercise[];
  recentSets: RecentSetLog[];
  recentOutcomes: RecentExerciseOutcome[];
};

export type ScoredExercise = {
  exercise: Exercise;
  /** 0 a 1 aproximadamente (puede pasarse levemente según los pesos). */
  score: number;
  /** Explicaciones candidatas, de más a menos relevante. */
  reasons: string[];
  /** La razón principal, lista para mostrarse en la UI. */
  explanation: string;
};

export type RecommendedSlot = {
  exercise: Exercise;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRestSeconds: number;
  explanation: string;
};

export type RecommendedWorkout = {
  slots: RecommendedSlot[];
  estimatedMinutes: number;
};

/** 0 = totalmente recuperado, 100 = muy fatigado. */
export type MuscleFatigueMap = Partial<Record<MuscleGroup, number>>;
