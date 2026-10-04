import { estimateOneRepMax, isPersonalRecord } from "../records";

describe("estimateOneRepMax", () => {
  it("devuelve el mismo peso cuando la serie fue de 1 repetición", () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it("aplica la fórmula de Epley para más de una repetición", () => {
    // 100 * (1 + 10/30) = 133.33...
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.33, 1);
  });
});

describe("isPersonalRecord", () => {
  it("es récord si el 1RM estimado supera el mejor histórico", () => {
    const historical = [{ reps: 8, weightKg: 80 }];
    expect(isPersonalRecord({ reps: 8, weightKg: 85 }, historical)).toBe(true);
  });

  it("no es récord si no supera el mejor histórico", () => {
    const historical = [{ reps: 8, weightKg: 90 }];
    expect(isPersonalRecord({ reps: 8, weightKg: 85 }, historical)).toBe(false);
  });

  it("sin historial, la primera serie con peso ya cuenta como récord", () => {
    expect(isPersonalRecord({ reps: 10, weightKg: 20 }, [])).toBe(true);
  });

  it("nunca es récord si la serie no tiene peso externo (isométrico/bodyweight)", () => {
    expect(isPersonalRecord({ reps: 30, weightKg: 0 }, [])).toBe(false);
  });

  it("compara por 1RM estimado, no solo por peso levantado", () => {
    // Menos peso pero muchas más reps puede superar el 1RM estimado de una serie pesada de pocas reps.
    const historical = [{ reps: 2, weightKg: 100 }]; // 1RM ≈ 106.7
    expect(isPersonalRecord({ reps: 15, weightKg: 80 }, historical)).toBe(true); // 1RM = 120
  });
});
