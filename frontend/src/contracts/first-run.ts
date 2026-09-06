export interface FirstRunSource {
  id: string;
  name: string;
  type: "free" | "paid";
  description: string;
}

export interface FirstRunCloudOption {
  id: string;
  label: string;
  description: string;
}

export interface FirstRunEgressOption {
  id: string;
  label: string;
  description: string;
}

export interface FirstRunStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface WorkspaceDefaults {
  defaultPath: string;
  note: string;
}

export interface ResearchQuestionDefaults {
  placeholder: string;
  hint: string;
}

export interface SpendingLimitDefaults {
  defaultLimit: number;
  note: string;
}

export interface OnboardingConfig {
  stepCount: number;
  steps: FirstRunStep[];
  workspaceDefaults: WorkspaceDefaults;
  researchQuestionDefaults: ResearchQuestionDefaults;
  sourceOptions: FirstRunSource[];
  defaultSelectedSources: string[];
  cloudOptions: FirstRunCloudOption[];
  defaultCloudOption: string;
  spendingLimitDefaults: SpendingLimitDefaults;
  egressOptions: FirstRunEgressOption[];
  egressDefault: string | null;
  egressNote: string;
}
