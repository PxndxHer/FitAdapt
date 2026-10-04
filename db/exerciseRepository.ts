import type { SQLiteDatabase } from "expo-sqlite";

import type { Exercise } from "@/types";

import { rowToExercise, type ExerciseRow } from "./rows";

/** Todos los ejercicios ya sembrados en la base de datos (ver db/seed.ts), ordenados por nombre. */
export async function listExercises(db: SQLiteDatabase): Promise<Exercise[]> {
  const rows = await db.getAllAsync<ExerciseRow>("SELECT * FROM exercises ORDER BY name ASC");
  return rows.map(rowToExercise);
}

export async function getExerciseById(db: SQLiteDatabase, id: string): Promise<Exercise | null> {
  const row = await db.getFirstAsync<ExerciseRow>("SELECT * FROM exercises WHERE id = ?", [id]);
  return row ? rowToExercise(row) : null;
}
