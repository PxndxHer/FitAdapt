import { create } from "zustand";

import type { ActiveExerciseState, ActiveSessionPhase, LoggedSetInput } from "@/logic/session";
import type { SessionExerciseStatus } from "@/types";

type ActiveSessionState = {
  sessionId: string | null;
  startedAtMs: number | null;
  exercises: ActiveExerciseState[];
  currentExerciseIndex: number;
  phase: ActiveSessionPhase;
  restEndAtMs: number | null;
  restNotificationId: string | null;

  hydrate: (input: {
    sessionId: string;
    startedAtMs: number;
    currentExerciseIndex: number;
    exercises: ActiveExerciseState[];
    phase?: ActiveSessionPhase;
  }) => void;
  setPhase: (phase: ActiveSessionPhase) => void;
  addLoggedSet: (set: LoggedSetInput) => void;
  startRest: (restEndAtMs: number, notificationId: string | null) => void;
  adjustRest: (deltaSeconds: number) => void;
  clearRest: () => void;
  setExerciseStatus: (status: SessionExerciseStatus) => void;
  goToNextExercise: () => void;
  reset: () => void;
};

const INITIAL = {
  sessionId: null as string | null,
  startedAtMs: null as number | null,
  exercises: [] as ActiveExerciseState[],
  currentExerciseIndex: 0,
  phase: "countdown" as ActiveSessionPhase,
  restEndAtMs: null as number | null,
  restNotificationId: null as string | null,
};

/**
 * Estado en memoria del entrenamiento en curso. La fuente de verdad durable
 * vive en SQLite (session_exercises/session_sets, ver db/sessionRepository):
 * este store es solo un espejo conveniente para la UI mientras la app está
 * abierta. Si la app se cierra, se reconstruye leyendo la base de datos
 * (ver `getActiveSession`), no desde aquí.
 */
export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  ...INITIAL,

  hydrate: (input) =>
    set({
      sessionId: input.sessionId,
      startedAtMs: input.startedAtMs,
      currentExerciseIndex: input.currentExerciseIndex,
      exercises: input.exercises,
      phase: input.phase ?? "countdown",
      restEndAtMs: null,
      restNotificationId: null,
    }),

  setPhase: (phase) => set({ phase }),

  addLoggedSet: (loggedSet) =>
    set((s) => {
      const current = s.exercises[s.currentExerciseIndex];
      if (!current) return s;
      const exercises = [...s.exercises];
      exercises[s.currentExerciseIndex] = { ...current, loggedSets: [...current.loggedSets, loggedSet] };
      return { exercises };
    }),

  startRest: (restEndAtMs, notificationId) => set({ phase: "resting", restEndAtMs, restNotificationId: notificationId }),

  adjustRest: (deltaSeconds) => set((s) => (s.restEndAtMs ? { restEndAtMs: s.restEndAtMs + deltaSeconds * 1000 } : s)),

  clearRest: () => set({ phase: "logging", restEndAtMs: null, restNotificationId: null }),

  setExerciseStatus: (status) =>
    set((s) => {
      const current = s.exercises[s.currentExerciseIndex];
      if (!current) return s;
      const exercises = [...s.exercises];
      exercises[s.currentExerciseIndex] = { ...current, status };
      return { exercises };
    }),

  goToNextExercise: () =>
    set((s) => {
      const nextIndex = s.currentExerciseIndex + 1;
      if (nextIndex >= s.exercises.length) return { phase: "done" };
      return { currentExerciseIndex: nextIndex, phase: "logging" };
    }),

  reset: () => set(INITIAL),
}));
