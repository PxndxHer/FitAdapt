import type { SQLiteDatabase } from "expo-sqlite";

import type { Settings } from "@/types";

import { rowToSettings, type SettingsRow } from "./rows";

const DEFAULT_SETTINGS: Settings = {
  units: "metric",
  themePreference: "system",
  notificationsEnabled: false,
  soundEnabled: true,
  reminderEnabled: false,
  reminderDays: [],
  reminderHour: 7,
  reminderMinute: 0,
};

/** Crea la fila de settings con valores por defecto la primera vez que se pide. */
export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const row = await db.getFirstAsync<SettingsRow>("SELECT * FROM settings WHERE id = 1");
  if (row) return rowToSettings(row);

  await db.runAsync(
    `INSERT INTO settings (id, units, theme_preference, notifications_enabled, sound_enabled, reminder_enabled, reminder_days, reminder_hour, reminder_minute)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      DEFAULT_SETTINGS.units,
      DEFAULT_SETTINGS.themePreference,
      DEFAULT_SETTINGS.notificationsEnabled ? 1 : 0,
      DEFAULT_SETTINGS.soundEnabled ? 1 : 0,
      DEFAULT_SETTINGS.reminderEnabled ? 1 : 0,
      JSON.stringify(DEFAULT_SETTINGS.reminderDays),
      DEFAULT_SETTINGS.reminderHour,
      DEFAULT_SETTINGS.reminderMinute,
    ]
  );
  return DEFAULT_SETTINGS;
}

export async function setSoundEnabled(db: SQLiteDatabase, enabled: boolean): Promise<void> {
  await getSettings(db); // asegura que la fila exista
  await db.runAsync("UPDATE settings SET sound_enabled = ? WHERE id = 1", [enabled ? 1 : 0]);
}

/** Guarda la configuración del recordatorio semanal. La notificación en sí se reprograma aparte (ver notifications/reminderNotification). */
export async function saveReminderSettings(
  db: SQLiteDatabase,
  reminder: { enabled: boolean; days: number[]; hour: number; minute: number }
): Promise<void> {
  await getSettings(db);
  await db.runAsync("UPDATE settings SET reminder_enabled = ?, reminder_days = ?, reminder_hour = ?, reminder_minute = ? WHERE id = 1", [
    reminder.enabled ? 1 : 0,
    JSON.stringify(reminder.days),
    reminder.hour,
    reminder.minute,
  ]);
}
