/**
 * Paleta de colores de la app, para modo claro y oscuro.
 * Mantén aquí todos los valores de color: así el resto de la app
 * nunca escribe un color "a mano", solo referencia estos tokens.
 */

const tintLight = "#2563EB"; // azul principal
const tintDark = "#60A5FA";

export const Colors = {
  light: {
    text: "#0F172A",
    textMuted: "#64748B",
    background: "#F8FAFC",
    card: "#FFFFFF",
    border: "#E2E8F0",
    tint: tintLight,
    icon: "#64748B",
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintLight,
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    overlay: "rgba(15, 23, 42, 0.5)",
    skeletonBase: "#E2E8F0",
    skeletonHighlight: "#F1F5F9",
  },
  dark: {
    text: "#F1F5F9",
    textMuted: "#94A3B8",
    background: "#0B1220",
    card: "#141B2D",
    border: "#1E293B",
    tint: tintDark,
    icon: "#94A3B8",
    tabIconDefault: "#64748B",
    tabIconSelected: tintDark,
    success: "#4ADE80",
    warning: "#FBBF24",
    danger: "#F87171",
    overlay: "rgba(2, 6, 23, 0.65)",
    skeletonBase: "#1E293B",
    skeletonHighlight: "#293548",
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeName];
export type ThemeColorName = keyof ThemeColors;
