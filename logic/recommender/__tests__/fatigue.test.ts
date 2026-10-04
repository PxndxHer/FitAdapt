import type { Exercise } from "@/types";

import { estimateMuscleFatigue, muscleRecovery, RECOVERY_WINDOW_HOURS } from "../fatigue";
import type { RecentSetLog } from "../types";

const NOW = "2026-01-15T12:00:00.000Z";

function hoursAgoIso(hours: number): string {
  return new Date(new Date(NOW).getTime() - hours * 60 * 60 * 1000).toISOString();
}

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "test_exercise",
    name: "Ejercicio de prueba",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps"],
    type: "strength",
    equipment: ["bodyweight"],
    difficulty: 2,
    movementPattern: "horizontal_push",
    isCompound: true,
    isUnilateral: false,
    instructions: ["Paso 1"],
    commonMistakes: [],
    injuryFlags: [],
    recommendedRanges: {},
    secondsPerSet: 30,
    met: 4,
    easierVariantId: null,
    harderVariantId: null,
    imageKey: null,
    ...overrides,
  };
}

function setLog(overrides: Partial<RecentSetLog>): RecentSetLog {
  return { performedAt: NOW, exerciseId: "test_exercise", rpe: 8, ...overrides };
}

describe("estimateMuscleFatigue", () => {
  it("asigna fatiga máxima al músculo primario justo después de entrenar", () => {
    const exercise = makeExercise();
    const index = new Map([[exercise.id, exercise]]);
    const fatigue = estimateMuscleFatigue([setLog({ performedAt: NOW, rpe: 10 })], index, NOW);

    expect(fatigue.chest).toBeCloseTo(10, 5);
  });

  it("da la mitad de estímulo a los músculos secundarios", () => {
    const exercise = makeExercise();
    const index = new Map([[exercise.id, exercise]]);
    const fatigue = estimateMuscleFatigue([setLog({ performedAt: NOW, rpe: 10 })], index, NOW);

    expect(fatigue.triceps).toBeCloseTo(5, 5);
  });

  it("decae linealmente con el tiempo hasta la ventana de recuperación", () => {
    const exercise = makeExercise();
    const index = new Map([[exercise.id, exercise]]);

    const halfway = estimateMuscleFatigue([setLog({ performedAt: hoursAgoIso(RECOVERY_WINDOW_HOURS / 2), rpe: 10 })], index, NOW);
    expect(halfway.chest).toBeCloseTo(5, 5);
  });

  it("ignora series más viejas que la ventana de recuperación", () => {
    const exercise = makeExercise();
    const index = new Map([[exercise.id, exercise]]);

    const fatigue = estimateMuscleFatigue(
      [setLog({ performedAt: hoursAgoIso(RECOVERY_WINDOW_HOURS + 1), rpe: 10 })],
      index,
      NOW
    );
    expect(fatigue.chest ?? 0).toBe(0);
  });

  it("acumula el estímulo de varias series sin pasar de 100", () => {
    const exercise = makeExercise();
    const index = new Map([[exercise.id, exercise]]);

    const sets = Array.from({ length: 20 }, () => setLog({ performedAt: NOW, rpe: 10 }));
    const fatigue = estimateMuscleFatigue(sets, index, NOW);
    expect(fatigue.chest).toBe(100);
  });

  it("un músculo sin series recientes está totalmente recuperado", () => {
    const fatigue = estimateMuscleFatigue([], new Map(), NOW);
    expect(muscleRecovery(fatigue, "glutes")).toBe(1);
  });

  it("muscleRecovery es el inverso de la fatiga normalizada a 0-1", () => {
    const exercise = makeExercise();
    const index = new Map([[exercise.id, exercise]]);
    const fatigue = estimateMuscleFatigue([setLog({ performedAt: NOW, rpe: 10 })], index, NOW);

    expect(muscleRecovery(fatigue, "chest")).toBeCloseTo(0.9, 5);
  });
});
