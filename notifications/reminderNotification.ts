import { loadNotifications } from "./core";

const REMINDER_TAG = "training-reminder";

/** Cancela todos los recordatorios semanales programados previamente (y ninguno más: no toca el aviso de descanso). */
export async function cancelAllReminders(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reminderIds = scheduled.filter((n) => n.content.data?.tag === REMINDER_TAG).map((n) => n.identifier);
    await Promise.all(reminderIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  } catch {
    // ignorar
  }
}

/**
 * Programa un recordatorio semanal (se repite solo) para cada día elegido, a
 * la hora indicada. Reemplaza cualquier recordatorio previo, así que llamar
 * de nuevo con una configuración distinta basta para actualizarla.
 * `days` usa 1-7 con 1 = domingo, igual que expo-notifications.
 */
export async function scheduleWeeklyReminders(days: number[], hour: number, minute: number): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  await cancelAllReminders();
  if (days.length === 0) return;

  try {
    for (const weekday of days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hora de entrenar",
          body: "Tienes un entrenamiento programado para ahora.",
          sound: true,
          data: { tag: REMINDER_TAG },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
        },
      });
    }
  } catch {
    // ignorar
  }
}
