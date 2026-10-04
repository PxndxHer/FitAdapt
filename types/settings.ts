export type UnitsPreference = "metric" | "imperial";

export type ThemePreferenceSetting = "light" | "dark" | "system";

export type Settings = {
  units: UnitsPreference;
  themePreference: ThemePreferenceSetting;
  notificationsEnabled: boolean;
  /** Sonidos del temporizador de entrenamiento (cuenta regresiva, fin de descanso). */
  soundEnabled: boolean;
  /** Recordatorio semanal de entrenamiento (horario). */
  reminderEnabled: boolean;
  /** Días de la semana, 1-7 con 1 = domingo (igual que expo-notifications). */
  reminderDays: number[];
  reminderHour: number;
  reminderMinute: number;
};
