import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

export type StartCountdownProps = {
  onDone: () => void;
  onTick?: () => void;
};

const STEPS = ["3", "2", "1", "¡Vamos!"];

/** Cuenta regresiva 3-2-1 antes de empezar el entrenamiento. */
export function StartCountdown({ onDone, onTick }: StartCountdownProps) {
  const { colors } = useAppTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    if (stepIndex < 3) onTick?.();
    scale.value = withSequence(withTiming(1.15, { duration: 200 }), withTiming(1, { duration: 150 }));

    if (stepIndex >= STEPS.length - 1) {
      const timeout = setTimeout(onDone, 500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      scale.value = 0.6;
      setStepIndex((i) => i + 1);
    }, 800);
    return () => clearTimeout(timeout);
    // onDone/onTick no deben re-disparar el ciclo; solo stepIndex lo avanza.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={animatedStyle}>
        <ThemedText variant="title" style={[styles.text, { color: colors.tint }]}>
          {STEPS[stepIndex]}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 72,
  },
});
