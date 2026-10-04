import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/components/theme";
import { EXERCISE_IMAGES } from "@/data/exerciseImages";
import type { MuscleGroup } from "@/types";

const UPPER_BODY = new Set<MuscleGroup>([
  "chest",
  "upper_back",
  "lats",
  "traps",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "neck",
]);
const LOWER_BODY = new Set<MuscleGroup>(["glutes", "quads", "hamstrings", "calves", "adductors", "abductors"]);
const CORE = new Set<MuscleGroup>(["abs", "obliques", "lower_back"]);

/** No tenemos ilustraciones por músculo todavía: agrupamos en 3 zonas + "cuerpo completo" con íconos genéricos. */
function fallbackIcon(muscle: MuscleGroup): keyof typeof Ionicons.glyphMap {
  if (UPPER_BODY.has(muscle)) return "body-outline";
  if (LOWER_BODY.has(muscle)) return "walk-outline";
  if (CORE.has(muscle)) return "ellipse-outline";
  return "fitness-outline";
}

export type ExerciseImageProps = {
  imageKey: string | null;
  muscleGroup: MuscleGroup;
  size?: number;
  borderRadius?: number;
};

/**
 * Foto real del ejercicio cuando existe (emparejada con free-exercise-db,
 * dominio público); si no hay, un ícono genérico de la zona del cuerpo en
 * vez de dejar un espacio vacío.
 */
export function ExerciseImage({ imageKey, muscleGroup, size = 72, borderRadius }: ExerciseImageProps) {
  const { colors, radii } = useAppTheme();
  const source = imageKey ? EXERCISE_IMAGES[imageKey] : undefined;
  const radius = borderRadius ?? radii.md;

  if (source) {
    return <Image source={source} style={{ width: size, height: size, borderRadius: radius }} resizeMode="cover" />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius, backgroundColor: colors.border }]}>
      <Ionicons name={fallbackIcon(muscleGroup)} size={size * 0.5} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
