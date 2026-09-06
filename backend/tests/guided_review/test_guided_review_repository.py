"""DB-backed unit tests for GuidedReviewRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.guided_review.repository import GuidedReviewRepository
from noetarch.modules.guided_review.schemas import GuidedReviewData


def test_get_current_returns_data(db_session: Session) -> None:
    assert isinstance(GuidedReviewRepository(db_session).get_current(), GuidedReviewData)


def test_progress_is_consistent(db_session: Session) -> None:
    p = GuidedReviewRepository(db_session).get_current().progress
    assert p.reviewed + p.remaining == p.total


def test_current_paper_populated(db_session: Session) -> None:
    paper = GuidedReviewRepository(db_session).get_current().currentPaper
    assert paper.id
    assert paper.abstract
    assert paper.index > 0


def test_exclude_reasons_nonempty(db_session: Session) -> None:
    assert len(GuidedReviewRepository(db_session).get_current().excludeReasons) > 0


def test_previous_decisions_have_valid_decision(db_session: Session) -> None:
    for entry in GuidedReviewRepository(db_session).get_current().previousDecisions:
        assert entry.decision in ("include", "exclude", "uncertain", "needs-human-review")
