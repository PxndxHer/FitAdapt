import Constants from "expo-constants";
import { Platform } from "react-native";

export type NotificationsModule = typeof import("expo-notifications");

let modulePromise: Promise<NotificationsModule | null> | null = null;
let handlerConfigured = false;

/**
 * En Expo Go para Android, expo-notifications registra automáticamente un
 * listener de push token apenas se carga el módulo (efecto secundario
 * interno, no algo que se pueda evitar llamando a otra función), y ese
 * listener lanza un error async en cuanto se dispara — ocurre sin importar
 * cómo se importe el módulo ni qué tan diferido sea, y un try/catch
 * alrededor del import no lo atrapa porque el error no pertenece a esa
 * cadena de promesas. La única forma segura es no cargar el módulo en
 * absoluto en ese entorno específico.
 */
function isNotificationsUnsupported(): boolean {
  return Platform.OS === "android" && Constants.appOwnership === "expo";
}

/** Carga expo-notifications de forma diferida, salvo en el entorno donde se sabe que revienta. */
export function loadNotifications(): Promise<NotificationsModule | null> {
  if (isNotificationsUnsupported()) {
    return Promise.resolve(null);
  }

  if (!modulePromise) {
    modulePromise = import("expo-notifications")
      .then((mod) => {
        if (!handlerConfigured) {
          handlerConfigured = true;
          mod.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowBanner: true,
              shouldShowList: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
          });
        }
        return mod;
      })
      .catch(() => null);
  }
  return modulePromise;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}
