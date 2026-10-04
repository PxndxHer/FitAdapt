import type { PropsWithChildren } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

export type StaggerItemProps = PropsWithChildren<{
  index: number;
  /** Milisegundos entre la aparición de un elemento y el siguiente. */
  staggerMs?: number;
}>;

/** Envuelve un elemento de lista para que aparezca escalonado respecto a los demás al cargar. */
export function StaggerItem({ index, staggerMs = 60, children }: StaggerItemProps) {
  return (
    <Animated.View entering={FadeInUp.delay(index * staggerMs).duration(350).springify().damping(16)}>
      {children}
    </Animated.View>
  );
}
