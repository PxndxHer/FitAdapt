import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { Fonts, useAppTheme } from "@/components/theme";

export type TextFieldProps = TextInputProps;

/** Campo de texto con los estilos del tema (borde, radio, tipografía). Úsalo en vez de <TextInput> a pelo. */
export function TextField({ style, ...rest }: TextFieldProps) {
  const { colors, spacing, radii } = useAppTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[
        styles.base,
        {
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          color: colors.text,
          backgroundColor: colors.card,
          fontFamily: Fonts.regular,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    fontSize: 16,
  },
});
