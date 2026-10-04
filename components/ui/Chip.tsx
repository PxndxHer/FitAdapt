import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

import { PressableScale } from "./PressableScale";

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Filtro de una sola palabra en forma de píldora, para barras de filtro horizontales. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors, spacing, radii } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.95}
      style={[
        styles.chip,
        {
          borderRadius: radii.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
          backgroundColor: selected ? colors.tint : colors.card,
          borderColor: selected ? colors.tint : colors.border,
        },
      ]}
    >
      <ThemedText variant="caption" style={{ color: selected ? "#FFFFFF" : colors.text }}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    marginRight: 8,
  },
});
