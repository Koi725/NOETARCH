"""In-process GuidedReview repository. No database, no network, no file I/O."""
from noetarch.modules.guided_review.schemas import GuidedReviewData
from noetarch.modules.guided_review.seed import SEED_GUIDED_REVIEW


class GuidedReviewRepository:
    def get_current(self) -> GuidedReviewData:
        return SEED_GUIDED_REVIEW
