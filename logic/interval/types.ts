export type IntervalMode = "tabata" | "hiit" | "emom" | "amrap";

export type IntervalPreset = {
  mode: IntervalMode;
  label: string;
  description: string;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
};
