import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { StepLayout } from "@/components/onboarding/StepLayout";
import { useAppTheme } from "@/components/theme";
import { SelectableCard } from "@/components/ui";
import { useOnboardingStore } from "@/stores/onboardingStore";
import type { ExperienceLevel, Goal } from "@/types";

const LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Principiante", description: "Llevo menos de 6 meses entrenando, o nunca he entrenado." },
  { value: "intermediate", label: "Intermedio", description: "Entreno con regularidad desde hace 6 meses a 2 años." },
  { value: "advanced", label: "Avanzado", description: "Entreno con regularidad desde hace más de 2 años." },
];

const GOALS: { value: Goal; label: string }[] = [
  { value: "lose_fat", label: "Perder grasa" },
  { value: "gain_muscle", label: "Ganar músculo" },
  { value: "strength", label: "Ganar fuerza" },
  { value: "endurance", label: "Mejorar resistencia" },
  { value: "health", label: "Salud general" },
];

export default function ExperienceStep() {
  const { spacing } = useAppTheme();
  const draft = useOnboardingStore((s) => s.draft);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);
  const [level, setLevel] = useState<ExperienceLevel | null>(draft.experienceLevel);
  const [goal, setGoal] = useState<Goal | null>(draft.goal);

  return (
    <StepLayout
      step="experience"
      title="Tu experiencia y objetivo"
      continueDisabled={!level || !goal}
      onContinue={() => {
        updateDraft({ experienceLevel: level!, goal: goal! });
        router.push("/onboarding/schedule");
      }}
    >
      {LEVELS.map((item) => (
        <SelectableCard
          key={item.value}
          label={item.label}
          description={item.description}
          selected={level === item.value}
          onPress={() => setLevel(item.value)}
        />
      ))}
      <View style={{ height: spacing.md }} />
      {GOALS.map((item) => (
        <SelectableCard key={item.value} label={item.label} selected={goal === item.value} onPress={() => setGoal(item.value)} />
      ))}
    </StepLayout>
  );
}
