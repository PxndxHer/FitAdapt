import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

import { PressableScale } from "./PressableScale";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Botón con los 3 énfasis visuales que usa la app, con presión animada y háptica (vía PressableScale). */
export function Button({ label, onPress, variant = "primary", disabled = false, style }: ButtonProps) {
  const { colors, spacing, radii } = useAppTheme();

  const backgroundColor = variant === "primary" ? colors.tint : variant === "secondary" ? colors.card : "transparent";
  const borderColor = variant === "secondary" ? colors.border : colors.tint;
  const textColor = variant === "primary" ? "#FFFFFF" : colors.tint;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === "primary" ? 0 : 1,
          borderRadius: radii.md,
          paddingVertical: spacing.sm + 4,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
    >
      <ThemedText variant="subtitle" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
