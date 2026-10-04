import { create } from "zustand";

import type { Equipment, ExperienceLevel, Goal, InjuryArea, Profile, Sex } from "@/types";

/** Orden de los pasos del onboarding, usado por <ProgressDots> en cada pantalla. */
export const ONBOARDING_STEPS = ["welcome", "physical", "experience", "schedule", "equipment", "injuries", "summary"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type OnboardingDraft = {
  name: string;
  sex: Sex | null;
  /** ISO yyyy-mm-dd; se arma a partir de la edad que ingresa el usuario. */
  birthDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  experienceLevel: ExperienceLevel | null;
  goal: Goal | null;
  daysPerWeek: number | null;
  sessionDurationMin: number | null;
  equipment: Equipment[];
  injuries: InjuryArea[];
};

const INITIAL_DRAFT: OnboardingDraft = {
  name: "",
  sex: null,
  birthDate: null,
  heightCm: null,
  weightKg: null,
  experienceLevel: null,
  goal: null,
  daysPerWeek: null,
  sessionDurationMin: null,
  equipment: [],
  injuries: [],
};

type OnboardingState = {
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
};

/** Borrador del perfil mientras el usuario pasa por los pasos del onboarding; se guarda en SQLite recién al final. */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  draft: INITIAL_DRAFT,
  updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  reset: () => set({ draft: INITIAL_DRAFT }),
}));

/** Precarga el borrador a partir de un perfil ya guardado, para reutilizar el onboarding como edición. */
export function profileToDraft(profile: Profile): OnboardingDraft {
  return {
    name: profile.name,
    sex: profile.sex,
    birthDate: profile.birthDate,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    experienceLevel: profile.experienceLevel,
    goal: profile.goal,
    daysPerWeek: profile.daysPerWeek,
    sessionDurationMin: profile.sessionDurationMin,
    equipment: profile.equipment,
    injuries: profile.injuries,
  };
}
