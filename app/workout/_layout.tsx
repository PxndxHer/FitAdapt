import { Stack } from "expo-router";

/** Stack del modo entrenamiento: sin header, sin gesto de volver (se sale con un botón explícito). */
export default function WorkoutLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false, animation: "fade" }} />;
}
