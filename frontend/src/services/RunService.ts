import type { RunMeta, WorkflowStep, StepInspector, RunKPI, RunEvent, LiveRunDecision, LiveRunEvidenceCard } from "@/contracts/run";

export interface LiveRunData {
  meta: RunMeta;
  steps: WorkflowStep[];
  stepInspector: StepInspector;
  kpis: RunKPI[];
  events: RunEvent[];
  decisions: LiveRunDecision[];
  evidenceCards: LiveRunEvidenceCard[];
}

export interface RunService {
  getLiveRunData(): LiveRunData;
}

import {
  liveRunMeta,
  liveRunSteps,
  currentStepInspector,
  liveRunKPIs,
  liveRunEvents,
  liveRunDecisions,
  liveRunEvidenceCards,
} from "@/data/LiveRun/LiveRun-data";

export const mockRunService: RunService = {
  getLiveRunData: () => ({
    meta: liveRunMeta,
    steps: liveRunSteps,
    stepInspector: currentStepInspector,
    kpis: liveRunKPIs,
    events: liveRunEvents,
    decisions: liveRunDecisions,
    evidenceCards: liveRunEvidenceCards,
  }),
};
