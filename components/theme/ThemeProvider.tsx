import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import { Colors, type ThemeColors, type ThemeName } from "./colors";
import { Radii } from "./radii";
import { getShadows, type ShadowLevel } from "./shadows";
import { Spacing } from "./spacing";

/** Preferencia de tema elegida por el usuario en Ajustes (fase 9). "system" sigue al dispositivo. */
export type ThemePreference = ThemeName | "system";

type ThemeContextValue = {
  /** Tema realmente aplicado ("light" | "dark"), ya resuelto a partir de la preferencia. */
  scheme: ThemeName;
  colors: ThemeColors;
  spacing: typeof Spacing;
  radii: typeof Radii;
  shadows: Record<ShadowLevel, ReturnType<typeof getShadows>[ShadowLevel]>;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  // useColorScheme puede devolver "unspecified" en Android si el SO no lo reporta: tratarlo como claro.
  const systemScheme: ThemeName = useSystemColorScheme() === "dark" ? "dark" : "light";
  const [preference, setPreference] = useState<ThemePreference>("system");

  const scheme: ThemeName = preference === "system" ? systemScheme : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: Colors[scheme],
      spacing: Spacing,
      radii: Radii,
      shadows: getShadows(scheme),
      preference,
      setPreference,
    }),
    [scheme, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Hook principal para consumir el tema dentro de cualquier componente. */
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme debe usarse dentro de un <ThemeProvider>");
  }
  return ctx;
}
