/**
 * Validador de la biblioteca de ejercicios. Corre con Node + tsx, sin
 * dependencias de Expo/React Native (`npm run validate:exercises`).
 *
 * Las listas cerradas de abajo deben mantenerse sincronizadas a mano con
 * `types/exercise.ts` (MuscleGroup, ExerciseType, MovementPattern) y
 * `types/profile.ts` (Equipment, InjuryArea, Goal).
 */
import { EXERCISES_SEED, EXERCISES_SEED_VERSION } from "./exercises.seed";

const MUSCLE_GROUPS = [
  "chest",
  "upper_back",
  "lats",
  "traps",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "lower_back",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
  "adductors",
  "abductors",
  "neck",
  "full_body",
] as const;

const EXERCISE_TYPES = ["strength", "hypertrophy", "cardio", "mobility", "hiit", "stretching"] as const;

const MOVEMENT_PATTERNS = [
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "squat",
  "hinge",
  "lunge",
  "core",
  "carry",
  "rotation",
  "isometric",
  "cardio",
] as const;

const EQUIPMENT = ["full_gym", "dumbbells", "bands", "bodyweight"] as const;

const INJURY_AREAS = ["lower_back", "knees", "shoulders", "wrists", "elbows", "neck", "hips", "ankles"] as const;

const GOALS = ["lose_fat", "gain_muscle", "strength", "endurance", "health"] as const;

const MIN_TOTAL_EXERCISES = 150;

type Issue = { id: string; field: string; message: string };

function set<T extends string>(values: readonly T[]): Set<string> {
  return new Set(values);
}

const muscleSet = set(MUSCLE_GROUPS);
const typeSet = set(EXERCISE_TYPES);
const patternSet = set(MOVEMENT_PATTERNS);
const equipmentSet = set(EQUIPMENT);
const injurySet = set(INJURY_AREAS);
const goalSet = set(GOALS);

