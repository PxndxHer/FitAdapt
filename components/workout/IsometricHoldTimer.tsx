import { useState } from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Button } from "@/components/ui";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";

export type IsometricHoldTimerProps = {
  onStop: (seconds: number) => void;
};

/** Temporizador de mantenimiento para ejercicios isométricos (plancha, etc.): cuenta mientras se sostiene. */
export function IsometricHoldTimer({ onStop }: IsometricHoldTimerProps) {
  const { spacing } = useAppTheme();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const elapsed = useElapsedSeconds(startedAt);

  return (
    <View style={{ alignItems: "center", marginBottom: spacing.md }}>
      <ThemedText variant="title" style={{ marginBottom: spacing.sm }}>
        {elapsed}s
      </ThemedText>
      {startedAt === null ? (
        <Button label="Empezar a sostener" onPress={() => setStartedAt(Date.now())} />
      ) : (
        <Button
          label="Detener"
          variant="secondary"
          onPress={() => {
            onStop(elapsed);
            setStartedAt(null);
          }}
        />
      )}
    </View>
  );
}
