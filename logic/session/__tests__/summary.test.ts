import type { SessionExercise, WorkoutSession } from "@/types";

import { buildSessionSummary } from "../summary";

function makeSessionExercise(overrides: Partial<SessionExercise>): SessionExercise {
  return {
    id: "se1",
    exerciseId: "bench_press_barbell",
    orderIndex: 0,
    status: "completed",
    substitutedWithExerciseId: null,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 12,
    targetRestSeconds: 90,
    sets: [],
    ...overrides,
  };
}

function makeSession(exercises: SessionExercise[]): WorkoutSession {
  return {
    id: "s1",
    programDayId: null,
    date: "2026-01-15",
    startedAt: "2026-01-15T10:00:00.000Z",
    endedAt: "2026-01-15T10:40:00.000Z",
    durationMin: 40,
    status: "completed",
    notes: null,
    currentExerciseIndex: exercises.length,
    exercises,
  };
}

describe("buildSessionSummary", () => {
  it("suma el volumen total y las series de ejercicios completados", () => {
    const session = makeSession([
      makeSessionExercise({
        sets: [
          { id: "s1", setIndex: 0, reps: 10, weightKg: 60, rpe: 7, completed: true },
          { id: "s2", setIndex: 1, reps: 10, weightKg: 60, rpe: 8, completed: true },
        ],
      }),
    ]);

    const summary = buildSessionSummary(
      session,
      new Map([["bench_press_barbell", { name: "Press de banca", met: 6 }]]),
      new Map(),
      80
    );

    expect(summary.totalSets).toBe(2);
    expect(summary.totalVolumeKg).toBe(1200); // 10*60 + 10*60
    expect(summary.estimatedCalories).toBeGreaterThan(0);
  });

  it("ignora ejercicios saltados o sin series", () => {
    const session = makeSession([
      makeSessionExercise({ id: "se1", exerciseId: "bench_press_barbell", status: "skipped", sets: [] }),
      makeSessionExercise({ id: "se2", exerciseId: "squat_bodyweight", status: "completed", sets: [] }),
    ]);

    const summary = buildSessionSummary(session, new Map(), new Map(), 80);

    expect(summary.totalSets).toBe(0);
    expect(summary.totalVolumeKg).toBe(0);
    expect(summary.estimatedCalories).toBe(0);
  });

  it("detecta un récord personal cuando una serie supera el historial", () => {
    const session = makeSession([
      makeSessionExercise({
        sets: [{ id: "s1", setIndex: 0, reps: 8, weightKg: 100, rpe: 8, completed: true }],
      }),
    ]);

    const summary = buildSessionSummary(
      session,
      new Map([["bench_press_barbell", { name: "Press de banca", met: 6 }]]),
      new Map([["bench_press_barbell", [{ reps: 8, weightKg: 80 }]]]),
      80
    );

    expect(summary.personalRecords).toHaveLength(1);
    expect(summary.personalRecords[0].exerciseName).toBe("Press de banca");
  });

  it("incluye sugerencias adaptativas por ejercicio completado", () => {
    const session = makeSession([
      makeSessionExercise({
        sets: [
          { id: "s1", setIndex: 0, reps: 10, weightKg: 60, rpe: 5, completed: true },
          { id: "s2", setIndex: 1, reps: 10, weightKg: 60, rpe: 5, completed: true },
        ],
      }),
    ]);

    const summary = buildSessionSummary(
      session,
      new Map([["bench_press_barbell", { name: "Press de banca", met: 6 }]]),
      new Map(),
      80
    );

    expect(summary.adaptiveHints).toHaveLength(1);
    expect(summary.adaptiveHints[0].suggestedWeightDeltaKg).toBeGreaterThan(0);
  });
});
