/**
 * Esquema de la base de datos local (SQLite), versión 1.
 *
 * Columnas con nombre en plural como `equipment`/`injuries`/`instructions`
 * guardan JSON serializado en una columna TEXT: SQLite no tiene tipo array
 * y estos valores siempre se leen/escriben completos desde la app, nunca
 * se filtran por su contenido en SQL. Las conversiones viven en `db/rows.ts`.
 */

export const SCHEMA_V1 = `
PRAGMA journal_mode = 'wal';

-- Fila única (id = 1) con los datos físicos y preferencias de entrenamiento del usuario.
CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  birth_date TEXT NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  goal TEXT NOT NULL CHECK (goal IN ('lose_fat', 'gain_muscle', 'strength', 'endurance', 'health')),
  days_per_week INTEGER NOT NULL,
  session_duration_min INTEGER NOT NULL,
  equipment TEXT NOT NULL,
  injuries TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Fila única (id = 1) con preferencias generales, editables en Ajustes (fase 9).
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  units TEXT NOT NULL DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  theme_preference TEXT NOT NULL DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  notifications_enabled INTEGER NOT NULL DEFAULT 0
);

-- Biblioteca de ejercicios (fase 4). Las variantes se enlazan a otro ejercicio por id.
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  primary_muscle TEXT NOT NULL,
  secondary_muscles TEXT NOT NULL DEFAULT '[]',
  type TEXT NOT NULL CHECK (type IN ('strength', 'cardio', 'mobility')),
  equipment TEXT NOT NULL DEFAULT '[]',
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  movement_pattern TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '[]',
  common_mistakes TEXT NOT NULL DEFAULT '[]',
  injury_flags TEXT NOT NULL DEFAULT '[]',
  easier_variant_id TEXT REFERENCES exercises(id) ON DELETE SET NULL,
  harder_variant_id TEXT REFERENCES exercises(id) ON DELETE SET NULL
);

-- Programa de entrenamiento generado (fase 5). Un bloque de 4-6 semanas.
CREATE TABLE programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  split_type TEXT NOT NULL CHECK (split_type IN ('full_body', 'upper_lower', 'push_pull_legs')),
  days_per_week INTEGER NOT NULL,
  session_duration_min INTEGER NOT NULL,
  block_length_weeks INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TEXT NOT NULL,
  activated_at TEXT,
  deactivated_at TEXT
);

-- Un día de entrenamiento dentro de la semana de un programa (ej. "Empuje").
CREATE TABLE program_days (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  name TEXT NOT NULL
);

-- Ejercicio asignado a un día de programa, con su objetivo de series/reps/descanso
-- y la carga vigente (current_weight_kg), que el motor adaptativo va actualizando.
CREATE TABLE program_exercises (
  id TEXT PRIMARY KEY,
  program_day_id TEXT NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  target_sets INTEGER NOT NULL,
  target_reps_min INTEGER NOT NULL,
  target_reps_max INTEGER NOT NULL,
  target_rest_seconds INTEGER NOT NULL,
  is_warmup INTEGER NOT NULL DEFAULT 0,
  is_cooldown INTEGER NOT NULL DEFAULT 0,
  current_weight_kg REAL
);

-- Un entrenamiento realizado (o saltado) por el usuario (fase 6).
CREATE TABLE workout_sessions (
  id TEXT PRIMARY KEY,
  program_day_id TEXT REFERENCES program_days(id),
  date TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_min INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'skipped')),
  notes TEXT
);

-- Un ejercicio dentro de ese entrenamiento: completado, saltado o sustituido.
CREATE TABLE session_exercises (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'skipped', 'substituted')),
  substituted_with_exercise_id TEXT REFERENCES exercises(id)
);

-- Cada serie registrada: reps, peso y RPE (esfuerzo percibido 1-10).
CREATE TABLE session_sets (
  id TEXT PRIMARY KEY,
  session_exercise_id TEXT NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  set_index INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_kg REAL NOT NULL,
  rpe INTEGER NOT NULL CHECK (rpe BETWEEN 1 AND 10),
  completed INTEGER NOT NULL DEFAULT 1
);

-- Registro periódico de peso corporal y medidas opcionales (fase 6/7).
CREATE TABLE body_measurements (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  waist_cm REAL,
  hip_cm REAL,
  notes TEXT
);

-- Historial de decisiones del motor adaptativo, con explicación en español (fase 7).
CREATE TABLE adaptive_adjustments (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'load_increase', 'load_decrease', 'exercise_replaced', 'program_restructure',
    'calorie_adjustment', 'volume_adjustment', 'deload_suggestion'
  )),
  exercise_id TEXT REFERENCES exercises(id),
  program_id TEXT REFERENCES programs(id),
  message TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_program_days_program ON program_days(program_id);
CREATE INDEX idx_program_exercises_day ON program_exercises(program_day_id);
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX idx_session_sets_session_exercise ON session_sets(session_exercise_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(date);
CREATE INDEX idx_body_measurements_date ON body_measurements(date);
CREATE INDEX idx_adaptive_adjustments_created_at ON adaptive_adjustments(created_at);
`;

