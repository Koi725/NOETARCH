"""DB-backed unit tests for GuidedReviewService."""
from sqlalchemy.orm import Session

from noetarch.modules.guided_review.repository import GuidedReviewRepository
from noetarch.modules.guided_review.schemas import GuidedReviewData
from noetarch.modules.guided_review.service import GuidedReviewService


def _make_service(session: Session) -> GuidedReviewService:
    return GuidedReviewService(GuidedReviewRepository(session))


def test_get_review_returns_data(db_session: Session) -> None:
    assert isinstance(_make_service(db_session).get_review(), GuidedReviewData)


def test_get_review_has_project_and_next_papers(db_session: Session) -> None:
    data = _make_service(db_session).get_review()
    assert data.project
    assert len(data.nextPapers) > 0


def test_current_paper_flagged_for_human_review(db_session: Session) -> None:
    data = _make_service(db_session).get_review()
    assert data.currentPaper.initialStatus == "needs-human-review"
    assert data.currentPaper.initialStatusNote is not None
