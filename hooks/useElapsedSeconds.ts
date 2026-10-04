import { useEffect, useState } from "react";
import { AppState } from "react-native";

/**
 * Segundos transcurridos desde `startedAtMs`, recalculado siempre a partir
 * del reloj real (Date.now()), nunca acumulando ticks de un intervalo: así
 * no se desincroniza si la app pasa a segundo plano y el intervalo se pausa
 * o se limita. Al volver a primer plano, recalcula de inmediato.
 */
export function useElapsedSeconds(startedAtMs: number | null): number {
  const [elapsed, setElapsed] = useState(() => (startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0));

  useEffect(() => {
    if (!startedAtMs) return;

    const tick = () => setElapsed(Math.floor((Date.now() - startedAtMs) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [startedAtMs]);

  return elapsed;
}
