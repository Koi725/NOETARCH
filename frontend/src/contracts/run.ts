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
