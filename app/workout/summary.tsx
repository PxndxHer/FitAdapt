import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Button, Card, ConfettiBurst, SkeletonBlock } from "@/components/ui";
import { getHistoricalSetsForExercise, getSessionById, listExercises, useDb } from "@/db";
import { buildSessionSummary, type SessionSummary } from "@/logic/session";
import { useActiveSessionStore } from "@/stores/activeSessionStore";
import { useProfileStore } from "@/stores/profileStore";

/** Resumen animado al terminar un entrenamiento: duración, volumen, calorías, récords y sugerencias para la próxima vez. */
export default function WorkoutSummaryScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { spacing, colors } = useAppTheme();
  const db = useDb();
  const profile = useProfileStore((s) => s.profile);
  const resetActiveSession = useActiveSessionStore((s) => s.reset);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!profile) return;
      const session = await getSessionById(db, sessionId);
      if (!session) return;

      const allExercises = await listExercises(db);
      const exerciseInfo = new Map(allExercises.map((e) => [e.id, { name: e.name, met: e.met }]));

      const completedIds = Array.from(
        new Set(
          session.exercises.filter((e) => e.status === "completed").map((e) => e.substitutedWithExerciseId ?? e.exerciseId)
        )
      );
      const historicalEntries = await Promise.all(
        completedIds.map(async (id) => [id, await getHistoricalSetsForExercise(db, id, sessionId)] as const)
      );

      const result = buildSessionSummary(session, exerciseInfo, new Map(historicalEntries), profile.weightKg);
      if (!cancelled) setSummary(result);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [db, sessionId, profile]);

  function handleDone() {
    resetActiveSession();
    router.replace("/(tabs)");
  }

  return (
    <Screen style={{ justifyContent: "center" }}>
      {showConfetti ? <ConfettiBurst onDone={() => setShowConfetti(false)} /> : null}

      <ThemedText variant="title" style={{ textAlign: "center", marginBottom: spacing.lg }}>
        ¡Entrenamiento terminado!
      </ThemedText>

      {!summary ? (
        <View style={{ gap: spacing.sm }}>
          <SkeletonBlock height={100} />
          <SkeletonBlock height={100} />
        </View>
      ) : (
        <>
          <Card style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              <Stat label="Duración" value={`${summary.durationMin} min`} />
              <Stat label="Volumen" value={`${summary.totalVolumeKg} kg`} />
              <Stat label="Calorías" value={`${summary.estimatedCalories}`} />
            </View>
          </Card>

          {summary.personalRecords.length > 0 ? (
            <Card elevation="none" style={{ backgroundColor: `${colors.success}22`, marginBottom: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm }}>
                <Ionicons name="trophy" size={18} color={colors.success} />
                <ThemedText variant="subtitle">Récords personales</ThemedText>
              </View>
              {summary.personalRecords.map((pr) => (
                <ThemedText key={pr.exerciseId}>{pr.exerciseName}</ThemedText>
              ))}
            </Card>
          ) : null}

          {summary.adaptiveHints.length > 0 ? (
            <Card style={{ marginBottom: spacing.md }}>
              <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>
                Para la próxima vez
              </ThemedText>
              {summary.adaptiveHints.map((hint) => (
                <ThemedText key={hint.exerciseId} muted style={{ marginBottom: 4 }}>
                  {hint.message}
                </ThemedText>
              ))}
            </Card>
          ) : null}
        </>
      )}

      <Button label="Volver a inicio" onPress={handleDone} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <ThemedText variant="title">{value}</ThemedText>
      <ThemedText muted variant="caption">
        {label}
      </ThemedText>
    </View>
  );
}
