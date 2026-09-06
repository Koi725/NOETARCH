"""Unit tests for GuidedReviewRepository (in-process seed, no I/O)."""
from noetarch.modules.guided_review.repository import GuidedReviewRepository
from noetarch.modules.guided_review.schemas import GuidedReviewData


def test_get_current_returns_data() -> None:
    repo = GuidedReviewRepository()
    assert isinstance(repo.get_current(), GuidedReviewData)


def test_progress_is_consistent() -> None:
    repo = GuidedReviewRepository()
    p = repo.get_current().progress
    assert p.reviewed + p.remaining == p.total


def test_current_paper_populated() -> None:
    repo = GuidedReviewRepository()
    paper = repo.get_current().currentPaper
    assert paper.id
    assert paper.abstract
    assert paper.index > 0


def test_exclude_reasons_nonempty() -> None:
    repo = GuidedReviewRepository()
    assert len(repo.get_current().excludeReasons) > 0


def test_previous_decisions_have_valid_decision() -> None:
    repo = GuidedReviewRepository()
    for entry in repo.get_current().previousDecisions:
        assert entry.decision in ("include", "exclude", "uncertain", "needs-human-review")
