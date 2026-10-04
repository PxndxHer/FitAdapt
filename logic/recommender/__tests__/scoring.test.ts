import type { Exercise } from "@/types";

import { estimateMuscleFatigue } from "../fatigue";
import { isEquipmentAvailable, isSafeForInjuries, scoreExercise } from "../scoring";
import type { RecentExerciseOutcome, RecommenderContext } from "../types";

const NOW = "2026-01-15T12:00:00.000Z";

function daysAgoIso(days: number): string {
  return new Date(new Date(NOW).getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "test_exercise",
    name: "Ejercicio de prueba",
    primaryMuscle: "chest",
    secondaryMuscles: [],
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

function makeContext(overrides: Partial<RecommenderContext> = {}): RecommenderContext {
  return {
    now: NOW,
    profile: {
      goal: "gain_muscle",
      experienceLevel: "intermediate",
      equipment: ["bodyweight", "dumbbells", "bands", "full_gym"],
      injuries: [],
    },
    exercises: [],
    recentSets: [],
    recentOutcomes: [],
    ...overrides,
  };
}

describe("isEquipmentAvailable / isSafeForInjuries", () => {
  it("excluye un ejercicio si no hay intersección de equipo", () => {
    const exercise = makeExercise({ equipment: ["full_gym"] });
    expect(isEquipmentAvailable(exercise, ["bodyweight", "dumbbells"])).toBe(false);
    expect(isEquipmentAvailable(exercise, ["full_gym", "dumbbells"])).toBe(true);
  });

  it("excluye un ejercicio que estresa una zona lesionada del perfil", () => {
    const exercise = makeExercise({ injuryFlags: ["knees"] });
    expect(isSafeForInjuries(exercise, ["knees"])).toBe(false);
    expect(isSafeForInjuries(exercise, ["shoulders"])).toBe(true);
    expect(isSafeForInjuries(exercise, [])).toBe(true);
  });
});

describe("scoreExercise", () => {
  it("puntúa más alto un ejercicio recuperado que uno recién entrenado", () => {
    const exercise = makeExercise();
    const index = new Map([[exercise.id, exercise]]);

    const fatigued = estimateMuscleFatigue([{ performedAt: NOW, exerciseId: exercise.id, rpe: 10 }], index, NOW);
    const recovered = estimateMuscleFatigue([{ performedAt: daysAgoIso(10), exerciseId: exercise.id, rpe: 10 }], index, NOW);

    const context = makeContext({ exercises: [exercise] });
    const scoredFatigued = scoreExercise(exercise, context, fatigued);
    const scoredRecovered = scoreExercise(exercise, context, recovered);

    expect(scoredRecovered.score).toBeGreaterThan(scoredFatigued.score);
  });

  it("menciona la recuperación muscular en la explicación cuando aplica", () => {
    const exercise = makeExercise();
    const context = makeContext({
      exercises: [exercise],
      recentOutcomes: [
        { performedAt: daysAgoIso(4), exerciseId: exercise.id, status: "completed", substitutedWithExerciseId: null },
      ],
    });

    const scored = scoreExercise(exercise, context, {});
    expect(scored.explanation).toContain("pecho");
    expect(scored.explanation).toMatch(/recuperado/);
  });

  it("penaliza un ejercicio que el usuario suele saltar o sustituir", () => {
    const exercise = makeExercise();
    const skippedOften: RecentExerciseOutcome[] = Array.from({ length: 5 }, () => ({
      performedAt: daysAgoIso(10),
      exerciseId: exercise.id,
      status: "skipped" as const,
      substitutedWithExerciseId: null,
    }));
    const completedOften: RecentExerciseOutcome[] = Array.from({ length: 5 }, () => ({
      performedAt: daysAgoIso(10),
      exerciseId: exercise.id,
      status: "completed" as const,
      substitutedWithExerciseId: null,
    }));

    const context = makeContext({ exercises: [exercise] });
    const scoredSkipped = scoreExercise(exercise, { ...context, recentOutcomes: skippedOften }, {});
    const scoredCompleted = scoreExercise(exercise, { ...context, recentOutcomes: completedOften }, {});

    expect(scoredCompleted.score).toBeGreaterThan(scoredSkipped.score);
  });

  it("penaliza la repetición excesiva de un ejercicio de aislamiento, pero no de un compuesto de fuerza principal", () => {
    const isolation = makeExercise({ id: "isolation", isCompound: false, type: "hypertrophy" });
    const mainLift = makeExercise({ id: "main_lift", isCompound: true, type: "strength" });

    const weeklyOutcomes = (id: string) =>
      Array.from({ length: 6 }, (_, i) => ({
        performedAt: daysAgoIso(i * 7),
        exerciseId: id,
        status: "completed" as const,
        substitutedWithExerciseId: null,
      }));

    const context = makeContext({ exercises: [isolation, mainLift] });

    const isolationFresh = scoreExercise(isolation, { ...context, recentOutcomes: [] }, {});
    const isolationRepeated = scoreExercise(isolation, { ...context, recentOutcomes: weeklyOutcomes("isolation") }, {});
    const mainLiftRepeated = scoreExercise(mainLift, { ...context, recentOutcomes: weeklyOutcomes("main_lift") }, {});

    expect(isolationRepeated.score).toBeLessThan(isolationFresh.score);
    // El compuesto de fuerza repetido cada semana no debería perder casi nada frente a uno fresco.
    const mainLiftFresh = scoreExercise(mainLift, { ...context, recentOutcomes: [] }, {});
    expect(mainLiftFresh.score - mainLiftRepeated.score).toBeLessThan(isolationFresh.score - isolationRepeated.score);
  });
});
