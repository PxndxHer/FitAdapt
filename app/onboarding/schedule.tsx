import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { StepLayout } from "@/components/onboarding/StepLayout";
import { useAppTheme } from "@/components/theme";
import { SelectableCard } from "@/components/ui";
import { useOnboardingStore } from "@/stores/onboardingStore";

const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export default function ScheduleStep() {
  const { spacing } = useAppTheme();
  const draft = useOnboardingStore((s) => s.draft);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);
  const [days, setDays] = useState<number | null>(draft.daysPerWeek);
  const [duration, setDuration] = useState<number | null>(draft.sessionDurationMin);

  return (
    <StepLayout
      step="schedule"
      title="Tu disponibilidad"
      subtitle="¿Cuántos días a la semana puedes entrenar y cuánto tiempo tienes por sesión?"
      continueDisabled={!days || !duration}
      onContinue={() => {
        updateDraft({ daysPerWeek: days!, sessionDurationMin: duration! });
        router.push("/onboarding/equipment");
      }}
    >
      {DAYS_OPTIONS.map((d) => (
        <SelectableCard key={d} label={`${d} días por semana`} selected={days === d} onPress={() => setDays(d)} />
      ))}
      <View style={{ height: spacing.md }} />
      {DURATION_OPTIONS.map((m) => (
        <SelectableCard key={m} label={`${m} minutos por sesión`} selected={duration === m} onPress={() => setDuration(m)} />
      ))}
    </StepLayout>
  );
}
