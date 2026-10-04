import type { SQLiteDatabase } from "expo-sqlite";

import { createId } from "@/utils/id";

import type { SessionExerciseStatus, WorkoutSession } from "@/types";

import {
  rowToSessionExercise,
  rowToSessionSet,
  rowToWorkoutSession,
  type SessionExerciseRow,
  type SessionRow,
  type SessionSetRow,
} from "./rows";

export type SessionExercisePlan = {
  exerciseId: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRestSeconds: number;
};

export type StartedSession = { sessionId: string; startedAtMs: number; sessionExerciseIds: string[] };

/** Crea una sesión 'in_progress' con sus ejercicios en estado 'pending', en el orden dado. */
export async function startSession(db: SQLiteDatabase, plan: SessionExercisePlan[]): Promise<StartedSession> {
  const sessionId = createId();
  const now = new Date();
  const nowIso = now.toISOString();
  const dateStr = nowIso.slice(0, 10);
  const sessionExerciseIds = plan.map(() => createId());

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO workout_sessions (id, program_day_id, date, started_at, ended_at, duration_min, status, notes, current_exercise_index)
       VALUES (?, NULL, ?, ?, NULL, NULL, 'in_progress', NULL, 0)`,
      [sessionId, dateStr, nowIso]
    );

    for (const [index, item] of plan.entries()) {
      await db.runAsync(
        `INSERT INTO session_exercises (
          id, session_id, exercise_id, order_index, status, substituted_with_exercise_id,
          target_sets, target_reps_min, target_reps_max, target_rest_seconds
        ) VALUES (?, ?, ?, ?, 'pending', NULL, ?, ?, ?, ?)`,
        [sessionExerciseIds[index], sessionId, item.exerciseId, index, item.targetSets, item.targetRepsMin, item.targetRepsMax, item.targetRestSeconds]
      );
    }
  });

  return { sessionId, startedAtMs: now.getTime(), sessionExerciseIds };
}

async function hydrateSession(db: SQLiteDatabase, sessionRow: SessionRow): Promise<WorkoutSession> {
  const exerciseRows = await db.getAllAsync<SessionExerciseRow>(
    "SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_index ASC",
    [sessionRow.id]
  );

  const exercises = [];
  for (const exRow of exerciseRows) {
    const setRows = await db.getAllAsync<SessionSetRow>(
      "SELECT * FROM session_sets WHERE session_exercise_id = ? ORDER BY set_index ASC",
      [exRow.id]
    );
    exercises.push(rowToSessionExercise(exRow, setRows.map(rowToSessionSet)));
  }

  return rowToWorkoutSession(sessionRow, exercises);
}

/** La sesión sin terminar más reciente, o null. Se usa para ofrecer "continuar" al reabrir la app. */
export async function getActiveSession(db: SQLiteDatabase): Promise<WorkoutSession | null> {
  const sessionRow = await db.getFirstAsync<SessionRow>(
    "SELECT * FROM workout_sessions WHERE status = 'in_progress' ORDER BY started_at DESC LIMIT 1"
  );
  return sessionRow ? hydrateSession(db, sessionRow) : null;
}

export async function getSessionById(db: SQLiteDatabase, sessionId: string): Promise<WorkoutSession | null> {
  const sessionRow = await db.getFirstAsync<SessionRow>("SELECT * FROM workout_sessions WHERE id = ?", [sessionId]);
  return sessionRow ? hydrateSession(db, sessionRow) : null;
}

export async function logSet(
  db: SQLiteDatabase,
  sessionExerciseId: string,
  set: { setIndex: number; reps: number; weightKg: number; rpe: number }
): Promise<void> {
  await db.runAsync(
    "INSERT INTO session_sets (id, session_exercise_id, set_index, reps, weight_kg, rpe, completed) VALUES (?, ?, ?, ?, ?, ?, 1)",
    [createId(), sessionExerciseId, set.setIndex, set.reps, set.weightKg, set.rpe]
  );
}

export async function updateSessionExerciseStatus(
  db: SQLiteDatabase,
  sessionExerciseId: string,
  status: SessionExerciseStatus,
  substitutedWithExerciseId: string | null = null
): Promise<void> {
  await db.runAsync("UPDATE session_exercises SET status = ?, substituted_with_exercise_id = ? WHERE id = ?", [
    status,
    substitutedWithExerciseId,
    sessionExerciseId,
  ]);
}

export async function updateCurrentExerciseIndex(db: SQLiteDatabase, sessionId: string, index: number): Promise<void> {
  await db.runAsync("UPDATE workout_sessions SET current_exercise_index = ? WHERE id = ?", [index, sessionId]);
}

/** Marca la sesión como completada y calcula su duración real a partir de started_at. */
export async function finishSession(db: SQLiteDatabase, sessionId: string): Promise<WorkoutSession> {
  const session = await getSessionById(db, sessionId);
  if (!session) throw new Error("Sesión no encontrada");

  const startedAtMs = new Date(session.startedAt).getTime();
  const nowIso = new Date().toISOString();
  const durationMin = Math.max(1, Math.round((Date.now() - startedAtMs) / 60000));

  await db.runAsync("UPDATE workout_sessions SET status = 'completed', ended_at = ?, duration_min = ? WHERE id = ?", [
    nowIso,
    durationMin,
    sessionId,
  ]);

  const updated = await getSessionById(db, sessionId);
  if (!updated) throw new Error("Sesión no encontrada");
  return updated;
}

/** Series completadas históricamente para un ejercicio, excluyendo la sesión actual — para detectar récords personales. */
export async function getHistoricalSetsForExercise(
  db: SQLiteDatabase,
  exerciseId: string,
  excludeSessionId: string
): Promise<{ reps: number; weightKg: number }[]> {
  const rows = await db.getAllAsync<{ reps: number; weight_kg: number }>(
    `SELECT ss.reps, ss.weight_kg
     FROM session_sets ss
     JOIN session_exercises se ON se.id = ss.session_exercise_id
     WHERE se.exercise_id = ? AND se.session_id != ? AND ss.completed = 1`,
    [exerciseId, excludeSessionId]
  );
  return rows.map((r) => ({ reps: r.reps, weightKg: r.weight_kg }));
}
