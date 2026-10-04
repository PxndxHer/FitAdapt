import { EXERCISES_SEED } from "@/data/exercises.seed";

import { generateQuickWorkout, recommendTodayWorkout, suggestRestOrMobilityDay, suggestSubstitutes } from "../recommend";
import type { RecentSetLog, RecommenderContext } from "../types";

/**
 * Pruebas de integración del recomendador contra el dataset real de 160+
 * ejercicios (Fase B), para los perfiles que pide la Fase C: principiante en
 * casa, avanzado en gimnasio, y usuario con una lesión de rodilla.
 */

const NOW = "2026-01-15T12:00:00.000Z";

function baseContext(overrides: Partial<RecommenderContext> = {}): RecommenderContext {
  return {
    now: NOW,
    profile: {
      goal: "health",
      experienceLevel: "intermediate",
      equipment: ["bodyweight"],
      injuries: [],
    },
    exercises: EXERCISES_SEED,
    recentSets: [],
    recentOutcomes: [],
    ...overrides,
  };
}

describe("recommendTodayWorkout", () => {
  it("principiante en casa: solo propone ejercicios de peso corporal y de dificultad accesible", () => {
    const context = baseContext({
      profile: { goal: "health", experienceLevel: "beginner", equipment: ["bodyweight"], injuries: [] },
    });

    const workout = recommendTodayWorkout(context, { availableMinutes: 30 });

    expect(workout.slots.length).toBeGreaterThan(0);
    for (const slot of workout.slots) {
      expect(slot.exercise.equipment).toContain("bodyweight");
      expect(slot.exercise.difficulty).toBeLessThanOrEqual(3);
    }
  });

  it("avanzado en gimnasio con objetivo de fuerza: incluye ejercicios compuestos de gimnasio completo", () => {
    const context = baseContext({
      profile: {
        goal: "strength",
        experienceLevel: "advanced",
        equipment: ["bodyweight", "dumbbells", "bands", "full_gym"],
        injuries: [],
      },
    });

    const workout = recommendTodayWorkout(context, { availableMinutes: 60 });

    expect(workout.slots.length).toBeGreaterThan(0);
    const hasFullGymCompound = workout.slots.some(
      (s) => s.exercise.equipment.includes("full_gym") && s.exercise.isCompound
    );
    expect(hasFullGymCompound).toBe(true);
  });

  it("usuario con lesión de rodilla: nunca incluye un ejercicio que estrese la rodilla", () => {
    const context = baseContext({
      profile: {
        goal: "gain_muscle",
        experienceLevel: "intermediate",
        equipment: ["bodyweight", "dumbbells", "bands", "full_gym"],
        injuries: ["knees"],
      },
    });

    const workout = recommendTodayWorkout(context, { availableMinutes: 45 });

    expect(workout.slots.length).toBeGreaterThan(0);
    for (const slot of workout.slots) {
      expect(slot.exercise.injuryFlags).not.toContain("knees");
    }
  });

  it("respeta aproximadamente el tiempo disponible y nunca devuelve un entrenamiento vacío", () => {
    const context = baseContext();
    const short = recommendTodayWorkout(context, { availableMinutes: 10 });
    const long = recommendTodayWorkout(context, { availableMinutes: 60 });

    expect(short.slots.length).toBeGreaterThan(0);
    expect(long.slots.length).toBeGreaterThanOrEqual(short.slots.length);
  });
});

describe("generateQuickWorkout", () => {
  it("filtra por grupo muscular elegido", () => {
    const context = baseContext({
      profile: { goal: "gain_muscle", experienceLevel: "intermediate", equipment: ["dumbbells", "bodyweight"], injuries: [] },
    });

    const workout = generateQuickWorkout(context, { muscleGroup: "chest" }, { availableMinutes: 20 });

    expect(workout.slots.length).toBeGreaterThan(0);
    for (const slot of workout.slots) {
      const involvesChest = slot.exercise.primaryMuscle === "chest" || slot.exercise.secondaryMuscles.includes("chest");
      expect(involvesChest).toBe(true);
    }
  });

  it("filtra por tipo de ejercicio elegido", () => {
    const context = baseContext({
      profile: { goal: "lose_fat", experienceLevel: "intermediate", equipment: ["bodyweight"], injuries: [] },
    });

    const workout = generateQuickWorkout(context, { type: "mobility" }, { availableMinutes: 15 });

    expect(workout.slots.length).toBeGreaterThan(0);
    for (const slot of workout.slots) {
      expect(slot.exercise.type).toBe("mobility");
    }
  });
});

describe("suggestSubstitutes", () => {
  it("sugiere alternativas del mismo músculo o patrón, sin estresar una zona lesionada", () => {
    const squat = EXERCISES_SEED.find((e) => e.id === "back_squat_barbell");
    expect(squat).toBeDefined();

    const context = baseContext({
      profile: {
        goal: "strength",
        experienceLevel: "advanced",
        equipment: ["bodyweight", "dumbbells", "bands", "full_gym"],
        injuries: ["knees"],
      },
    });

    const substitutes = suggestSubstitutes("back_squat_barbell", context, 3);

    expect(substitutes.length).toBeGreaterThan(0);
    for (const sub of substitutes) {
      expect(sub.exercise.id).not.toBe("back_squat_barbell");
      expect(sub.exercise.injuryFlags).not.toContain("knees");
    }
  });

  it("devuelve una lista vacía si el ejercicio original no existe", () => {
    const context = baseContext();
    expect(suggestSubstitutes("ejercicio_inexistente", context)).toEqual([]);
  });
});

describe("suggestRestOrMobilityDay", () => {
  it("sugiere descanso cuando la fatiga reciente es muy alta en varios músculos", () => {
    const heavyRecentSets: RecentSetLog[] = EXERCISES_SEED.filter((e) => e.type === "strength")
      .slice(0, 6)
      .flatMap((e) =>
        Array.from({ length: 4 }, () => ({ performedAt: NOW, exerciseId: e.id, rpe: 9 }))
      );

    const context = baseContext({ recentSets: heavyRecentSets });
    const suggestion = suggestRestOrMobilityDay(context);

    expect(suggestion.shouldRest).toBe(true);
    expect(suggestion.suggestedExercises.length).toBeGreaterThan(0);
    for (const s of suggestion.suggestedExercises) {
      expect(["mobility", "stretching"]).toContain(s.exercise.type);
    }
  });

  it("no sugiere descanso cuando no hay fatiga reciente", () => {
    const context = baseContext({ recentSets: [] });
    const suggestion = suggestRestOrMobilityDay(context);

    expect(suggestion.shouldRest).toBe(false);
    expect(suggestion.suggestedExercises).toEqual([]);
  });
});
