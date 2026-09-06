"""Unit tests for HistoryService."""
from noetarch.modules.history.repository import HistoryRepository
from noetarch.modules.history.seed import SEED_RUNS
from noetarch.modules.history.service import HistoryService


def _make_service() -> HistoryService:
    return HistoryService(HistoryRepository())


def test_list_runs_count_matches_seed() -> None:
    assert len(_make_service().list_runs()) == len(SEED_RUNS)


def test_list_runs_includes_running_run() -> None:
    runs = _make_service().list_runs()
    assert any(r.status == "running" for r in runs)


def test_partial_run_has_notes() -> None:
    runs = _make_service().list_runs()
    partial = next(r for r in runs if r.status == "partial")
    assert partial.notes is not None
