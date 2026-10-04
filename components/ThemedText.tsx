import { StyleSheet, Text, type TextProps } from "react-native";

import { Fonts, useAppTheme } from "@/components/theme";

export type ThemedTextVariant = "default" | "title" | "subtitle" | "caption" | "link";

export type ThemedTextProps = TextProps & {
  variant?: ThemedTextVariant;
  /** Usa el color "muted" (más tenue) en vez del color de texto principal. */
  muted?: boolean;
};

/**
 * Texto que se adapta automáticamente al tema claro/oscuro.
 * Úsalo en vez de <Text> para que el color siga siempre el tema activo.
 */
export function ThemedText({ style, variant = "default", muted = false, ...rest }: ThemedTextProps) {
  const { colors } = useAppTheme();
  const color = variant === "link" ? colors.tint : muted ? colors.textMuted : colors.text;

  return <Text style={[{ color }, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.semiBold,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.regular,
  },
  link: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.medium,
  },
});
