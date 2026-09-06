"""GuidedReview service — orchestration between router and repository."""
from noetarch.modules.guided_review.repository import GuidedReviewRepository
from noetarch.modules.guided_review.schemas import GuidedReviewData


class GuidedReviewService:
    def __init__(self, repo: GuidedReviewRepository) -> None:
        self._repo = repo

    def get_review(self) -> GuidedReviewData:
        return self._repo.get_current()
