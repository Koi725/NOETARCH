"""Unit tests for GuidedReviewService."""
from noetarch.modules.guided_review.repository import GuidedReviewRepository
from noetarch.modules.guided_review.schemas import GuidedReviewData
from noetarch.modules.guided_review.service import GuidedReviewService


def _make_service() -> GuidedReviewService:
    return GuidedReviewService(GuidedReviewRepository())


def test_get_review_returns_data() -> None:
    assert isinstance(_make_service().get_review(), GuidedReviewData)


def test_get_review_has_project_and_next_papers() -> None:
    data = _make_service().get_review()
    assert data.project
    assert len(data.nextPapers) > 0


def test_current_paper_flagged_for_human_review() -> None:
    data = _make_service().get_review()
    assert data.currentPaper.initialStatus == "needs-human-review"
    assert data.currentPaper.initialStatusNote is not None
