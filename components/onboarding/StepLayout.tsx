import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Button, ProgressDots } from "@/components/ui";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/stores/onboardingStore";

export type StepLayoutProps = PropsWithChildren<{
  step: OnboardingStep;
  title: string;
  subtitle?: string;
  continueLabel?: string;
  onContinue: () => void;
  continueDisabled?: boolean;
}>;

/**
 * Estructura común a cada pantalla del onboarding: indicador de progreso y
 * título fijos arriba, contenido con scroll en medio (algunos pasos tienen
 * más opciones de las que caben en pantallas chicas) y botón de continuar
 * siempre visible abajo, nunca empujado fuera de la vista por el contenido.
 */
export function StepLayout({
  step,
  title,
  subtitle,
  continueLabel = "Continuar",
  onContinue,
  continueDisabled = false,
  children,
}: StepLayoutProps) {
  const { spacing } = useAppTheme();
  const currentIndex = ONBOARDING_STEPS.indexOf(step);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <ProgressDots total={ONBOARDING_STEPS.length} currentIndex={currentIndex} />
        <ThemedText variant="title" style={{ marginTop: spacing.lg }}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText muted style={{ marginTop: spacing.xs }}>
            {subtitle}
          </ThemedText>
        ) : null}

        <ScrollView
          style={{ flex: 1, marginTop: spacing.lg }}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        <Button label={continueLabel} onPress={onContinue} disabled={continueDisabled} style={{ marginBottom: spacing.md }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
