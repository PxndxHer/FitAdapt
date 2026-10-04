import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useAppTheme } from "@/components/theme";

export type ProgressDotsProps = {
  total: number;
  currentIndex: number;
};

/** Indicador de pasos animado, para onboarding o cualquier flujo de varios pasos. */
export function ProgressDots({ total, currentIndex }: ProgressDotsProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.row, { gap: spacing.xs }]}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === currentIndex} activeColor={colors.tint} inactiveColor={colors.border} />
      ))}
    </View>
  );
}

function Dot({ active, activeColor, inactiveColor }: { active: boolean; activeColor: string; inactiveColor: string }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 250 });
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: 8 + progress.value * 12,
    backgroundColor: interpolateColor(progress.value, [0, 1], [inactiveColor, activeColor]),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
