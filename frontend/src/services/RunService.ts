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

// ─── M6 async client ────────────────────────────────────────────────────────

/**
 * Fetches the active run from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data when the env var is absent, so the app runs standalone.
 */
export async function fetchLiveRunData(): Promise<LiveRunData> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockRunService.getLiveRunData();
  }
  const res = await fetch(`${apiBase}/api/v1/live-run`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Live run API error: ${res.status}`);
  }
  return (await res.json()) as LiveRunData;
}
