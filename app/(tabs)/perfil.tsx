import { router } from "expo-router";
import { ScrollView, Switch, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { ReminderCard } from "@/components/settings/ReminderCard";
import { Button, Card } from "@/components/ui";
import { EQUIPMENT_LABELS, EXPERIENCE_LEVEL_LABELS, GOAL_LABELS } from "@/constants/labels";
import { setSoundEnabled, useDb } from "@/db";
import { profileToDraft, useOnboardingStore } from "@/stores/onboardingStore";
import { useProfileStore } from "@/stores/profileStore";
import { useSettingsStore } from "@/stores/settingsStore";

export default function PerfilScreen() {
  const { spacing, colors } = useAppTheme();
  const db = useDb();
  const profile = useProfileStore((s) => s.profile);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);
  const settings = useSettingsStore((s) => s.settings);
  const setSettingsState = useSettingsStore((s) => s.setSettings);

  if (!profile) return null;

  const age = new Date().getFullYear() - Number(profile.birthDate.slice(0, 4));

  async function toggleSound(value: boolean) {
    if (!settings) return;
    setSettingsState({ ...settings, soundEnabled: value });
    await setSoundEnabled(db, value);
  }

  return (
    <Screen>
      <ThemedText variant="title">Perfil</ThemedText>
      <ThemedText muted style={{ marginTop: 4, marginBottom: spacing.lg }}>
        Tus datos y preferencias de entrenamiento.
      </ThemedText>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <Card style={{ marginBottom: spacing.md }}>
          <Row label="Nombre" value={profile.name} />
          <Row label="Edad" value={`${age} años`} />
          <Row label="Sexo" value={profile.sex === "male" ? "Hombre" : "Mujer"} />
          <Row label="Estatura" value={`${profile.heightCm} cm`} />
          <Row label="Peso" value={`${profile.weightKg} kg`} last />
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Row label="Nivel" value={EXPERIENCE_LEVEL_LABELS[profile.experienceLevel]} />
          <Row label="Objetivo" value={GOAL_LABELS[profile.goal]} />
          <Row label="Frecuencia" value={`${profile.daysPerWeek} días · ${profile.sessionDurationMin} min`} />
          <Row label="Equipo" value={profile.equipment.map((e) => EQUIPMENT_LABELS[e]).join(", ")} />
          <Row label="Molestias" value={profile.injuries.length > 0 ? String(profile.injuries.length) : "Ninguna"} last />
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <ThemedText>Sonidos del entrenamiento</ThemedText>
            <Switch
              value={settings?.soundEnabled ?? true}
              onValueChange={toggleSound}
              trackColor={{ false: colors.border, true: colors.tint }}
            />
          </View>
        </Card>

        <ReminderCard sessionDurationMin={profile.sessionDurationMin} />

        <Button
          label="Editar perfil"
          variant="secondary"
          onPress={() => {
            updateDraft(profileToDraft(profile));
            router.push("/onboarding");
          }}
        />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const { spacing, colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: spacing.sm,
        marginBottom: last ? 0 : spacing.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <ThemedText muted>{label}</ThemedText>
      <ThemedText style={{ textTransform: "capitalize" }}>{value}</ThemedText>
    </View>
  );
}
