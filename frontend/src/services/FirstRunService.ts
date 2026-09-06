import type { OnboardingConfig } from "@/contracts/first-run";

export interface FirstRunService {
  getOnboardingConfig(): OnboardingConfig;
}

import {
  STEP_COUNT,
  firstRunSteps,
  workspaceDefaults,
  researchQuestionDefaults,
  sourceOptions,
  defaultSelectedSources,
  cloudOptions,
  defaultCloudOption,
  spendingLimitDefaults,
  egressOptions,
  egressDefault,
  egressNote,
} from "@/data/FirstRun/FirstRun-data";

export const mockFirstRunService: FirstRunService = {
  getOnboardingConfig: () => ({
    stepCount: STEP_COUNT,
    steps: firstRunSteps,
    workspaceDefaults,
    researchQuestionDefaults,
    sourceOptions,
    defaultSelectedSources: [...defaultSelectedSources],
    cloudOptions,
    defaultCloudOption,
    spendingLimitDefaults,
    egressOptions,
    egressDefault,
    egressNote,
  }),
};
