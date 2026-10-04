export type Sex = "male" | "female";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type Goal = "lose_fat" | "gain_muscle" | "strength" | "endurance" | "health";

export type Equipment = "full_gym" | "dumbbells" | "bands" | "bodyweight";

/** Zonas del cuerpo que el generador de programas debe evitar sobrecargar. */
export type InjuryArea =
  | "lower_back"
  | "knees"
  | "shoulders"
  | "wrists"
  | "elbows"
  | "neck"
  | "hips"
  | "ankles";

export type Profile = {
  name: string;
  sex: Sex;
  /** Fecha de nacimiento en formato ISO (YYYY-MM-DD). */
  birthDate: string;
  heightCm: number;
  weightKg: number;
  experienceLevel: ExperienceLevel;
  goal: Goal;
  daysPerWeek: number;
  sessionDurationMin: number;
  equipment: Equipment[];
  injuries: InjuryArea[];
  createdAt: string;
  updatedAt: string;
};

/** Datos de perfil antes de guardarse (sin timestamps, que pone la capa de datos). */
export type ProfileInput = Omit<Profile, "createdAt" | "updatedAt">;
