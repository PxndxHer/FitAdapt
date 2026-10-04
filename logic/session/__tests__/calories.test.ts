import { estimateCalories, estimateSessionCalories } from "../calories";

describe("estimateCalories", () => {
  it("calcula kcal con la fórmula MET x 3.5 x peso / 200 por minuto", () => {
    // MET 5, 70kg, 10 min => (5*3.5*70/200)*10 = 61.25
    expect(estimateCalories(5, 70, 10)).toBeCloseTo(61.25, 2);
  });

  it("es cero con cero minutos", () => {
    expect(estimateCalories(5, 70, 0)).toBe(0);
  });
});

describe("estimateSessionCalories", () => {
  it("promedia el MET de cada serie y lo aplica a la duración total", () => {
    const calories = estimateSessionCalories([5, 5, 7, 7], 40, 80);
    // promedio MET = 6, (6*3.5*80/200)*40 = 336
    expect(calories).toBeCloseTo(336, 1);
  });

  it("devuelve 0 sin series o sin duración", () => {
    expect(estimateSessionCalories([], 40, 80)).toBe(0);
    expect(estimateSessionCalories([5], 0, 80)).toBe(0);
  });
});
