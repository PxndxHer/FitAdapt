import { useEffect, useState } from "react";
import { AppState } from "react-native";

function remainingSeconds(targetMs: number | null): number {
  return targetMs ? Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)) : 0;
}

/**
 * Segundos restantes hasta `targetMs` (0 si ya pasó), recalculado siempre a
 * partir del reloj real. Igual que `useElapsedSeconds`, inmune a que el
 * intervalo se pause en segundo plano: al volver a primer plano recalcula.
 */
export function useCountdownSeconds(targetMs: number | null): number {
  const [remaining, setRemaining] = useState(() => remainingSeconds(targetMs));

  useEffect(() => {
    setRemaining(remainingSeconds(targetMs));
    if (!targetMs) return;

    const interval = setInterval(() => setRemaining(remainingSeconds(targetMs)), 250);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setRemaining(remainingSeconds(targetMs));
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [targetMs]);

  return remaining;
}
