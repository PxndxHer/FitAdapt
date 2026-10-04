import { create } from "zustand";

import type { Profile } from "@/types";

type ProfileState = {
  profile: Profile | null;
  /** false mientras no se ha intentado cargar el perfil desde la base de datos todavía. */
  isLoaded: boolean;
  setProfile: (profile: Profile | null) => void;
};

/**
 * Copia en memoria del perfil del usuario (fila única en SQLite), para que
 * cualquier pantalla lo lea sin volver a consultar la base de datos. Se carga
 * una vez al abrir la app (ver app/_layout.tsx) y se actualiza cuando el
 * onboarding o Perfil lo guardan.
 */
export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoaded: false,
  setProfile: (profile) => set({ profile, isLoaded: true }),
}));
