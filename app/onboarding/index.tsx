import { router } from "expo-router";
import { useState } from "react";

import { StepLayout } from "@/components/onboarding/StepLayout";
import { TextField } from "@/components/ui";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function WelcomeStep() {
  const name = useOnboardingStore((s) => s.draft.name);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);
  const [localName, setLocalName] = useState(name);

  return (
    <StepLayout
      step="welcome"
      title="¡Bienvenido a FitAdapt!"
      subtitle="Vamos a conocerte un poco para armar entrenamientos a tu medida. ¿Cómo te llamas?"
      continueDisabled={localName.trim().length === 0}
      onContinue={() => {
        updateDraft({ name: localName.trim() });
        router.push("/onboarding/physical");
      }}
    >
      <TextField value={localName} onChangeText={setLocalName} placeholder="Tu nombre" autoFocus returnKeyType="next" />
    </StepLayout>
  );
}
