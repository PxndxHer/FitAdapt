import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Badge, Button, Card, SkeletonBlock, StaggerItem } from "@/components/ui";
import { EQUIPMENT_LABELS } from "@/constants/labels";
import { getActiveSession, listExercises, startSession, useDb } from "@/db";
import { buildActiveExercisesFromSession, buildActiveExercisesFromSlots } from "@/logic/session";
import { recommendTodayWorkout, type RecommendedWorkout } from "@/logic/recommender";
import { useActiveSessionStore } from "@/stores/activeSessionStore";
import { useProfileStore } from "@/stores/profileStore";
import type { Exercise, WorkoutSession } from "@/types";

const todayLabel = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

/** Pantalla de Inicio: saludo, fecha, aviso de entrenamiento sin terminar (si hay) y recomendación de hoy. */
export default function InicioScreen() {
  const { spacing, colors } = useAppTheme();
  const db = useDb();
  const profile = useProfileStore((s) => s.profile);
  const hydrate = useActiveSessionStore((s) => s.hydrate);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [unfinishedSession, setUnfinishedSession] = useState<WorkoutSession | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    listExercises(db).then(setExercises);
    getActiveSession(db).then(setUnfinishedSession);
  }, [db]);

  const recommendation: RecommendedWorkout | null = useMemo(() => {
    if (!profile || !exercises) return null;
    return recommendTodayWorkout(
      {
        now: new Date().toISOString(),
        profile: {
          goal: profile.goal,
          experienceLevel: profile.experienceLevel,
          equipment: profile.equipment,
          injuries: profile.injuries,
        },
        exercises,
        recentSets: [],
        recentOutcomes: [],
      },
      { availableMinutes: profile.sessionDurationMin }
    );
  }, [profile, exercises]);

  async function handleResume() {
    if (!unfinishedSession || !exercises) return;
    const exercisesById = new Map(exercises.map((e) => [e.id, e]));
    hydrate({
      sessionId: unfinishedSession.id,
      startedAtMs: new Date(unfinishedSession.startedAt).getTime(),
      currentExerciseIndex: unfinishedSession.currentExerciseIndex,
      exercises: buildActiveExercisesFromSession(unfinishedSession, exercisesById),
      phase: "logging",
    });
    router.push("/workout/active");
  }

  async function handleStart() {
    if (!recommendation || recommendation.slots.length === 0 || starting) return;
    setStarting(true);
    try {
      const plan = recommendation.slots.map((slot) => ({
        exerciseId: slot.exercise.id,
        targetSets: slot.targetSets,
        targetRepsMin: slot.targetRepsMin,
        targetRepsMax: slot.targetRepsMax,
        targetRestSeconds: slot.targetRestSeconds,
      }));
      const started = await startSession(db, plan);
      hydrate({
        sessionId: started.sessionId,
        startedAtMs: started.startedAtMs,
        currentExerciseIndex: 0,
        exercises: buildActiveExercisesFromSlots(recommendation.slots, started.sessionExerciseIds),
        phase: "countdown",
      });
      router.push("/workout/active");
    } finally {
      setStarting(false);
    }
  }

  // (tabs) solo se monta con perfil cargado (ver Stack.Protected en app/_layout.tsx).
  if (!profile) return null;

  return (
    <Screen>
      <ThemedText variant="title">Hola, {profile.name.split(" ")[0]}</ThemedText>
      <ThemedText muted style={{ marginTop: 4, marginBottom: spacing.lg, textTransform: "capitalize" }}>
        {todayLabel}
      </ThemedText>

      {unfinishedSession ? (
        <Card elevation="none" style={{ backgroundColor: `${colors.tint}1A`, marginBottom: spacing.md }}>
          <ThemedText variant="subtitle">Tienes un entrenamiento sin terminar</ThemedText>
          <ThemedText muted style={{ marginTop: 4, marginBottom: spacing.md }}>
            Puedes seguir donde lo dejaste.
          </ThemedText>
          <Button label="Continuar entrenamiento" onPress={handleResume} />
        </Card>
      ) : null}

      <Card>
        <ThemedText variant="subtitle">Entrenamiento recomendado de hoy</ThemedText>

        {!recommendation ? (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            <SkeletonBlock height={56} />
            <SkeletonBlock height={56} />
            <SkeletonBlock height={56} />
          </View>
        ) : (
          <>
            <ThemedText muted variant="caption" style={{ marginTop: 4, marginBottom: spacing.md }}>
              Unos {recommendation.estimatedMinutes} minutos · {profile.sessionDurationMin} min disponibles
            </ThemedText>
            {recommendation.slots.slice(0, 4).map((slot, index) => (
              <StaggerItem key={slot.exercise.id} index={index}>
                <View style={{ marginBottom: spacing.md }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <ThemedText style={{ flex: 1 }}>{slot.exercise.name}</ThemedText>
                    <Badge label={EQUIPMENT_LABELS[slot.exercise.equipment[0]]} tone="tint" />
                  </View>
                  <ThemedText muted variant="caption">
                    {slot.targetSets} series · {slot.targetRepsMin}-{slot.targetRepsMax} reps
                  </ThemedText>
                  <ThemedText muted variant="caption" style={{ marginTop: 2 }}>
                    {slot.explanation}
                  </ThemedText>
                </View>
              </StaggerItem>
            ))}
            <Button
              label={starting ? "Preparando…" : "Comenzar entrenamiento"}
              onPress={handleStart}
              disabled={starting || Boolean(unfinishedSession)}
              style={{ marginBottom: spacing.sm }}
            />
            <Button label="Ver biblioteca de ejercicios" variant="secondary" onPress={() => router.push("/entrenar")} />
          </>
        )}
      </Card>
    </Screen>
  );
}
