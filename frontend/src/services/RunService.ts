import type {
  RunMeta,
  WorkflowStep,
  StepInspector,
  RunKPI,
  RunEvent,
  LiveRunDecision,
  LiveRunEvidenceCard,
  RunRequestInput,
  RunResult,
} from "@/contracts/run";

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

// ─── Run launcher client (POST /runs, GET /runs/{id}) ─────────────────────────

/** A real run is gated (no key / external sources off). Carries the backend's message. */
export class RunUnavailableError extends Error {}

function runsApiBaseOrThrow(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    throw new Error("No backend configured — runs require a running backend.");
  }
  return apiBase;
}

async function detailMessage(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { error?: { message?: string }; detail?: string };
    return data?.error?.message ?? data?.detail ?? null;
  } catch {
    return null;
  }
}

/**
 * Start a linear run. The backend runs it synchronously and returns the final result, so the
 * in-flight request IS the "running" phase for the UI. A 409 means a deny-by-default gate
 * (no enabled key, or external sources disabled) and raises a RunUnavailableError with the
 * backend's exact message so the UI can point the user to Models & Policy.
 */
export async function startRun(input: RunRequestInput): Promise<RunResult> {
  const apiBase = runsApiBaseOrThrow();
  const res = await fetch(`${apiBase}/api/v1/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 409) {
    const message = (await detailMessage(res)) ?? "Real runs are currently unavailable.";
    throw new RunUnavailableError(message);
  }
  if (!res.ok) {
    const message = (await detailMessage(res)) ?? `Run failed (HTTP ${res.status}).`;
    throw new Error(message);
  }
  return (await res.json()) as RunResult;
}

/** Fetch a run's current state (used to poll/refresh a run's status by id). */
export async function getRun(runId: string): Promise<RunResult> {
  const apiBase = runsApiBaseOrThrow();
  const res = await fetch(`${apiBase}/api/v1/runs/${encodeURIComponent(runId)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Run lookup failed (HTTP ${res.status}).`);
  }
  return (await res.json()) as RunResult;
}
