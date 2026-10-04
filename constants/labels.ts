import type { Equipment, ExerciseType, ExperienceLevel, Goal, MuscleGroup } from "@/types";

/** Nombres en español de cada valor de enum del dominio, para mostrar en cualquier pantalla. */

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "pecho",
  upper_back: "espalda alta",
  lats: "dorsales",
  traps: "trapecios",
  shoulders: "hombro",
  biceps: "bíceps",
  triceps: "tríceps",
  forearms: "antebrazo",
  abs: "abdomen",
  obliques: "oblicuos",
  lower_back: "espalda baja",
  glutes: "glúteo",
  quads: "cuádriceps",
  hamstrings: "isquiotibiales",
  calves: "pantorrilla",
  adductors: "aductores",
  abductors: "abductores",
  neck: "cuello",
  full_body: "cuerpo completo",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bodyweight: "Peso corporal",
  dumbbells: "Mancuernas",
  bands: "Bandas",
  full_gym: "Gimnasio completo",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose_fat: "Perder grasa",
  gain_muscle: "Ganar músculo",
  strength: "Ganar fuerza",
  endurance: "Mejorar resistencia",
  health: "Salud general",
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  strength: "Fuerza",
  hypertrophy: "Hipertrofia",
  cardio: "Cardio",
  hiit: "HIIT",
  mobility: "Movilidad",
  stretching: "Estiramiento",
};
