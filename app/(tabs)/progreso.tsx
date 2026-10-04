import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/ui";

export default function ProgresoScreen() {
  return (
    <Screen>
      <ThemedText variant="title">Progreso</ThemedText>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <EmptyState
          icon="stats-chart-outline"
          title="Todavía no hay entrenamientos"
          message="Cuando registres tu primer entrenamiento, aquí verás tus gráficas de peso, fuerza y constancia."
        />
      </View>
    </Screen>
  );
}
