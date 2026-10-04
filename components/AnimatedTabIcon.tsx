import { Ionicons } from "@expo/vector-icons";
import type { ColorValue } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

export type AnimatedTabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  size: number;
  focused: boolean;
};

/** Ícono de pestaña que crece con un pequeño resorte al seleccionarse. */
export function AnimatedTabIcon({ name, color, size, focused }: AnimatedTabIconProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.15 : 1, { damping: 12, stiffness: 180 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} color={color} size={size} />
    </Animated.View>
  );
}
