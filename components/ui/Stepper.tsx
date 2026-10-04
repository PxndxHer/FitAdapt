import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

import { PressableScale } from "./PressableScale";

export type StepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
};

/** Selector numérico +/-, para configurar tiempos y rondas. */
export function Stepper({ label, value, onChange, step = 1, min = 0, max = 999, formatValue }: StepperProps) {
  const { colors, spacing, radii } = useAppTheme();

  const buttonStyle = {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      <ThemedText muted variant="caption" style={{ marginBottom: spacing.xs }}>
        {label}
      </ThemedText>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <PressableScale onPress={() => onChange(Math.max(min, value - step))} style={buttonStyle}>
          <ThemedText variant="subtitle">-</ThemedText>
        </PressableScale>
        <ThemedText variant="title">{formatValue ? formatValue(value) : value}</ThemedText>
        <PressableScale onPress={() => onChange(Math.min(max, value + step))} style={buttonStyle}>
          <ThemedText variant="subtitle">+</ThemedText>
        </PressableScale>
      </View>
    </View>
  );
}
