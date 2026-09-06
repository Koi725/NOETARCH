"""DB-backed unit tests for HistoryService."""
from sqlalchemy.orm import Session

from noetarch.modules.history.repository import HistoryRepository
from noetarch.modules.history.seed import SEED_RUNS
from noetarch.modules.history.service import HistoryService


def _make_service(session: Session) -> HistoryService:
    return HistoryService(HistoryRepository(session))


def test_list_runs_count_matches_seed(db_session: Session) -> None:
    assert len(_make_service(db_session).list_runs()) == len(SEED_RUNS)


def test_list_runs_includes_running_run(db_session: Session) -> None:
    runs = _make_service(db_session).list_runs()
    assert any(r.status == "running" for r in runs)


def test_partial_run_has_notes(db_session: Session) -> None:
    runs = _make_service(db_session).list_runs()
    partial = next(r for r in runs if r.status == "partial")
    assert partial.notes is not None
