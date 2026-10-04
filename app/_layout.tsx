import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingScreen } from "@/components/LoadingScreen";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ThemeProvider, useAppTheme } from "@/components/theme";
import { DatabaseProvider, getProfile, getSettings, useDb } from "@/db";
import { useProfileStore } from "@/stores/profileStore";
import { useSettingsStore } from "@/stores/settingsStore";

// Debe llamarse en scope de módulo, sin await, antes de que algo más pueda
// ocultar el splash nativo primero (ver docs de expo-splash-screen).
SplashScreen.preventAutoHideAsync();

/**
 * Layout raíz de toda la app. Todo lo que envuelve aquí aplica a cada
 * pantalla, sin importar la ruta: proveedores de contexto (tema, área
 * segura, base de datos), gestos y la barra de estado.
 *
 * El splash nativo se mantiene visible hasta que las fuentes locales (Inter)
 * terminan de cargar. El <Suspense> cubre la apertura y migración de la base
 * de datos (DatabaseProvider usa useSuspense): mientras tanto se ve
 * <LoadingScreen>, ya con las fuentes listas.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Suspense fallback={<LoadingScreen />}>
            <DatabaseProvider>
              <RootNavigator />
            </DatabaseProvider>
          </Suspense>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Separado de RootLayout porque useAppTheme necesita leer el contexto
 * que <ThemeProvider> acaba de crear: un componente no puede consumir
 * un contexto que él mismo está proveyendo un nivel más arriba.
 *
 * También decide, una sola vez por apertura de la app, si el usuario ya
 * completó el onboarding (tiene perfil guardado) o no. Mientras se resuelve
 * esa consulta se ve <LoadingScreen>; después, Stack.Protected deja montadas
 * solo las rutas que requieren perfil. "onboarding" nunca se protege: así
 * expo-router redirige ahí a un usuario nuevo (es la única ruta disponible),
 * pero Perfil también puede navegar ahí para reutilizar el flujo como edición.
 */
function RootNavigator() {
  const { scheme } = useAppTheme();
  const db = useDb();
  const profile = useProfileStore((s) => s.profile);
  const isLoaded = useProfileStore((s) => s.isLoaded);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const settingsLoaded = useSettingsStore((s) => s.isLoaded);

  useEffect(() => {
    let cancelled = false;
    getProfile(db).then((loaded) => {
      if (!cancelled) setProfile(loaded);
    });
    getSettings(db).then((loaded) => {
      if (!cancelled) setSettings(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [db, setProfile, setSettings]);

  if (!isLoaded || !settingsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Protected guard={profile !== null}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="exercise/[id]" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="workout" options={{ animation: "fade", gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="+not-found" options={{ headerShown: true, title: "No encontrado" }} />
      </Stack>
    </>
  );
}
