import { Link } from "expo-router";
import { StyleSheet } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";

export default function NotFoundScreen() {
  return (
    <Screen style={styles.container}>
      <ThemedText variant="title">Pantalla no encontrada</ThemedText>
      <Link href="/" style={styles.link}>
        <ThemedText variant="link">Volver al inicio</ThemedText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
