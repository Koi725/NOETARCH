export type RunStatus = "running" | "complete" | "interrupted" | "failed" | "partial";

export interface Run {
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

export type FilterTab = "all" | "complete" | "running" | "interrupted" | "failed";

export interface RunHistoryProps {
  runs?: Run[];
}

export interface ComparisonPanelProps {
  runA: Run;
  runB: Run;
}
