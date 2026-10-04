import { loadNotifications } from "./core";

export { requestNotificationPermission } from "./core";

/**
 * Programa el aviso de fin de descanso dentro de `seconds` segundos, para
 * que llegue aunque la app esté en segundo plano. Devuelve el id para poder
 * cancelarlo si el usuario ajusta el tiempo o salta el descanso, o `null` si
 * las notificaciones no están disponibles en este entorno (ej. Expo Go en
 * Android): el temporizador en pantalla funciona igual.
 */
export async function scheduleRestEndNotification(seconds: number): Promise<string | null> {
  const Notifications = await loadNotifications();
  if (!Notifications) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Descanso terminado",
        body: "Es hora de tu siguiente serie.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(seconds)),
        repeats: false,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string | null): Promise<void> {
  if (!id) return;
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Puede que ya se haya disparado; no es un error real.
  }
}
