import type { IntervalMode, IntervalPreset } from "./types";

/**
 * Valores iniciales por formato; el usuario los puede ajustar libremente en
 * la pantalla de configuración. AMRAP se modela igual que los demás
 * (trabajo/descanso/rondas) con `restSeconds: 0` y `rounds: 1`: así un solo
 * motor de ciclos sirve para los 4 formatos — en AMRAP simplemente nunca
 * llega a haber una segunda ronda ni un descanso.
 */
export const INTERVAL_PRESETS: Record<IntervalMode, IntervalPreset> = {
  tabata: {
    mode: "tabata",
    label: "Tabata",
    description: "20s de trabajo, 10s de descanso, 8 rondas: el clásico.",
    workSeconds: 20,
    restSeconds: 10,
    rounds: 8,
  },
  hiit: {
    mode: "hiit",
    label: "HIIT",
    description: "Intervalos de alta intensidad a tu medida.",
    workSeconds: 30,
    restSeconds: 15,
    rounds: 10,
  },
  emom: {
    mode: "emom",
    label: "EMOM",
    description: "Trabaja y descansa el resto del minuto, cada minuto en punto.",
    workSeconds: 40,
    restSeconds: 20,
    rounds: 10,
  },
  amrap: {
    mode: "amrap",
    label: "AMRAP",
    description: "El mayor número de rondas posible en un tiempo fijo.",
    workSeconds: 600,
    restSeconds: 0,
    rounds: 1,
  },
};
