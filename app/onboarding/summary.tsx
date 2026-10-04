import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { StepLayout } from "@/components/onboarding/StepLayout";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Card } from "@/components/ui";
import { saveProfile, useDb } from "@/db";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useProfileStore } from "@/stores/profileStore";

const GOAL_LABELS: Record<string, string> = {
  lose_fat: "Perder grasa",
  gain_muscle: "Ganar músculo",
  strength: "Ganar fuerza",
  endurance: "Mejorar resistencia",
  health: "Salud general",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const EQUIPMENT_LABELS: Record<string, string> = {
  bodyweight: "Peso corporal",
  dumbbells: "Mancuernas",
  bands: "Bandas",
  full_gym: "Gimnasio completo",
};

export default function SummaryStep() {
  const { spacing } = useAppTheme();
  const db = useDb();
  const draft = useOnboardingStore((s) => s.draft);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [saving, setSaving] = useState(false);

  const isComplete = Boolean(
    draft.name &&
      draft.sex &&
      draft.birthDate &&
      draft.heightCm &&
      draft.weightKg &&
      draft.experienceLevel &&
      draft.goal &&
      draft.daysPerWeek &&
      draft.sessionDurationMin &&
      draft.equipment.length > 0
  );

  const handleFinish = async () => {
    if (!isComplete) return;
    setSaving(true);
    try {
      const saved = await saveProfile(db, {
        name: draft.name,
        sex: draft.sex!,
        birthDate: draft.birthDate!,
        heightCm: draft.heightCm!,
        weightKg: draft.weightKg!,
        experienceLevel: draft.experienceLevel!,
        goal: draft.goal!,
        daysPerWeek: draft.daysPerWeek!,
        sessionDurationMin: draft.sessionDurationMin!,
        equipment: draft.equipment,
        injuries: draft.injuries,
      });
      setProfile(saved);
      resetOnboarding();
      router.replace("/(tabs)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepLayout
      step="summary"
      title="Todo listo"
      subtitle="Revisa tus datos antes de empezar."
      continueLabel={saving ? "Guardando…" : "Comenzar"}
      continueDisabled={!isComplete || saving}
      onContinue={handleFinish}
    >
      <Card>
        <SummaryRow label="Nombre" value={draft.name} spacing={spacing.xs} />
        <SummaryRow label="Sexo" value={draft.sex === "male" ? "Hombre" : "Mujer"} spacing={spacing.xs} />
        <SummaryRow label="Estatura" value={`${draft.heightCm} cm`} spacing={spacing.xs} />
        <SummaryRow label="Peso" value={`${draft.weightKg} kg`} spacing={spacing.xs} />
        <SummaryRow label="Nivel" value={draft.experienceLevel ? LEVEL_LABELS[draft.experienceLevel] : "-"} spacing={spacing.xs} />
        <SummaryRow label="Objetivo" value={draft.goal ? GOAL_LABELS[draft.goal] : "-"} spacing={spacing.xs} />
        <SummaryRow label="Frecuencia" value={`${draft.daysPerWeek} días · ${draft.sessionDurationMin} min`} spacing={spacing.xs} />
        <SummaryRow label="Equipo" value={draft.equipment.map((e) => EQUIPMENT_LABELS[e]).join(", ")} spacing={spacing.xs} />
        <SummaryRow label="Molestias" value={draft.injuries.length > 0 ? String(draft.injuries.length) : "Ninguna"} spacing={0} />
      </Card>
    </StepLayout>
  );
}

function SummaryRow({ label, value, spacing }: { label: string; value: string; spacing: number }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing }}>
      <ThemedText muted>{label}</ThemedText>
      <ThemedText>{value}</ThemedText>
    </View>
  );
}
