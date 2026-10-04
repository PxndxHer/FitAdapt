import { ScrollView, Switch, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Card, Chip } from "@/components/ui";
import { saveReminderSettings, useDb } from "@/db";
import { requestNotificationPermission } from "@/notifications/core";
import { scheduleWeeklyReminders } from "@/notifications/reminderNotification";
import { useSettingsStore } from "@/stores/settingsStore";

/** `weekday` sigue la convención de expo-notifications: 1 = domingo. */
const DAY_OPTIONS = [
  { weekday: 2, label: "Lun" },
  { weekday: 3, label: "Mar" },
  { weekday: 4, label: "Mié" },
  { weekday: 5, label: "Jue" },
  { weekday: 6, label: "Vie" },
  { weekday: 7, label: "Sáb" },
  { weekday: 1, label: "Dom" },
];

const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 5); // 5..22
const MINUTE_OPTIONS = [0, 15, 30, 45];

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatWindow(hour: number, minute: number, durationMin: number): string {
  const startTotal = hour * 60 + minute;
  const endTotal = startTotal + durationMin;
  const fmt = (totalMin: number) => formatTime(Math.floor(totalMin / 60) % 24, totalMin % 60);
  return `${fmt(startTotal)} - ${fmt(endTotal)}`;
}

export type ReminderCardProps = {
  /** Para mostrar la ventana completa (ej. "07:00 - 07:45"), se usa la duración de sesión ya guardada en el perfil. */
  sessionDurationMin: number;
};

/** Tarjeta de Perfil para configurar el recordatorio semanal de entrenamiento. */
export function ReminderCard({ sessionDurationMin }: ReminderCardProps) {
  const { spacing, colors } = useAppTheme();
  const db = useDb();
  const settings = useSettingsStore((s) => s.settings);
  const setSettingsState = useSettingsStore((s) => s.setSettings);

  if (!settings) return null;

  async function persist(next: { enabled: boolean; days: number[]; hour: number; minute: number }) {
    setSettingsState({
      ...settings!,
      reminderEnabled: next.enabled,
      reminderDays: next.days,
      reminderHour: next.hour,
      reminderMinute: next.minute,
    });
    await saveReminderSettings(db, next);
    await scheduleWeeklyReminders(next.enabled ? next.days : [], next.hour, next.minute);
  }

  async function toggleEnabled(value: boolean) {
    if (value) await requestNotificationPermission();
    await persist({
      enabled: value,
      days: settings!.reminderDays,
      hour: settings!.reminderHour,
      minute: settings!.reminderMinute,
    });
  }

  function toggleDay(weekday: number) {
    const has = settings!.reminderDays.includes(weekday);
    const days = has ? settings!.reminderDays.filter((d) => d !== weekday) : [...settings!.reminderDays, weekday];
    persist({ enabled: settings!.reminderEnabled, days, hour: settings!.reminderHour, minute: settings!.reminderMinute });
  }

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
        <ThemedText>Recordatorio de entrenamiento</ThemedText>
        <Switch value={settings.reminderEnabled} onValueChange={toggleEnabled} trackColor={{ false: colors.border, true: colors.tint }} />
      </View>

      {settings.reminderEnabled ? (
        <>
          <ThemedText muted variant="caption" style={{ marginBottom: spacing.xs }}>
            Días
          </ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.sm }}>
            {DAY_OPTIONS.map((d) => (
              <View key={d.weekday} style={{ marginBottom: spacing.xs }}>
                <Chip label={d.label} selected={settings.reminderDays.includes(d.weekday)} onPress={() => toggleDay(d.weekday)} />
              </View>
            ))}
          </View>

          <ThemedText muted variant="caption" style={{ marginBottom: spacing.xs }}>
            Hora
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
            {HOUR_OPTIONS.map((h) => (
              <Chip
                key={h}
                label={String(h).padStart(2, "0")}
                selected={settings.reminderHour === h}
                onPress={() =>
                  persist({ enabled: settings.reminderEnabled, days: settings.reminderDays, hour: h, minute: settings.reminderMinute })
                }
              />
            ))}
          </ScrollView>

          <View style={{ flexDirection: "row", marginBottom: spacing.sm }}>
            {MINUTE_OPTIONS.map((m) => (
              <Chip
                key={m}
                label={`:${String(m).padStart(2, "0")}`}
                selected={settings.reminderMinute === m}
                onPress={() =>
                  persist({ enabled: settings.reminderEnabled, days: settings.reminderDays, hour: settings.reminderHour, minute: m })
                }
              />
            ))}
          </View>

          {settings.reminderDays.length > 0 ? (
            <ThemedText muted variant="caption">
              Te avisamos {formatWindow(settings.reminderHour, settings.reminderMinute, sessionDurationMin)}
            </ThemedText>
          ) : (
            <ThemedText muted variant="caption">
              Elige al menos un día para activar el aviso.
            </ThemedText>
          )}
        </>
      ) : null}
    </Card>
  );
}
