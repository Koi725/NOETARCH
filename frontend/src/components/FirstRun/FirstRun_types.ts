export type FirstRunProps = Record<string, never>;

export interface FirstRunFormState {
  workspacePath: string;
  researchQuestion: string;
  selectedSources: string[];
  cloudPreference: string;
  spendingLimit: number;
  egressPolicy: string | null;
}

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
