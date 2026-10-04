import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

import { PressableScale } from "./PressableScale";

export type SelectableCardProps = {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
};

/** Tarjeta seleccionable para opciones de una sola elección o de selección múltiple (onboarding, filtros). */
export function SelectableCard({ label, description, selected, onPress }: SelectableCardProps) {
  const { colors, spacing, radii } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      haptic
      style={[
        styles.card,
        {
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderColor: selected ? colors.tint : colors.border,
          backgroundColor: selected ? `${colors.tint}1A` : colors.card,
        },
      ]}
    >
      <ThemedText variant="subtitle" style={{ color: selected ? colors.tint : colors.text }}>
        {label}
      </ThemedText>
      {description ? (
        <ThemedText muted variant="caption" style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
  },
  description: {
    marginTop: 4,
  },
});
