"""DB-backed unit tests for HistoryRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.history.repository import HistoryRepository
from noetarch.modules.history.seed import SEED_RUNS


def test_list_all_returns_all_seed(db_session: Session) -> None:
    assert len(HistoryRepository(db_session).list_all()) == len(SEED_RUNS)


def test_list_all_preserves_order(db_session: Session) -> None:
    ids = [r.id for r in HistoryRepository(db_session).list_all()]
    assert ids == [r.id for r in SEED_RUNS]


def test_all_runs_have_valid_status(db_session: Session) -> None:
    valid = {"running", "complete", "interrupted", "failed", "partial"}
    for run in HistoryRepository(db_session).list_all():
        assert run.status in valid
        assert isinstance(run.providers, list)
        assert run.papers >= 0


def test_interrupted_run_has_stop_reason(db_session: Session) -> None:
    runs = HistoryRepository(db_session).list_all()
    interrupted = next(r for r in runs if r.status == "interrupted")
    assert interrupted.stopReason is not None
    assert interrupted.stoppedAt is not None


def test_failed_run_has_failure_reason(db_session: Session) -> None:
    failed = next(r for r in HistoryRepository(db_session).list_all() if r.status == "failed")
    assert failed.failureReason is not None