/**
 * Esquema v2: registra la versión de cada dataset local (ejercicios, y los
 * que se agreguen a futuro) ya insertado en esta base de datos. Permite que
 * una actualización de la app amplíe el dataset (ver Fase B) agregando solo
 * las filas nuevas, sin duplicar ni borrar el historial del usuario.
 */
export const SCHEMA_V2 = `
CREATE TABLE dataset_versions (
  key TEXT PRIMARY KEY,
  version INTEGER NOT NULL
);
`;

/**
 * Esquema v3: amplía `exercises` con los metadatos que necesita el motor de
 * recomendación (Fase C) y la presentación (Fase D) — compuesto/aislamiento,
 * unilateral, rangos de series/reps/descanso por objetivo, tiempo estimado
 * por serie, MET para calorías e imagen local — y amplía los CHECK de `type`
 * y `difficulty`. SQLite no permite modificar un CHECK con ALTER TABLE, así
 * que la tabla se reconstruye preservando filas e ids existentes (de los que
 * dependen `program_exercises` y `session_exercises`).
 */
export const SCHEMA_V3 = `
CREATE TABLE exercises_v3 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  primary_muscle TEXT NOT NULL,
  secondary_muscles TEXT NOT NULL DEFAULT '[]',
  type TEXT NOT NULL CHECK (type IN ('strength', 'hypertrophy', 'cardio', 'mobility', 'hiit', 'stretching')),
  equipment TEXT NOT NULL DEFAULT '[]',
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  movement_pattern TEXT NOT NULL,
  is_compound INTEGER NOT NULL DEFAULT 1,
  is_unilateral INTEGER NOT NULL DEFAULT 0,
  instructions TEXT NOT NULL DEFAULT '[]',
  common_mistakes TEXT NOT NULL DEFAULT '[]',
  injury_flags TEXT NOT NULL DEFAULT '[]',
  recommended_ranges TEXT NOT NULL DEFAULT '{}',
  seconds_per_set INTEGER NOT NULL DEFAULT 40,
  met REAL NOT NULL DEFAULT 5,
  image_key TEXT,
  easier_variant_id TEXT REFERENCES exercises(id) ON DELETE SET NULL,
  harder_variant_id TEXT REFERENCES exercises(id) ON DELETE SET NULL
);

INSERT INTO exercises_v3 (
  id, name, primary_muscle, secondary_muscles, type, equipment, difficulty,
  movement_pattern, instructions, common_mistakes, injury_flags,
  easier_variant_id, harder_variant_id
)
SELECT
  id, name, primary_muscle, secondary_muscles, type, equipment, difficulty,
  movement_pattern, instructions, common_mistakes, injury_flags,
  easier_variant_id, harder_variant_id
FROM exercises;

DROP TABLE exercises;
ALTER TABLE exercises_v3 RENAME TO exercises;
`;

/**
 * Esquema v4: soporte para el modo entrenamiento activo (Fase E).
 *
 * - `workout_sessions.current_exercise_index`: en qué ejercicio del plan va
 *   la sesión; permite reconstruir dónde se quedó el usuario si cierra la
 *   app a medias.
 * - `session_exercises` se reconstruye para admitir el estado 'pending'
 *   (CHECK no se puede ampliar con ALTER TABLE) y guardar el objetivo de
 *   series/reps/descanso de cada ejercicio del plan: así la fila sirve tanto
 *   de plan (mientras está 'pending') como de registro histórico (una vez
 *   'completed'/'skipped'/'substituted'), sin tablas ni JSON adicionales.
 * - `settings.sound_enabled`: para poder silenciar los sonidos del
 *   temporizador sin afectar las notificaciones.
 */
export const SCHEMA_V4 = `
ALTER TABLE workout_sessions ADD COLUMN current_exercise_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN sound_enabled INTEGER NOT NULL DEFAULT 1;

CREATE TABLE session_exercises_v4 (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'substituted')),
  substituted_with_exercise_id TEXT REFERENCES exercises(id),
  target_sets INTEGER,
  target_reps_min INTEGER,
  target_reps_max INTEGER,
  target_rest_seconds INTEGER
);

INSERT INTO session_exercises_v4 (id, session_id, exercise_id, order_index, status, substituted_with_exercise_id)
SELECT id, session_id, exercise_id, order_index, status, substituted_with_exercise_id FROM session_exercises;

DROP TABLE session_exercises;
ALTER TABLE session_exercises_v4 RENAME TO session_exercises;

CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
`;

/**
 * Esquema v5: recordatorio semanal de entrenamiento (horario). `reminder_days`
 * guarda un arreglo JSON de días (1-7, 1 = domingo, igual que expo-notifications)
 * para poder leerlo fácil desde la app; la notificación en sí se reprograma
 * por completo cada vez que cambia la configuración (ver
 * notifications/reminderNotification.ts), así que estas columnas son la
 * única fuente de verdad persistente.
 */
export const SCHEMA_V5 = `
ALTER TABLE settings ADD COLUMN reminder_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN reminder_days TEXT NOT NULL DEFAULT '[]';
ALTER TABLE settings ADD COLUMN reminder_hour INTEGER NOT NULL DEFAULT 7;
ALTER TABLE settings ADD COLUMN reminder_minute INTEGER NOT NULL DEFAULT 0;
`;
