import type { SQLiteDatabase } from "expo-sqlite";

import { SCHEMA_V1, SCHEMA_V2, SCHEMA_V3, SCHEMA_V4, SCHEMA_V5 } from "./schema";
import { seedDatabase } from "./seed";

/** Versión del esquema que espera el código actual. Sube esto al añadir una migración. */
const DATABASE_VERSION = 5;

/**
 * Crea o actualiza las tablas según la versión guardada en `PRAGMA user_version`.
 * Cada bloque `if (currentVersion === N)` es una migración incremental: se añaden
 * nuevas, nunca se edita una ya publicada, para no romper instalaciones existentes.
 * Al final siembra el dataset local de ejercicios (ver `seedDatabase`), lo que
 * también cubre la primera instalación, cuando `currentVersion` pasa de 0.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion < DATABASE_VERSION) {
    if (currentVersion === 0) {
      await db.execAsync(SCHEMA_V1);
      currentVersion = 1;
    }

    if (currentVersion === 1) {
      await db.execAsync(SCHEMA_V2);
      currentVersion = 2;
    }

    if (currentVersion === 2) {
      await db.execAsync(SCHEMA_V3);
      currentVersion = 3;
    }

    if (currentVersion === 3) {
      await db.execAsync(SCHEMA_V4);
      currentVersion = 4;
    }

    if (currentVersion === 4) {
      await db.execAsync(SCHEMA_V5);
      currentVersion = 5;
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }

  await seedDatabase(db);
}
