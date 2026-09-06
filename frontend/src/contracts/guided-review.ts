export type ReviewDecision = "include" | "exclude" | "uncertain" | "needs-human-review" | null;

export interface ReviewPaper {
  id: string;
  index: number;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  abstract: string;
  initialStatus: "needs-human-review" | null;
  initialStatusNote: string | null;
}

export interface ExcludeReason {
  id: string;
  label: string;
}

export interface ReviewHistoryEntry {
  id: string;
  paperTitle: string;
  decision: Exclude<ReviewDecision, null>;
  reasons: string[];
}

export interface ReviewProgress {
  reviewed: number;
  total: number;
  remaining: number;
}
