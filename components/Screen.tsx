import { StyleSheet, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAppTheme } from "@/components/theme";

export type ScreenProps = ViewProps & {
  /** Bordes donde se respeta el área segura (notch, barra de estado, etc.). */
  edges?: Edge[];
  /** Desactiva la animación de entrada (útil si la pantalla ya anima su propio contenido). */
  animated?: boolean;
};

/**
 * Contenedor base para cada pantalla: aplica el color de fondo del tema,
 * respeta el área segura del dispositivo y anima la entrada del contenido.
 * Todas las pantallas deberían envolver su contenido con <Screen> en vez
 * de <View> a pelo, así la animación y el tema quedan consistentes en toda la app.
 */
export function Screen({ style, edges = ["top", "left", "right"], animated = true, ...rest }: ScreenProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.base, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={animated ? FadeInDown.duration(400).springify().damping(18) : undefined}
        style={[styles.content, style]}
        {...rest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
