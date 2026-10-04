/** Radios de borde de la app, de tarjetas pequeñas a elementos circulares. */
export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export type RadiusToken = keyof typeof Radii;