function main(): void {
  const issues: Issue[] = [];
  const idCounts = new Map<string, number>();

  for (const exercise of EXERCISES_SEED) {
    idCounts.set(exercise.id, (idCounts.get(exercise.id) ?? 0) + 1);
  }

  const knownIds = new Set(EXERCISES_SEED.map((e) => e.id));

  for (const [id, count] of idCounts) {
    if (count > 1) {
      issues.push({ id, field: "id", message: `id duplicado (${count} veces)` });
    }
  }

  for (const exercise of EXERCISES_SEED) {
    const id = exercise.id || "(sin id)";

    if (!exercise.id || exercise.id.trim() === "") {
      issues.push({ id, field: "id", message: "id vacío" });
    }
    if (!exercise.name || exercise.name.trim() === "") {
      issues.push({ id, field: "name", message: "name vacío" });
    }
    if (!Array.isArray(exercise.instructions) || exercise.instructions.length === 0) {
      issues.push({ id, field: "instructions", message: "debe tener al menos 1 elemento" });
    } else if (exercise.instructions.some((s) => !s || s.trim() === "")) {
      issues.push({ id, field: "instructions", message: "contiene un paso vacío" });
    }
    if (!Array.isArray(exercise.commonMistakes)) {
      issues.push({ id, field: "commonMistakes", message: "debe existir como array (puede estar vacío)" });
    } else if (exercise.commonMistakes.some((s) => !s || s.trim() === "")) {
      issues.push({ id, field: "commonMistakes", message: "contiene un elemento vacío" });
    }

    if (!muscleSet.has(exercise.primaryMuscle)) {
      issues.push({ id, field: "primaryMuscle", message: `valor inválido: ${exercise.primaryMuscle}` });
    }
    if (!Array.isArray(exercise.secondaryMuscles)) {
      issues.push({ id, field: "secondaryMuscles", message: "debe ser un array" });
    } else {
      for (const m of exercise.secondaryMuscles) {
        if (!muscleSet.has(m)) {
          issues.push({ id, field: "secondaryMuscles", message: `valor inválido: ${m}` });
        }
      }
    }

    if (!typeSet.has(exercise.type)) {
      issues.push({ id, field: "type", message: `valor inválido: ${exercise.type}` });
    }

    if (!patternSet.has(exercise.movementPattern)) {
      issues.push({ id, field: "movementPattern", message: `valor inválido: ${exercise.movementPattern}` });
    }

    if (!Array.isArray(exercise.equipment) || exercise.equipment.length === 0) {
      issues.push({ id, field: "equipment", message: "debe tener al menos 1 elemento" });
    } else {
      for (const eq of exercise.equipment) {
        if (!equipmentSet.has(eq)) {
          issues.push({ id, field: "equipment", message: `valor inválido: ${eq}` });
        }
      }
    }

    if (!Array.isArray(exercise.injuryFlags)) {
      issues.push({ id, field: "injuryFlags", message: "debe ser un array" });
    } else {
      for (const inj of exercise.injuryFlags) {
        if (!injurySet.has(inj)) {
          issues.push({ id, field: "injuryFlags", message: `valor inválido: ${inj}` });
        }
      }
    }

    if (typeof exercise.difficulty !== "number" || exercise.difficulty < 1 || exercise.difficulty > 5) {
      issues.push({ id, field: "difficulty", message: `debe estar entre 1 y 5, recibido: ${exercise.difficulty}` });
    }

    if (typeof exercise.met !== "number" || exercise.met <= 0) {
      issues.push({ id, field: "met", message: `debe ser > 0, recibido: ${exercise.met}` });
    }

    if (typeof exercise.secondsPerSet !== "number" || exercise.secondsPerSet <= 0) {
      issues.push({ id, field: "secondsPerSet", message: `debe ser > 0, recibido: ${exercise.secondsPerSet}` });
    }

    if (typeof exercise.isCompound !== "boolean") {
      issues.push({ id, field: "isCompound", message: "debe ser boolean" });
    }
    if (typeof exercise.isUnilateral !== "boolean") {
      issues.push({ id, field: "isUnilateral", message: "debe ser boolean" });
    }

    if (exercise.easierVariantId !== null) {
      if (!knownIds.has(exercise.easierVariantId)) {
        issues.push({
          id,
          field: "easierVariantId",
          message: `apunta a un id inexistente: ${exercise.easierVariantId}`,
        });
      }
    }
    if (exercise.harderVariantId !== null) {
      if (!knownIds.has(exercise.harderVariantId)) {
        issues.push({
          id,
          field: "harderVariantId",
          message: `apunta a un id inexistente: ${exercise.harderVariantId}`,
        });
      }
    }

    if (exercise.imageKey !== null && typeof exercise.imageKey !== "string") {
      issues.push({ id, field: "imageKey", message: "debe ser null o string" });
    }

    const ranges = exercise.recommendedRanges;
    if (!ranges || typeof ranges !== "object") {
      issues.push({ id, field: "recommendedRanges", message: "falta el objeto de rangos" });
    } else {
      for (const goal of GOALS) {
        const range = ranges[goal];
        if (!range) {
          issues.push({ id, field: `recommendedRanges.${goal}`, message: "falta esta clave de Goal" });
          continue;
        }
        const { sets, repsMin, repsMax, restSeconds } = range;
        if (
          !Array.isArray(sets) ||
          sets.length !== 2 ||
          typeof sets[0] !== "number" ||
          typeof sets[1] !== "number"
        ) {
          issues.push({ id, field: `recommendedRanges.${goal}.sets`, message: "debe ser [number, number]" });
        } else if (sets[0] > sets[1]) {
          issues.push({ id, field: `recommendedRanges.${goal}.sets`, message: "mínimo mayor que máximo" });
        }

        if (typeof repsMin !== "number" || typeof repsMax !== "number") {
          issues.push({ id, field: `recommendedRanges.${goal}.reps`, message: "repsMin/repsMax deben ser numéricos" });
        } else if (repsMin > repsMax) {
          issues.push({ id, field: `recommendedRanges.${goal}.reps`, message: "repsMin mayor que repsMax" });
        }

        if (
          !Array.isArray(restSeconds) ||
          restSeconds.length !== 2 ||
          typeof restSeconds[0] !== "number" ||
          typeof restSeconds[1] !== "number"
        ) {
          issues.push({ id, field: `recommendedRanges.${goal}.restSeconds`, message: "debe ser [number, number]" });
        } else if (restSeconds[0] > restSeconds[1]) {
          issues.push({ id, field: `recommendedRanges.${goal}.restSeconds`, message: "mínimo mayor que máximo" });
        }
      }
    }

    // Referencia cruzada: goalSet se usa arriba vía GOALS; esto evita que el
    // import quede "sin usar" si en el futuro se valida de otra forma.
    void goalSet;
  }

  const total = EXERCISES_SEED.length;
  if (total < MIN_TOTAL_EXERCISES) {
    issues.push({
      id: "(dataset)",
      field: "total",
      message: `el dataset tiene ${total} ejercicios, se requieren al menos ${MIN_TOTAL_EXERCISES}`,
    });
  }

  if (issues.length > 0) {
    console.error(`\nSe encontraron ${issues.length} problema(s) de validación:\n`);
    for (const issue of issues) {
      console.error(`  [${issue.id}] ${issue.field}: ${issue.message}`);
    }
    console.error("");
    process.exit(1);
  }

  printSummary(total);
}

function printSummary(total: number): void {
  const byMuscle = countBy(EXERCISES_SEED.map((e) => e.primaryMuscle));
  const byType = countBy(EXERCISES_SEED.map((e) => e.type));
  const byEquipment = countBy(EXERCISES_SEED.flatMap((e) => e.equipment));

  console.log("Validación de EXERCISES_SEED: OK\n");
  console.log(`Versión del seed: ${EXERCISES_SEED_VERSION}`);
  console.log(`Total de ejercicios: ${total}\n`);

  console.log("Por grupo muscular primario:");
  for (const [key, count] of sortedEntries(byMuscle)) {
    console.log(`  ${key.padEnd(12)} ${count}`);
  }

  console.log("\nPor tipo de ejercicio:");
  for (const [key, count] of sortedEntries(byType)) {
    console.log(`  ${key.padEnd(12)} ${count}`);
  }

  console.log("\nPor equipo (un ejercicio puede contar en varios):");
  for (const [key, count] of sortedEntries(byEquipment)) {
    console.log(`  ${key.padEnd(12)} ${count}`);
  }
  console.log("");
}

function countBy(values: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const v of values) {
    result[v] = (result[v] ?? 0) + 1;
  }
  return result;
}

function sortedEntries(record: Record<string, number>): [string, number][] {
  return Object.entries(record).sort((a, b) => b[1] - a[1]);
}

main();
