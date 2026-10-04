import type { SQLiteDatabase } from "expo-sqlite";

import type { Profile, ProfileInput } from "@/types";

import { rowToProfile, type ProfileRow } from "./rows";

/** El perfil vive en una única fila con id = 1 (ver schema); null si todavía no se completó el onboarding. */
export async function getProfile(db: SQLiteDatabase): Promise<Profile | null> {
  const row = await db.getFirstAsync<ProfileRow>("SELECT * FROM profile WHERE id = 1");
  return row ? rowToProfile(row) : null;
}

/** Crea el perfil la primera vez (onboarding) o lo reemplaza por completo si ya existía. */
export async function saveProfile(db: SQLiteDatabase, input: ProfileInput): Promise<Profile> {
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<{ created_at: string }>("SELECT created_at FROM profile WHERE id = 1");
  const createdAt = existing?.created_at ?? now;

  await db.runAsync(
    `INSERT INTO profile (
      id, name, sex, birth_date, height_cm, weight_kg, experience_level, goal,
      days_per_week, session_duration_min, equipment, injuries, created_at, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      sex = excluded.sex,
      birth_date = excluded.birth_date,
      height_cm = excluded.height_cm,
      weight_kg = excluded.weight_kg,
      experience_level = excluded.experience_level,
      goal = excluded.goal,
      days_per_week = excluded.days_per_week,
      session_duration_min = excluded.session_duration_min,
      equipment = excluded.equipment,
      injuries = excluded.injuries,
      updated_at = excluded.updated_at`,
    [
      input.name,
      input.sex,
      input.birthDate,
      input.heightCm,
      input.weightKg,
      input.experienceLevel,
      input.goal,
      input.daysPerWeek,
      input.sessionDurationMin,
      JSON.stringify(input.equipment),
      JSON.stringify(input.injuries),
      createdAt,
      now,
    ]
  );

  const saved = await getProfile(db);
  if (!saved) {
    throw new Error("No se pudo guardar el perfil");
  }
  return saved;
}
