export type StepState =
  | "done"
  | "partial"
  | "running"
  | "waiting"
  | "queued"
  | "blocked";

export type EventKind = "system" | "model";

export type DecisionKind = "pending" | "approved" | "skipped";

export type RunStep = {
  index: number;
  label: string;
  state: StepState;
  note?: string;
};

export type RunKPI = {
  label: string;
  value: string;
  tone?: "warn" | "ok" | "bad";
};

export type RunEvent = {
  id: string;
  time: string;
  message: string;
  kind: EventKind;
};

export type RunDecision = {
  id: string;
  description: string;
  kind: DecisionKind;
};

export type EvidenceCard = {
  id: string;
  title: string;
  doi: string;
  source: string;
  verifiedBy: string;
};

export type CurrentStepInspector = {
  stepIndex: number;
  label: string;
  method: string;
  locality: string;
  status: string;
  input: string;
  outputSoFar: string;
};

export type LiveRunLayout = "split" | "wide-left" | "wide-right";

export type LiveRunProps = Record<string, never>;
