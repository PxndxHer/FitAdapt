/**
 * Escala de espaciado de la app. Ningún componente debe escribir un número
 * de padding/margin/gap a mano: siempre referencia uno de estos tokens.
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingToken = keyof typeof Spacing;
