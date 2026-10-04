import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { StepLayout } from "@/components/onboarding/StepLayout";
import { useAppTheme } from "@/components/theme";
import { SelectableCard, TextField } from "@/components/ui";
import { useOnboardingStore } from "@/stores/onboardingStore";
import type { Sex } from "@/types";

export default function PhysicalStep() {
  const { spacing } = useAppTheme();
  const draft = useOnboardingStore((s) => s.draft);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);

  const [sex, setSex] = useState<Sex | null>(draft.sex);
  const [age, setAge] = useState(draft.birthDate ? String(new Date().getFullYear() - Number(draft.birthDate.slice(0, 4))) : "");
  const [heightCm, setHeightCm] = useState(draft.heightCm ? String(draft.heightCm) : "");
  const [weightKg, setWeightKg] = useState(draft.weightKg ? String(draft.weightKg) : "");

  const ageNumber = Number(age);
  const heightNumber = Number(heightCm);
  const weightNumber = Number(weightKg);
  const isValid =
    sex !== null &&
    Number.isFinite(ageNumber) &&
    ageNumber >= 13 &&
    ageNumber <= 100 &&
    Number.isFinite(heightNumber) &&
    heightNumber >= 100 &&
    heightNumber <= 250 &&
    Number.isFinite(weightNumber) &&
    weightNumber >= 30 &&
    weightNumber <= 300;

  return (
    <StepLayout
      step="physical"
      title="Tus datos físicos"
      subtitle="Los usamos para calcular calorías y sugerirte cargas adecuadas. No salen de tu dispositivo."
      continueDisabled={!isValid}
      onContinue={() => {
        const birthYear = new Date().getFullYear() - ageNumber;
        updateDraft({ sex: sex!, birthDate: `${birthYear}-01-01`, heightCm: heightNumber, weightKg: weightNumber });
        router.push("/onboarding/experience");
      }}
    >
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <SelectableCard label="Hombre" selected={sex === "male"} onPress={() => setSex("male")} />
        </View>
        <View style={{ flex: 1 }}>
          <SelectableCard label="Mujer" selected={sex === "female"} onPress={() => setSex("female")} />
        </View>
      </View>
      <TextField
        value={age}
        onChangeText={setAge}
        placeholder="Edad (años)"
        keyboardType="number-pad"
        style={{ marginBottom: spacing.sm }}
      />
      <TextField
        value={heightCm}
        onChangeText={setHeightCm}
        placeholder="Estatura (cm)"
        keyboardType="number-pad"
        style={{ marginBottom: spacing.sm }}
      />
      <TextField value={weightKg} onChangeText={setWeightKg} placeholder="Peso (kg)" keyboardType="decimal-pad" />
    </StepLayout>
  );
}
