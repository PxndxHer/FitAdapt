import { suggestNextLoad } from "../adaptiveHints";

describe("suggestNextLoad", () => {
  it("sugiere subir carga cuando el RPE promedio fue bajo", () => {
    const hint = suggestNextLoad("ex1", "Press de banca", [
      { reps: 10, weightKg: 60, rpe: 5 },
      { reps: 10, weightKg: 60, rpe: 6 },
    ]);
    expect(hint).not.toBeNull();
    expect(hint!.suggestedWeightDeltaKg).toBeGreaterThan(0);
    expect(hint!.message).toContain("Press de banca");
  });

  it("sugiere mantener o bajar cuando el RPE promedio fue muy alto", () => {
    const hint = suggestNextLoad("ex1", "Sentadilla", [
      { reps: 5, weightKg: 100, rpe: 9 },
      { reps: 5, weightKg: 100, rpe: 10 },
    ]);
    expect(hint).not.toBeNull();
    expect(hint!.suggestedWeightDeltaKg).toBeLessThanOrEqual(0);
  });

  it("no sugiere nada cuando el RPE está en un rango saludable", () => {
    const hint = suggestNextLoad("ex1", "Remo", [
      { reps: 8, weightKg: 40, rpe: 7 },
      { reps: 8, weightKg: 40, rpe: 8 },
    ]);
    expect(hint).toBeNull();
  });

  it("sin series, no hay sugerencia", () => {
    expect(suggestNextLoad("ex1", "Curl", [])).toBeNull();
  });

  it("para ejercicios sin peso externo, sugiere una variante más difícil en vez de kg", () => {
    const hint = suggestNextLoad("ex1", "Flexión de pecho", [
      { reps: 20, weightKg: 0, rpe: 4 },
      { reps: 20, weightKg: 0, rpe: 5 },
    ]);
    expect(hint).not.toBeNull();
    expect(hint!.suggestedWeightDeltaKg).toBe(0);
    expect(hint!.message).toContain("variante más difícil");
  });
});
