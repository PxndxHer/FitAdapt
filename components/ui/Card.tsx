import { View, type ViewProps } from "react-native";

import { useAppTheme } from "@/components/theme";

export type CardProps = ViewProps & {
  /** Nivel de sombra; "none" para una tarjeta plana (ej. dentro de otra tarjeta). */
  elevation?: "none" | "sm" | "md" | "lg";
};

/** Contenedor con fondo, radio y sombra del tema. Base de tarjetas de ejercicio, resumen, etc. */
export function Card({ style, elevation = "sm", ...rest }: CardProps) {
  const { colors, spacing, radii, shadows } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
        elevation !== "none" ? shadows[elevation] : null,
        style,
      ]}
      {...rest}
    />
  );
}
