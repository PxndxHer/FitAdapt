import type {
  Exercise,
  Profile,
  SessionExercise,
  SessionExerciseStatus,
  SessionSet,
  Settings,
  SessionStatus,
  WorkoutSession,
} from "@/types";

/**
 * Forma cruda de una fila de `exercises`: las columnas tipo lista/objeto
 * (equipment, secondary_muscles, instructions, common_mistakes, injury_flags,
 * recommended_ranges) llegan como JSON serializado en una columna TEXT, nunca
 * se filtran por su contenido en SQL.
 */
export type ExerciseRow = {
  id: string;
  name: string;
  primary_muscle: string;
  secondary_muscles: string;
  type: string;
  equipment: string;
  difficulty: number;
  movement_pattern: string;
  is_compound: number;
  is_unilateral: number;
  instructions: string;
  common_mistakes: string;
  injury_flags: string;
  recommended_ranges: string;
  seconds_per_set: number;
  met: number;
  image_key: string | null;
  easier_variant_id: string | null;
  harder_variant_id: string | null;
};

export function exerciseToRow(exercise: Exercise): ExerciseRow {
  return {
    id: exercise.id,
    name: exercise.name,
    primary_muscle: exercise.primaryMuscle,
    secondary_muscles: JSON.stringify(exercise.secondaryMuscles),
    type: exercise.type,
    equipment: JSON.stringify(exercise.equipment),
    difficulty: exercise.difficulty,
    movement_pattern: exercise.movementPattern,
    is_compound: exercise.isCompound ? 1 : 0,
    is_unilateral: exercise.isUnilateral ? 1 : 0,
    instructions: JSON.stringify(exercise.instructions),
    common_mistakes: JSON.stringify(exercise.commonMistakes),
    injury_flags: JSON.stringify(exercise.injuryFlags),
    recommended_ranges: JSON.stringify(exercise.recommendedRanges),
    seconds_per_set: exercise.secondsPerSet,
    met: exercise.met,
    image_key: exercise.imageKey,
    easier_variant_id: exercise.easierVariantId,
    harder_variant_id: exercise.harderVariantId,
  };
}

export function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    primaryMuscle: row.primary_muscle as Exercise["primaryMuscle"],
    secondaryMuscles: JSON.parse(row.secondary_muscles),
    type: row.type as Exercise["type"],
    equipment: JSON.parse(row.equipment),
    difficulty: row.difficulty as Exercise["difficulty"],
    movementPattern: row.movement_pattern as Exercise["movementPattern"],
    isCompound: row.is_compound === 1,
    isUnilateral: row.is_unilateral === 1,
    instructions: JSON.parse(row.instructions),
    commonMistakes: JSON.parse(row.common_mistakes),
    injuryFlags: JSON.parse(row.injury_flags),
    recommendedRanges: JSON.parse(row.recommended_ranges),
    secondsPerSet: row.seconds_per_set,
    met: row.met,
    imageKey: row.image_key,
    easierVariantId: row.easier_variant_id,
    harderVariantId: row.harder_variant_id,
  };
}

export type SessionRow = {
  id: string;
  program_day_id: string | null;
  date: string;
  started_at: string;
  ended_at: string | null;
  duration_min: number | null;
  status: string;
  notes: string | null;
  current_exercise_index: number;
};

export type SessionExerciseRow = {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  status: string;
  substituted_with_exercise_id: string | null;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  target_rest_seconds: number | null;
};

export type SessionSetRow = {
  id: string;
  session_exercise_id: string;
  set_index: number;
  reps: number;
  weight_kg: number;
  rpe: number;
  completed: number;
};

export function rowToSessionSet(row: SessionSetRow): SessionSet {
  return {
    id: row.id,
    setIndex: row.set_index,
    reps: row.reps,
    weightKg: row.weight_kg,
    rpe: row.rpe,
    completed: row.completed === 1,
  };
}

export function rowToSessionExercise(row: SessionExerciseRow, sets: SessionSet[]): SessionExercise {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    orderIndex: row.order_index,
    status: row.status as SessionExerciseStatus,
    substitutedWithExerciseId: row.substituted_with_exercise_id,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    targetRestSeconds: row.target_rest_seconds,
    sets,
  };
}

export function rowToWorkoutSession(row: SessionRow, exercises: SessionExercise[]): WorkoutSession {
  return {
    id: row.id,
    programDayId: row.program_day_id,
    date: row.date,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMin: row.duration_min,
    status: row.status as SessionStatus,
    notes: row.notes,
    currentExerciseIndex: row.current_exercise_index,
    exercises,
  };
}

export type SettingsRow = {
  id: number;
  units: string;
  theme_preference: string;
  notifications_enabled: number;
  sound_enabled: number;
  reminder_enabled: number;
  reminder_days: string;
  reminder_hour: number;
  reminder_minute: number;
};

export function rowToSettings(row: SettingsRow): Settings {
  return {
    units: row.units as Settings["units"],
    themePreference: row.theme_preference as Settings["themePreference"],
    notificationsEnabled: row.notifications_enabled === 1,
    soundEnabled: row.sound_enabled === 1,
    reminderEnabled: row.reminder_enabled === 1,
    reminderDays: JSON.parse(row.reminder_days),
    reminderHour: row.reminder_hour,
    reminderMinute: row.reminder_minute,
  };
}

/** Fila única (id = 1) de la tabla `profile`. */
export type ProfileRow = {
  id: number;
  name: string;
  sex: string;
  birth_date: string;
  height_cm: number;
  weight_kg: number;
  experience_level: string;
  goal: string;
  days_per_week: number;
  session_duration_min: number;
  equipment: string;
  injuries: string;
  created_at: string;
  updated_at: string;
};

export function rowToProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    sex: row.sex as Profile["sex"],
    birthDate: row.birth_date,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    experienceLevel: row.experience_level as Profile["experienceLevel"],
    goal: row.goal as Profile["goal"],
    daysPerWeek: row.days_per_week,
    sessionDurationMin: row.session_duration_min,
    equipment: JSON.parse(row.equipment),
    injuries: JSON.parse(row.injuries),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
