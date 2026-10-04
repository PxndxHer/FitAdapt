import { router } from "expo-router";

import { StepLayout } from "@/components/onboarding/StepLayout";
import { SelectableCard } from "@/components/ui";
import { useOnboardingStore } from "@/stores/onboardingStore";
import type { InjuryArea } from "@/types";

const INJURY_OPTIONS: { value: InjuryArea; label: string }[] = [
  { value: "lower_back", label: "Espalda baja" },
  { value: "knees", label: "Rodillas" },
  { value: "shoulders", label: "Hombros" },
  { value: "wrists", label: "Muñecas" },
  { value: "elbows", label: "Codos" },
  { value: "neck", label: "Cuello" },
  { value: "hips", label: "Cadera" },
  { value: "ankles", label: "Tobillos" },
];

export default function InjuriesStep() {
  const injuries = useOnboardingStore((s) => s.draft.injuries);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);

  const toggle = (value: InjuryArea) => {
    const has = injuries.includes(value);
    updateDraft({ injuries: has ? injuries.filter((i) => i !== value) : [...injuries, value] });
  };

  return (
    <StepLayout
      step="injuries"
      title="¿Alguna molestia o lesión?"
      subtitle="Evitaremos ejercicios que carguen esas zonas. Si no tienes ninguna, continúa sin elegir nada."
      onContinue={() => router.push("/onboarding/summary")}
    >
      {INJURY_OPTIONS.map((item) => (
        <SelectableCard key={item.value} label={item.label} selected={injuries.includes(item.value)} onPress={() => toggle(item.value)} />
      ))}
    </StepLayout>
  );
}
