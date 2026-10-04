import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

/**
 * Pantalla de carga mientras se abren/migran la base de datos y las fuentes.
 * No usa <Screen> porque se muestra antes de que el resto del árbol (Suspense
 * boundary en app/_layout.tsx) sepa si el tema o el área segura ya están listos.
 */
export function LoadingScreen() {
  const { colors } = useAppTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
    transform: [{ scale: 0.92 + pulse.value * 0.08 }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="barbell" size={48} color={colors.tint} />
      </Animated.View>
      <ThemedText muted style={styles.label}>
        Preparando tu entrenamiento…
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  label: {
    marginTop: 4,
  },
});
