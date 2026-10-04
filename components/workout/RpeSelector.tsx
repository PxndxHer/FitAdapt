import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { PressableScale } from "@/components/ui";

export type RpeSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

/** Selector compacto de esfuerzo percibido (RPE), 1 a 10. */
export function RpeSelector({ value, onChange }: RpeSelectorProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View>
      <ThemedText muted variant="caption" style={{ marginBottom: spacing.xs }}>
        Esfuerzo percibido (RPE)
      </ThemedText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <PressableScale
            key={n}
            onPress={() => onChange(n)}
            scaleTo={0.9}
            style={[styles.circle, { backgroundColor: value === n ? colors.tint : colors.card, borderColor: colors.border }]}
          >
            <ThemedText style={{ color: value === n ? "#FFFFFF" : colors.text }}>{n}</ThemedText>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
