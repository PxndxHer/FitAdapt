/**
 * Familias tipográficas empaquetadas localmente (ver app/_layout.tsx, que las
 * carga con `useFonts` antes de ocultar el splash screen). Ningún componente
 * debe escribir un `fontFamily` a mano: siempre referencia estos tokens, así
 * cambiar de tipografía en el futuro es un cambio en un solo lugar.
 */
export const Fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export type FontToken = (typeof Fonts)[keyof typeof Fonts];
