import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";

export type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

/** Ilustración simple + mensaje amigable para listas o pantallas sin datos todavía. */
export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.container, { padding: spacing.xl }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.border }]}>
        <Ionicons name={icon} size={32} color={colors.textMuted} />
      </View>
      <ThemedText variant="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText muted style={styles.message}>
        {message}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
  },
});
