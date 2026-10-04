import { router } from "expo-router";

import { StepLayout } from "@/components/onboarding/StepLayout";
import { SelectableCard } from "@/components/ui";
import { useOnboardingStore } from "@/stores/onboardingStore";
import type { Equipment } from "@/types";

const EQUIPMENT_OPTIONS: { value: Equipment; label: string; description: string }[] = [
  { value: "bodyweight", label: "Peso corporal", description: "Sin ningún equipo, en cualquier lugar." },
  { value: "dumbbells", label: "Mancuernas", description: "Tengo mancuernas en casa." },
  { value: "bands", label: "Bandas elásticas", description: "Tengo bandas de resistencia." },
  { value: "full_gym", label: "Gimnasio completo", description: "Tengo acceso a barras, máquinas y poleas." },
];

export default function EquipmentStep() {
  const equipment = useOnboardingStore((s) => s.draft.equipment);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);

  const toggle = (value: Equipment) => {
    const has = equipment.includes(value);
    updateDraft({ equipment: has ? equipment.filter((e) => e !== value) : [...equipment, value] });
  };

  return (
    <StepLayout
      step="equipment"
      title="¿Con qué equipo cuentas?"
      subtitle="Elige todo lo que tengas disponible; puedes marcar varias opciones."
      continueDisabled={equipment.length === 0}
      onContinue={() => router.push("/onboarding/injuries")}
    >
      {EQUIPMENT_OPTIONS.map((item) => (
        <SelectableCard
          key={item.value}
          label={item.label}
          description={item.description}
          selected={equipment.includes(item.value)}
          onPress={() => toggle(item.value)}
        />
      ))}
    </StepLayout>
  );
}
