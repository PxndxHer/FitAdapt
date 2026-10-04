import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

export type BadgeTone = "neutral" | "tint" | "success" | "warning" | "danger";

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

/** Etiqueta pequeña para equipo, dificultad, tipo de ejercicio, etc. */
export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const { colors, spacing, radii } = useAppTheme();
  const toneColors: Record<BadgeTone, string> = {
    neutral: colors.textMuted,
    tint: colors.tint,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };
  const toneColor = toneColors[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          borderRadius: radii.full,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs / 2,
          borderColor: toneColor,
        },
      ]}
    >
      <ThemedText variant="caption" style={{ color: toneColor }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});
