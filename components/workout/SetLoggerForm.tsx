import { useState } from "react";
import { View } from "react-native";

import { useAppTheme } from "@/components/theme";
import { Button, TextField } from "@/components/ui";
import type { ActiveExerciseState } from "@/logic/session";

import { IsometricHoldTimer } from "./IsometricHoldTimer";
import { RpeSelector } from "./RpeSelector";

export type SetLoggerFormProps = {
  exercise: ActiveExerciseState;
  onLogSet: (reps: number, weightKg: number, rpe: number) => void;
  onSkip: () => void;
};

/**
 * Formulario para registrar la siguiente serie. El padre lo monta con
 * `key={sessionExerciseId}`: así React lo remonta de cero en cada ejercicio
 * nuevo y los valores iniciales (reps sugeridas, último peso usado) se
 * calculan una sola vez al montar, sin necesidad de un efecto que reinicie
 * el formulario a mano.
 */
export function SetLoggerForm({ exercise, onLogSet, onSkip }: SetLoggerFormProps) {
  const { spacing } = useAppTheme();
  const isIsometric = exercise.exercise.movementPattern === "isometric";
  const lastSet = exercise.loggedSets[exercise.loggedSets.length - 1];

  const [reps, setReps] = useState(() => String(Math.round((exercise.targetRepsMin + exercise.targetRepsMax) / 2)));
  const [weight, setWeight] = useState(() => (lastSet ? String(lastSet.weightKg) : ""));
  const [rpe, setRpe] = useState(7);

  function handleLog() {
    const repsNum = Number(reps);
    const weightNum = Number(weight) || 0;
    if (!Number.isFinite(repsNum) || repsNum <= 0) return;
    onLogSet(repsNum, weightNum, rpe);
  }

  return (
    <View>
      {isIsometric ? <IsometricHoldTimer onStop={(seconds) => setReps(String(seconds))} /> : null}

      <TextField
        value={reps}
        onChangeText={setReps}
        placeholder={isIsometric ? "Segundos sostenidos" : "Repeticiones"}
        keyboardType="number-pad"
        style={{ marginBottom: spacing.sm }}
      />
      <TextField
        value={weight}
        onChangeText={setWeight}
        placeholder="Peso (kg, 0 si es sin peso)"
        keyboardType="decimal-pad"
        style={{ marginBottom: spacing.md }}
      />
      <RpeSelector value={rpe} onChange={setRpe} />

      <Button label="Registrar serie" onPress={handleLog} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }} />
      <Button label="Saltar ejercicio" variant="ghost" onPress={onSkip} />
    </View>
  );
}
