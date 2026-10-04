import type { ThemeName } from "./colors";

type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export type ShadowLevel = "sm" | "md" | "lg";

function makeShadow(scheme: ThemeName, offsetY: number, opacity: number, radius: number, elevation: number): ShadowStyle {
  return {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: offsetY },
    // En modo oscuro el fondo ya es oscuro, así que una sombra negra normal
    // casi no se nota: se sube la opacidad para que la tarjeta siga sintiéndose elevada.
    shadowOpacity: scheme === "dark" ? Math.min(1, opacity * 1.4) : opacity,
    shadowRadius: radius,
    elevation,
  };
}

/** Sombras de 3 niveles, ya resueltas para iOS (shadow*) y Android (elevation). */
export function getShadows(scheme: ThemeName): Record<ShadowLevel, ShadowStyle> {
  return {
    sm: makeShadow(scheme, 1, 0.08, 2, 1),
    md: makeShadow(scheme, 4, 0.12, 8, 4),
    lg: makeShadow(scheme, 10, 0.16, 20, 8),
  };
}
