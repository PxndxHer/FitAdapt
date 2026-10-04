import { View, type ViewProps } from "react-native";

import { useAppTheme } from "@/components/theme";

export type ThemedViewProps = ViewProps & {
  /** Usa el color de "card" (tarjeta) en vez del fondo general de la pantalla. */
  variant?: "background" | "card";
};

/** Vista que se adapta automáticamente al tema claro/oscuro. */
export function ThemedView({ style, variant = "background", ...rest }: ThemedViewProps) {
  const { colors } = useAppTheme();
  const backgroundColor = variant === "card" ? colors.card : colors.background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
