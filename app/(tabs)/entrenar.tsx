import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/components/theme";
import { Badge, Button, Card, Chip, EmptyState, ExerciseImage, PressableScale, SkeletonBlock, StaggerItem, TextField } from "@/components/ui";
import { EXERCISE_TYPE_LABELS, MUSCLE_LABELS } from "@/constants/labels";
import { listExercises, useDb } from "@/db";
import type { BadgeTone } from "@/components/ui";
import type { Exercise, ExerciseType } from "@/types";

const TYPE_OPTIONS = Object.entries(EXERCISE_TYPE_LABELS) as [ExerciseType, string][];

const DIFFICULTY_TONE: Record<number, BadgeTone> = {
  1: "success",
  2: "success",
  3: "warning",
  4: "danger",
  5: "danger",
};

/** Pantalla de Entrenar: biblioteca de ejercicios navegable, con búsqueda y filtro por tipo. */
export default function EntrenarScreen() {
  const { spacing } = useAppTheme();
  const db = useDb();
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ExerciseType | null>(null);

  useEffect(() => {
    listExercises(db).then(setExercises);
  }, [db]);

  const filtered = useMemo(() => {
    if (!exercises) return [];
    const term = search.trim().toLowerCase();
    return exercises.filter((e) => {
      if (typeFilter && e.type !== typeFilter) return false;
      if (term && !e.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [exercises, search, typeFilter]);

  return (
    <Screen>
      <ThemedText variant="title">Entrenar</ThemedText>
      <ThemedText muted style={{ marginTop: 4, marginBottom: spacing.md }}>
        Explora la biblioteca de ejercicios y toca uno para ver los detalles.
      </ThemedText>

      <Button
        label="Modo intervalos (HIIT / Tabata / EMOM / AMRAP)"
        variant="secondary"
        onPress={() => router.push("/workout/interval-setup")}
        style={{ marginBottom: spacing.md }}
      />

      <TextField value={search} onChangeText={setSearch} placeholder="Buscar ejercicio..." style={{ marginBottom: spacing.sm }} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md, flexGrow: 0 }}>
        <Chip label="Todos" selected={typeFilter === null} onPress={() => setTypeFilter(null)} />
        {TYPE_OPTIONS.map(([value, label]) => (
          <Chip key={value} label={label} selected={typeFilter === value} onPress={() => setTypeFilter(value)} />
        ))}
      </ScrollView>

      {exercises === null ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} height={72} borderRadius={16} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Sin resultados"
          message="No encontramos ejercicios con esos filtros. Prueba con otra búsqueda."
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <StaggerItem index={index % 12}>
              <PressableScale onPress={() => router.push(`/exercise/${item.id}`)} style={{ marginBottom: spacing.sm }}>
                <Card elevation="sm">
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ExerciseImage imageKey={item.imageKey} muscleGroup={item.primaryMuscle} size={48} />
                    <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                      <ThemedText variant="subtitle">{item.name}</ThemedText>
                      <ThemedText muted variant="caption" style={{ marginTop: 2, textTransform: "capitalize" }}>
                        {MUSCLE_LABELS[item.primaryMuscle]}
                      </ThemedText>
                    </View>
                    <Badge label={`Nivel ${item.difficulty}`} tone={DIFFICULTY_TONE[item.difficulty]} />
                  </View>
                </Card>
              </PressableScale>
            </StaggerItem>
          )}
        />
      )}
    </Screen>
  );
}
