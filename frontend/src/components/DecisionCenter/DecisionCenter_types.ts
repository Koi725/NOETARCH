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

export interface DecisionCardProps {
  decision: Decision;
  sessionStatus: DecisionStatus | null;
  chosenAlternativeIndex: number | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAlternative: (id: string, index: number) => void;
  onChangeMind: (id: string) => void;
}

export interface DecisionCenterProps {
  decisions?: Decision[];
}
