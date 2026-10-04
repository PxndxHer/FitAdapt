import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import type { PropsWithChildren } from "react";

import { migrateDbIfNeeded } from "./migrations";

const DATABASE_NAME = "fitadapt.db";

/**
 * Abre (o crea) la base de datos local y corre las migraciones pendientes
 * antes de montar el resto de la app. Usa Suspense: el padre debe envolver
 * esto en un <Suspense> con un fallback (ver app/_layout.tsx).
 */
export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded} useSuspense>
      {children}
    </SQLiteProvider>
  );
}

/** Acceso a la base de datos abierta. Solo válido dentro de <DatabaseProvider>. */
export function useDb(): SQLiteDatabase {
  return useSQLiteContext();
}
