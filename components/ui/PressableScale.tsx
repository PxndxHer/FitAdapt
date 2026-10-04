import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  /** Qué tan chico se pone al presionar (0.96 = 4% más chico). */
  scaleTo?: number;
  /** Vibración sutil al presionar. Se omite automáticamente si el elemento está deshabilitado. */
  haptic?: boolean;
};

/**
 * Pressable con efecto de presión (escala) y vibración háptica sutil.
 * Úsalo en vez de <Pressable> a pelo para cualquier botón o tarjeta tocable.
 */
export function PressableScale({
  scaleTo = 0.96,
  haptic = true,
  disabled,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      // scale.value es un SharedValue de Reanimated: se muta a propósito fuera
      // del render (ese es su modelo), el lint de React Compiler no lo sabe.
      // eslint-disable-next-line react-hooks/immutability
      scale.value = withTiming(scaleTo, { duration: 100 });
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPressIn?.(e);
    },
    [scale, scaleTo, haptic, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      // eslint-disable-next-line react-hooks/immutability
      scale.value = withTiming(1, { duration: 150 });
      onPressOut?.(e);
    },
    [scale, onPressOut]
  );

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, disabled ? { opacity: 0.5 } : null, style]}
      {...rest}
    />
  );
}
