import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Button, Chip, Stepper } from "@/components/ui";
import { INTERVAL_PRESETS, type IntervalMode } from "@/logic/interval";

const MODE_OPTIONS: IntervalMode[] = ["tabata", "hiit", "emom", "amrap"];

/** Configuración del modo de intervalos: elegir formato y ajustar tiempos antes de empezar. */
export default function IntervalSetupScreen() {
  const { spacing } = useAppTheme();
  const [mode, setMode] = useState<IntervalMode>("tabata");
  const [workSeconds, setWorkSeconds] = useState(INTERVAL_PRESETS.tabata.workSeconds);
  const [restSeconds, setRestSeconds] = useState(INTERVAL_PRESETS.tabata.restSeconds);
  const [rounds, setRounds] = useState(INTERVAL_PRESETS.tabata.rounds);

  function handleSelectMode(next: IntervalMode) {
    setMode(next);
    const preset = INTERVAL_PRESETS[next];
    setWorkSeconds(preset.workSeconds);
    setRestSeconds(preset.restSeconds);
    setRounds(preset.rounds);
  }

  function handleStart() {
    router.push({
      pathname: "/workout/interval-run",
      params: { mode, work: String(workSeconds), rest: String(restSeconds), rounds: String(rounds) },
    });
  }

  const isAmrap = mode === "amrap";

  return (
    <Screen>
      <ThemedText variant="title">Modo intervalos</ThemedText>
      <ThemedText muted style={{ marginTop: 4, marginBottom: spacing.lg }}>
        Elige un formato y ajusta los tiempos a tu gusto.
      </ThemedText>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.sm }}>
        {MODE_OPTIONS.map((m) => (
          <View key={m} style={{ marginBottom: spacing.xs }}>
            <Chip label={INTERVAL_PRESETS[m].label} selected={mode === m} onPress={() => handleSelectMode(m)} />
          </View>
        ))}
      </View>
      <ThemedText muted style={{ marginBottom: spacing.lg }}>
        {INTERVAL_PRESETS[mode].description}
      </ThemedText>

      {isAmrap ? (
        <Stepper
          label="Duración total"
          value={Math.round(workSeconds / 60)}
          onChange={(minutes) => setWorkSeconds(Math.max(1, minutes) * 60)}
          min={1}
          max={60}
          formatValue={(v) => `${v} min`}
        />
      ) : (
        <>
          <Stepper
            label="Tiempo de trabajo"
            value={workSeconds}
            onChange={setWorkSeconds}
            step={5}
            min={5}
            max={300}
            formatValue={(v) => `${v}s`}
          />
          <Stepper
            label="Tiempo de descanso"
            value={restSeconds}
            onChange={setRestSeconds}
            step={5}
            min={0}
            max={180}
            formatValue={(v) => `${v}s`}
          />
          <Stepper label="Rondas" value={rounds} onChange={setRounds} step={1} min={1} max={30} />
        </>
      )}

      <Button label="Comenzar" onPress={handleStart} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
