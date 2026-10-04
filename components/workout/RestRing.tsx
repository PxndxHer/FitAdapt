import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type RestRingProps = {
  remainingSeconds: number;
  totalSeconds: number;
  size?: number;
  strokeWidth?: number;
};

/** Anillo circular animado que se vacía a medida que pasa el descanso. */
export function RestRing({ remainingSeconds, totalSeconds, size = 220, strokeWidth = 14 }: RestRingProps) {
  const { colors } = useAppTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(totalSeconds > 0 ? remainingSeconds / totalSeconds : 0);

  useEffect(() => {
    progress.value = withTiming(totalSeconds > 0 ? remainingSeconds / totalSeconds : 0, {
      duration: 280,
      easing: Easing.linear,
    });
  }, [remainingSeconds, totalSeconds, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const urgent = remainingSeconds <= 3 && remainingSeconds > 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={urgent ? colors.danger : colors.tint}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <ThemedText variant="title" style={{ fontSize: 48 }}>
        {remainingSeconds}
      </ThemedText>
    </View>
  );
}
