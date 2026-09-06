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
