import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Badge, Button, Card, ExerciseImage, SkeletonBlock, StaggerItem } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { EQUIPMENT_LABELS, EXERCISE_TYPE_LABELS, GOAL_LABELS, MUSCLE_LABELS } from "@/constants/labels";
import { getExerciseById, useDb } from "@/db";
import { useProfileStore } from "@/stores/profileStore";
import type { Exercise } from "@/types";

const DIFFICULTY_TONE: Record<number, BadgeTone> = {
  1: "success",
  2: "success",
  3: "warning",
  4: "danger",
  5: "danger",
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spacing, colors } = useAppTheme();
  const db = useDb();
  const profile = useProfileStore((s) => s.profile);
  const [exercise, setExercise] = useState<Exercise | null | undefined>(undefined);

  useEffect(() => {
    // Cada variante (fácil/difícil) navega con router.push a una nueva
    // instancia de esta pantalla, así que el estado inicial "undefined" ya
    // representa la carga de cada id sin necesidad de reiniciarlo a mano.
    getExerciseById(db, id).then(setExercise);
  }, [db, id]);

  const range = exercise && profile ? exercise.recommendedRanges[profile.goal] : undefined;

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: exercise?.name ?? "Ejercicio" }} />

      {exercise === undefined ? (
        <View style={{ gap: spacing.sm }}>
          <SkeletonBlock height={200} borderRadius={16} />
          <SkeletonBlock height={28} width="70%" />
          <SkeletonBlock height={80} />
          <SkeletonBlock height={120} />
        </View>
      ) : exercise === null ? (
        <ThemedText muted>No encontramos este ejercicio.</ThemedText>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
          <ExerciseImage
            imageKey={exercise.imageKey}
            muscleGroup={exercise.primaryMuscle}
            size={220}
            borderRadius={16}
          />

          <ThemedText variant="title" style={{ marginTop: spacing.lg }}>
            {exercise.name}
          </ThemedText>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.lg }}>
            <Badge label={EXERCISE_TYPE_LABELS[exercise.type]} tone="tint" />
            <Badge label={`Nivel ${exercise.difficulty}`} tone={DIFFICULTY_TONE[exercise.difficulty]} />
            {exercise.equipment.map((eq) => (
              <Badge key={eq} label={EQUIPMENT_LABELS[eq]} />
            ))}
            <Badge label={exercise.isCompound ? "Compuesto" : "Aislamiento"} />
            {exercise.isUnilateral ? <Badge label="Unilateral" /> : null}
          </View>

          {range && profile ? (
            <Card elevation="none" style={{ backgroundColor: colors.border, marginBottom: spacing.lg }}>
              <ThemedText variant="subtitle">Para tu objetivo: {GOAL_LABELS[profile.goal]}</ThemedText>
              <ThemedText muted style={{ marginTop: 4 }}>
                {range.sets[0]}-{range.sets[1]} series · {range.repsMin}-{range.repsMax} reps · descanso {range.restSeconds[0]}-
                {range.restSeconds[1]}s
              </ThemedText>
            </Card>
          ) : null}

          <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>
            Músculos trabajados
          </ThemedText>
          <ThemedText muted style={{ marginBottom: spacing.lg, textTransform: "capitalize" }}>
            {MUSCLE_LABELS[exercise.primaryMuscle]}
            {exercise.secondaryMuscles.length > 0
              ? ` · ${exercise.secondaryMuscles.map((m) => MUSCLE_LABELS[m]).join(", ")}`
              : ""}
          </ThemedText>

          <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>
            Cómo hacerlo
          </ThemedText>
          {exercise.instructions.map((step, index) => (
            <StaggerItem key={index} index={index}>
              <View style={{ flexDirection: "row", marginBottom: spacing.sm }}>
                <ThemedText style={{ color: colors.tint, marginRight: spacing.sm }}>{index + 1}.</ThemedText>
                <ThemedText style={{ flex: 1 }}>{step}</ThemedText>
              </View>
            </StaggerItem>
          ))}

          {exercise.commonMistakes.length > 0 ? (
            <>
              <ThemedText variant="subtitle" style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
                Errores comunes
              </ThemedText>
              {exercise.commonMistakes.map((mistake, index) => (
                <View key={index} style={{ flexDirection: "row", marginBottom: spacing.xs }}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.warning} style={{ marginRight: spacing.xs, marginTop: 2 }} />
                  <ThemedText muted style={{ flex: 1 }}>
                    {mistake}
                  </ThemedText>
                </View>
              ))}
            </>
          ) : null}

          {exercise.easierVariantId || exercise.harderVariantId ? (
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg }}>
              {exercise.easierVariantId ? (
                <Button
                  label="Más fácil"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/exercise/${exercise.easierVariantId}`)}
                />
              ) : null}
              {exercise.harderVariantId ? (
                <Button
                  label="Más difícil"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/exercise/${exercise.harderVariantId}`)}
                />
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}
