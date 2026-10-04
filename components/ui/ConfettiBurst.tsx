import { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PARTICLE_COLORS = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#9333EA", "#0EA5E9"];
const PARTICLE_COUNT = 24;

export type ConfettiBurstProps = {
  /** Se llama una vez cuando termina la última partícula. */
  onDone?: () => void;
};

/**
 * Animación de celebración hecha con Reanimated puro, sin archivo Lottie:
 * así no dependemos de un asset externo de licencia incierta para algo tan
 * simple. Úsala montándola condicionalmente (ej. al terminar un
 * entrenamiento o batir un récord) y desmóntala en `onDone`.
 */
export function ConfettiBurst({ onDone }: ConfettiBurstProps) {
  return (
    <>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} onDone={i === PARTICLE_COUNT - 1 ? onDone : undefined} />
      ))}
    </>
  );
}

function Particle({ index, onDone }: { index: number; onDone?: () => void }) {
  const progress = useSharedValue(0);
  const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length];
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;

  // Math.random() solo debe correr una vez por partícula, nunca en cada
  // render: un inicializador perezoso de useState es el lugar sancionado
  // por React para ese cálculo impuro de una sola vez.
  const [{ targetX, targetY, spinDirection, delay, duration }] = useState(() => {
    const distance = 80 + Math.random() * 120;
    return {
      targetX: Math.cos(angle) * distance,
      targetY: Math.sin(angle) * distance - 40,
      spinDirection: index % 2 === 0 ? 1 : -1,
      delay: Math.random() * 150,
      duration: 900 + Math.random() * 400,
    };
  });

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished && onDone) runOnJS(onDone)();
      })
    );
    // Solo debe reproducirse una vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * targetX },
      { translateY: progress.value * targetY + progress.value * progress.value * 160 },
      { rotate: `${progress.value * 360 * spinDirection}deg` },
      { scale: 1 - progress.value * 0.3 },
    ],
  }));

  return <Animated.View style={[styles.particle, { backgroundColor: color }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    top: "40%",
    left: SCREEN_WIDTH / 2 - 4,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
