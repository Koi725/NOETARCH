import type { ReviewPaper, ExcludeReason, ReviewHistoryEntry, ReviewProgress } from "@/contracts/guided-review";

export interface GuidedReviewData {
  project: string;
  progress: ReviewProgress;
  currentPaper: ReviewPaper;
  nextPapers: ReviewPaper[];
  excludeReasons: ExcludeReason[];
  previousDecisions: ReviewHistoryEntry[];
}

export interface GuidedReviewService {
  getReviewData(): GuidedReviewData;
}

import {
  guidedReviewProject,
  reviewProgress,
  currentPaper,
  nextPapers,
  excludeReasons,
  previousDecisions,
} from "@/data/GuidedReview/GuidedReview-data";

export const mockGuidedReviewService: GuidedReviewService = {
  getReviewData: () => ({
    project: guidedReviewProject,
    progress: reviewProgress,
    currentPaper: currentPaper as ReviewPaper,
    nextPapers: nextPapers as ReviewPaper[],
    excludeReasons: excludeReasons as ExcludeReason[],
    previousDecisions: previousDecisions as ReviewHistoryEntry[],
  }),
};

// ─── M6 async client ────────────────────────────────────────────────────────

/**
 * Fetches guided-review state from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data when the env var is absent, so the app runs standalone.
 */
export async function fetchReviewData(): Promise<GuidedReviewData> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockGuidedReviewService.getReviewData();
  }
  const res = await fetch(`${apiBase}/api/v1/guided-review`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Guided review API error: ${res.status}`);
  }
  return (await res.json()) as GuidedReviewData;
}
