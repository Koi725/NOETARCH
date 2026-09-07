// Canonical types for LiveRun surface + HistoryRun surface

export type StepState = "done" | "partial" | "running" | "waiting" | "queued" | "blocked";
export type EventKind = "system" | "model";
export type LiveRunDecisionKind = "pending" | "approved" | "skipped";
export type RunStatus = "running" | "complete" | "interrupted" | "failed" | "partial";

export interface RunMeta {
  runId: string;
  title: string;
  started: string;
  elapsed: string;
}

export interface WorkflowStep {
  index: number;
  label: string;
  state: StepState;
  note?: string;
}

export interface RunKPI {
  label: string;
  value: string;
  tone?: "warn" | "ok" | "bad";
}

export interface RunEvent {
  id: string;
  time: string;
  message: string;
  kind: EventKind;
}

export interface LiveRunDecision {
  id: string;
  description: string;
  kind: LiveRunDecisionKind;
}

export interface LiveRunEvidenceCard {
  id: string;
  title: string;
  doi: string;
  source: string;
  verifiedBy: string;
}

export interface StepInspector {
  stepIndex: number;
  label: string;
  method: string;
  locality: string;
  status: string;
  input: string;
  outputSoFar: string;
}

// ── Linear run executor (POST /runs, GET /runs/{id}) ─────────────────────────
// Terminal states from the backend. `halted_budget` means the run stopped cleanly at the
// cost cap; `no_provider` / `external_sources_disabled` are the deny-by-default gates.
export type RunExecutionStatus =
  | "completed"
  | "halted_budget"
  | "failed"
  | "no_provider"
  | "external_sources_disabled";

export interface RunRequestInput {
  question: string;
  year_from?: number | null;
  year_to?: number | null;
  max_results?: number;
  budget_usd?: number | null;
}

export interface RunResult {
  id: string;
  status: RunExecutionStatus;
  question: string;
  provider: string;
  model: string;
  frozen: number;
  deduplicated: number;
  screened: number;
  included: number;
  excluded: number;
  uncertain: number;
  offSchema: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  createdAt: string;
  finishedAt?: string | null;
  error?: string | null;
}

export interface HistoryRun {
  id: string;
  status: RunStatus;
  title: string;
  recipe: string;
  started: string;
  stoppedAt?: string;
  duration: string;
  cost: string;
  papers: number;
  providers: string[];
  notes?: string;
  stopReason?: string;
  failureReason?: string;
}
