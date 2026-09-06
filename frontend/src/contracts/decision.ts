export type DecisionRisk = "high" | "medium" | "low";
export type DecisionType = "cloud-egress" | "local-file" | "workflow-change";
export type DecisionStatus = "pending" | "approved" | "rejected" | "alternative";

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
  rejectedAt?: string;
}
