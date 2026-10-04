import type { SQLiteDatabase } from "expo-sqlite";

import { EXERCISES_SEED, EXERCISES_SEED_VERSION } from "@/data/exercises.seed";

import { exerciseToRow } from "./rows";

const EXERCISES_DATASET_KEY = "exercises";

/**
 * Inserta o actualiza los ejercicios del dataset local empaquetado con la app.
 * El contenido de un ejercicio (nombre, instrucciones, rangos, etc.) es datos
 * de la app, no del usuario, así que cada versión del dataset lo sobrescribe
 * por completo (UPSERT). Lo que nunca se toca es el id: `program_exercises` y
 * `session_exercises` solo guardan una referencia a él, así que una
 * actualización puede agregar ejercicios nuevos o corregir los existentes sin
 * romper ni borrar el historial del usuario.
 */
export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ version: number }>(
    "SELECT version FROM dataset_versions WHERE key = ?",
    [EXERCISES_DATASET_KEY]
  );
  const installedVersion = row?.version ?? 0;

  if (installedVersion >= EXERCISES_SEED_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const exercise of EXERCISES_SEED) {
      const r = exerciseToRow(exercise);
      await db.runAsync(
        `INSERT INTO exercises (
          id, name, primary_muscle, secondary_muscles, type, equipment,
          difficulty, movement_pattern, is_compound, is_unilateral,
          instructions, common_mistakes, injury_flags, recommended_ranges,
          seconds_per_set, met, image_key, easier_variant_id, harder_variant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          primary_muscle = excluded.primary_muscle,
          secondary_muscles = excluded.secondary_muscles,
          type = excluded.type,
          equipment = excluded.equipment,
          difficulty = excluded.difficulty,
          movement_pattern = excluded.movement_pattern,
          is_compound = excluded.is_compound,
          is_unilateral = excluded.is_unilateral,
          instructions = excluded.instructions,
          common_mistakes = excluded.common_mistakes,
          injury_flags = excluded.injury_flags,
          recommended_ranges = excluded.recommended_ranges,
          seconds_per_set = excluded.seconds_per_set,
          met = excluded.met,
          image_key = excluded.image_key,
          easier_variant_id = excluded.easier_variant_id,
          harder_variant_id = excluded.harder_variant_id`,
        [
          r.id,
          r.name,
          r.primary_muscle,
          r.secondary_muscles,
          r.type,
          r.equipment,
          r.difficulty,
          r.movement_pattern,
          r.is_compound,
          r.is_unilateral,
          r.instructions,
          r.common_mistakes,
          r.injury_flags,
          r.recommended_ranges,
          r.seconds_per_set,
          r.met,
          r.image_key,
          r.easier_variant_id,
          r.harder_variant_id,
        ]
      );
    }

    await db.runAsync(
      `INSERT INTO dataset_versions (key, version) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET version = excluded.version`,
      [EXERCISES_DATASET_KEY, EXERCISES_SEED_VERSION]
    );
  });
}
