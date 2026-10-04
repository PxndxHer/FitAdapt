import { create } from "zustand";

import type { Settings } from "@/types";

type SettingsState = {
  settings: Settings | null;
  isLoaded: boolean;
  setSettings: (settings: Settings) => void;
};

/** Copia en memoria de las preferencias generales (fila única en SQLite), cargada una vez al abrir la app. */
export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoaded: false,
  setSettings: (settings) => set({ settings, isLoaded: true }),
}));
