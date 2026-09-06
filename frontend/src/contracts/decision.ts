export type DecisionRisk = "high" | "medium" | "low";
export type DecisionType = "cloud-egress" | "local-file" | "workflow-change";
export type DecisionStatus = "pending" | "approved" | "rejected" | "local_alternative";

// The action a client may request on a pending decision (M8 write path).
export type DecisionActionType = "approve" | "reject" | "use_local_alternative";

export interface Decision {
  id: string;
  title: string;
  type: DecisionType;
  risk: DecisionRisk;
  payload?: string;
  cost: string;
  time: string;
  reversible: boolean;
  detail: string;
  alternatives: string[];
  status: DecisionStatus;
  rejectedAt?: string | null;
  version: number;
  resolvedAt?: string | null;
  resolutionAction?: DecisionActionType | null;
}

// A single append-only audit-log entry (read-only provenance).
export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  requestId?: string | null;
  createdAt: string;
  payloadHash?: string | null;
}
