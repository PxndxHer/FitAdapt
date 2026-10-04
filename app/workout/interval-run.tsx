import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Button, ConfettiBurst } from "@/components/ui";
import { StartCountdown } from "@/components/workout";
import { useCountdownSeconds } from "@/hooks/useCountdownSeconds";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { IntervalMode } from "@/logic/interval";
import { useSettingsStore } from "@/stores/settingsStore";

type Phase = "countdown" | "work" | "rest" | "done";

/** Ejecuta el temporizador de intervalos armado en interval-setup: ciclos de trabajo/descanso con color y sonido distintos por fase. */
export default function IntervalRunScreen() {
  const { mode, work, rest, rounds } = useLocalSearchParams<{ mode: IntervalMode; work: string; rest: string; rounds: string }>();
  const { spacing, colors } = useAppTheme();
  const soundEnabled = useSettingsStore((s) => s.settings?.soundEnabled ?? true);
  const sound = useSoundEffects(soundEnabled);

  const workSeconds = Number(work);
  const restSeconds = Number(rest);
  const totalRounds = Number(rounds);
  const isAmrap = mode === "amrap";

  const [phase, setPhase] = useState<Phase>("countdown");
  const [round, setRound] = useState(1);
  const [phaseEndAt, setPhaseEndAt] = useState<number | null>(null);
  const [amrapRounds, setAmrapRounds] = useState(0);
  const lastWarned = useRef<number | null>(null);

  const remaining = useCountdownSeconds(phaseEndAt);

  function startWork() {
    setPhase("work");
    setPhaseEndAt(Date.now() + workSeconds * 1000);
    lastWarned.current = null;
  }

  function startRest() {
    setPhase("rest");
    setPhaseEndAt(Date.now() + restSeconds * 1000);
    lastWarned.current = null;
  }

  // Aviso en los últimos 3 segundos de cada fase.
  useEffect(() => {
    if ((phase !== "work" && phase !== "rest") || remaining <= 0 || remaining > 3) return;
    if (lastWarned.current === remaining) return;
    lastWarned.current = remaining;
    sound.playBeep();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining]);

  // Transición de fase cuando el tiempo llega a 0: reacciona al reloj real
  // (sistema externo), no a props/estado que se pudieran derivar en el
  // render — es exactamente el caso que el propio lint permite.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (phaseEndAt === null || remaining > 0) return;

    if (phase === "work") {
      if (round < totalRounds) {
        if (restSeconds > 0) {
          sound.playRestEnd();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          startRest();
        } else {
          setRound((r) => r + 1);
          sound.playBeep();
          startWork();
        }
      } else {
        setPhase("done");
        setPhaseEndAt(null);
        sound.playComplete();
      }
    } else if (phase === "rest") {
      setRound((r) => r + 1);
      sound.playBeep();
      startWork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phaseEndAt]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleExit() {
    router.replace("/(tabs)/entrenar");
  }

  if (phase === "countdown") {
    return <StartCountdown onTick={sound.playBeep} onDone={startWork} />;
  }

  if (phase === "done") {
    return (
      <Screen style={{ justifyContent: "center", alignItems: "center" }}>
        <ConfettiBurst />
        <ThemedText variant="title" style={{ marginBottom: spacing.lg }}>
          ¡Completado!
        </ThemedText>
        {isAmrap ? (
          <ThemedText muted style={{ marginBottom: spacing.lg }}>
            Rondas completadas: {amrapRounds}
          </ThemedText>
        ) : null}
        <Button label="Volver" onPress={handleExit} />
      </Screen>
    );
  }

  const phaseColor = phase === "work" ? colors.tint : colors.success;

  return (
    <Screen style={{ backgroundColor: phaseColor, justifyContent: "center", alignItems: "center" }}>
      <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm, color: "#FFFFFF" }}>
        {phase === "work" ? "TRABAJO" : "DESCANSO"}
      </ThemedText>
      <ThemedText style={{ fontSize: 96, color: "#FFFFFF" }}>{remaining}</ThemedText>
      {!isAmrap ? (
        <ThemedText style={{ color: "#FFFFFF", marginTop: spacing.md }}>
          Ronda {round} de {totalRounds}
        </ThemedText>
      ) : null}

      {isAmrap ? (
        <Button label={`+1 ronda (${amrapRounds})`} onPress={() => setAmrapRounds((r) => r + 1)} style={{ marginTop: spacing.lg }} />
      ) : null}

      <Button label="Salir" variant="ghost" onPress={handleExit} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
