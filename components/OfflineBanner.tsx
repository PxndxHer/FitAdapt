import { Ionicons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";
import { StyleSheet } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

/**
 * Aviso discreto y no bloqueante de que el dispositivo no tiene conexión.
 * La app funciona igual sin internet: esto es solo informativo, nunca
 * impide usar ninguna pantalla. No se muestra mientras el estado de red
 * todavía no se conoce (evita un parpadeo al abrir la app).
 */
export function OfflineBanner() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkState();

  if (isConnected !== false) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      style={[
        styles.banner,
        {
          paddingTop: insets.top + 6,
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={14} color={colors.textMuted} />
      <ThemedText variant="caption" muted>
        Sin conexión. La app funciona normalmente sin internet.
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
