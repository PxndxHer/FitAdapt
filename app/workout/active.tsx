import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Button, ExerciseImage } from "@/components/ui";
import { RestRing, SessionHeader, SetLoggerForm, StartCountdown } from "@/components/workout";
import {
  finishSession,
  logSet,
  updateCurrentExerciseIndex,
  updateSessionExerciseStatus,
  useDb,
} from "@/db";
import { useCountdownSeconds } from "@/hooks/useCountdownSeconds";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cancelNotification, requestNotificationPermission, scheduleRestEndNotification } from "@/notifications/restNotification";
import { useActiveSessionStore } from "@/stores/activeSessionStore";
import { useSettingsStore } from "@/stores/settingsStore";

/**
 * Pantalla única del entrenamiento activo: su contenido cambia según la fase
 * guardada en useActiveSessionStore (countdown -> logging <-> resting -> done).
 * Mantiene la pantalla encendida mientras está montada.
 */
export default function ActiveWorkoutScreen() {
  useKeepAwake();

  const { spacing } = useAppTheme();
  const db = useDb();
  const soundEnabled = useSettingsStore((s) => s.settings?.soundEnabled ?? true);
  const sound = useSoundEffects(soundEnabled);

  const sessionId = useActiveSessionStore((s) => s.sessionId);
  const startedAtMs = useActiveSessionStore((s) => s.startedAtMs);
  const exercises = useActiveSessionStore((s) => s.exercises);
  const currentExerciseIndex = useActiveSessionStore((s) => s.currentExerciseIndex);
  const phase = useActiveSessionStore((s) => s.phase);
  const restEndAtMs = useActiveSessionStore((s) => s.restEndAtMs);
  const restNotificationId = useActiveSessionStore((s) => s.restNotificationId);
  const setPhase = useActiveSessionStore((s) => s.setPhase);
  const addLoggedSet = useActiveSessionStore((s) => s.addLoggedSet);
  const startRest = useActiveSessionStore((s) => s.startRest);
  const adjustRest = useActiveSessionStore((s) => s.adjustRest);
  const clearRest = useActiveSessionStore((s) => s.clearRest);
  const setExerciseStatus = useActiveSessionStore((s) => s.setExerciseStatus);
  const goToNextExercise = useActiveSessionStore((s) => s.goToNextExercise);

  const currentExercise = exercises[currentExerciseIndex];
  const restRemaining = useCountdownSeconds(restEndAtMs);
  const lastWarnedSecond = useRef<number | null>(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Sin sesión cargada (ej. se llegó aquí por error): volver a Inicio.
  useEffect(() => {
    if (!sessionId) router.replace("/(tabs)");
  }, [sessionId]);

  // Aviso en los últimos 3 segundos del descanso.
  useEffect(() => {
    if (phase !== "resting" || restRemaining <= 0 || restRemaining > 3) return;
    if (lastWarnedSecond.current === restRemaining) return;
    lastWarnedSecond.current = restRemaining;
    sound.playBeep();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // sound solo debe leerse, no retrigger el efecto en cada render de sound.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, restRemaining]);

  // Fin del descanso.
  useEffect(() => {
    if (phase !== "resting" || !restEndAtMs || restRemaining > 0) return;
    sound.playRestEnd();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    cancelNotification(restNotificationId);
    lastWarnedSecond.current = null;
    clearRest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, restEndAtMs, restRemaining]);

  async function beginRest(seconds: number) {
    const endAt = Date.now() + seconds * 1000;
    const notificationId = await scheduleRestEndNotification(seconds);
    startRest(endAt, notificationId);
  }

  async function finishCurrentExercise(status: "completed" | "skipped") {
    if (!currentExercise || !sessionId) return;
    setExerciseStatus(status);
    await updateSessionExerciseStatus(db, currentExercise.sessionExerciseId, status);

    const nextIndex = currentExerciseIndex + 1;
    await updateCurrentExerciseIndex(db, sessionId, Math.min(nextIndex, exercises.length - 1));

    if (nextIndex >= exercises.length) {
      await finishSession(db, sessionId);
      sound.playComplete();
      router.replace(`/workout/summary?sessionId=${sessionId}`);
      return;
    }
    goToNextExercise();
  }

  async function handleLogSet(repsNum: number, weightNum: number, rpe: number) {
    if (!currentExercise) return;

    const setIndex = currentExercise.loggedSets.length;
    addLoggedSet({ reps: repsNum, weightKg: weightNum, rpe });
    await logSet(db, currentExercise.sessionExerciseId, { setIndex, reps: repsNum, weightKg: weightNum, rpe });

    const wasLastSet = setIndex + 1 >= currentExercise.targetSets;
    if (wasLastSet) {
      await finishCurrentExercise("completed");
    } else {
      await beginRest(currentExercise.targetRestSeconds);
    }
  }

  if (!sessionId || !currentExercise) {
    return <Screen />;
  }

  if (phase === "countdown") {
    return <StartCountdown onTick={sound.playBeep} onDone={() => setPhase("logging")} />;
  }

  const isIsometric = currentExercise.exercise.movementPattern === "isometric";

  return (
    <Screen>
      <SessionHeader startedAtMs={startedAtMs!} currentExerciseIndex={currentExerciseIndex} totalExercises={exercises.length} />

      {phase === "resting" ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ThemedText variant="subtitle" style={{ marginBottom: spacing.lg }}>
            Descansando
          </ThemedText>
          <RestRing remainingSeconds={restRemaining} totalSeconds={currentExercise.targetRestSeconds} />
          <ThemedText muted style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
            Siguiente: {currentExercise.exercise.name}
          </ThemedText>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button label="-15s" variant="secondary" onPress={() => adjustRest(-15)} />
            <Button label="+15s" variant="secondary" onPress={() => adjustRest(15)} />
            <Button
              label="Saltar"
              variant="ghost"
              onPress={() => {
                cancelNotification(restNotificationId);
                lastWarnedSecond.current = null;
                clearRest();
              }}
            />
          </View>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
          <View style={{ alignItems: "center", marginBottom: spacing.md }}>
            <ExerciseImage
              imageKey={currentExercise.exercise.imageKey}
              muscleGroup={currentExercise.exercise.primaryMuscle}
              size={160}
              borderRadius={16}
            />
          </View>

          <ThemedText variant="title">{currentExercise.exercise.name}</ThemedText>
          <ThemedText muted style={{ marginTop: 4, marginBottom: spacing.md }}>
            Serie {currentExercise.loggedSets.length + 1} de {currentExercise.targetSets} · objetivo{" "}
            {currentExercise.targetRepsMin}-{currentExercise.targetRepsMax} {isIsometric ? "segundos" : "reps"}
          </ThemedText>

          {currentExercise.loggedSets.length > 0 ? (
            <View style={{ marginBottom: spacing.md }}>
              {currentExercise.loggedSets.map((s, i) => (
                <ThemedText key={i} muted variant="caption">
                  Serie {i + 1}: {s.reps} {isIsometric ? "s" : "reps"}
                  {s.weightKg > 0 ? ` · ${s.weightKg}kg` : ""} · RPE {s.rpe}
                </ThemedText>
              ))}
            </View>
          ) : null}

          <SetLoggerForm
            key={currentExercise.sessionExerciseId}
            exercise={currentExercise}
            onLogSet={handleLogSet}
            onSkip={() => finishCurrentExercise("skipped")}
          />
        </ScrollView>
      )}
    </Screen>
  );
}
