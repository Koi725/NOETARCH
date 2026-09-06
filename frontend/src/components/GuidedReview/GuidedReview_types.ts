export type Decision = "include" | "exclude" | "uncertain" | "needs-human-review" | null;

export type ReviewPaper = {
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
};

export type ExcludeReason = {
  id: string;
  label: string;
};

export type HistoryEntry = {
  id: string;
  paperTitle: string;
  decision: Exclude<Decision, null>;
  reasons: string[];
};

export type GuidedReviewProps = Record<string, never>;
