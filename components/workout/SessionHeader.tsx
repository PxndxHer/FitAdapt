import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";

export type SessionHeaderProps = {
  startedAtMs: number;
  currentExerciseIndex: number;
  totalExercises: number;
};

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Cronómetro total de la sesión (siempre visible) + en qué ejercicio del plan vas. */
export function SessionHeader({ startedAtMs, currentExerciseIndex, totalExercises }: SessionHeaderProps) {
  const { spacing } = useAppTheme();
  const elapsed = useElapsedSeconds(startedAtMs);

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
      <ThemedText variant="subtitle">{formatClock(elapsed)}</ThemedText>
      <ThemedText muted variant="caption">
        Ejercicio {currentExerciseIndex + 1} de {totalExercises}
      </ThemedText>
    </View>
  );
}
