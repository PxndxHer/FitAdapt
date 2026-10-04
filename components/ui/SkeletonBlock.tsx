import { useEffect } from "react";
import type { DimensionValue } from "react-native";
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { useAppTheme } from "@/components/theme";

export type SkeletonBlockProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
};

/** Bloque de carga "shimmer"; úsalo en vez de pantallas en blanco mientras llegan datos. */
export function SkeletonBlock({ width = "100%", height = 16, borderRadius = 8 }: SkeletonBlockProps) {
  const { colors } = useAppTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(pulse.value, [0, 1], [colors.skeletonBase, colors.skeletonHighlight]),
  }));

  return <Animated.View style={[{ width, height, borderRadius }, animatedStyle]} />;
}
