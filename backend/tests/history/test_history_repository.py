"""Unit tests for HistoryRepository (in-process seed, no I/O)."""
from noetarch.modules.history.repository import HistoryRepository
from noetarch.modules.history.seed import SEED_RUNS


def test_list_all_returns_all_seed() -> None:
    repo = HistoryRepository()
    assert len(repo.list_all()) == len(SEED_RUNS)


def test_list_all_returns_copy() -> None:
    repo = HistoryRepository()
    assert repo.list_all() is not repo.list_all()


def test_all_runs_have_valid_status() -> None:
    repo = HistoryRepository()
    valid = {"running", "complete", "interrupted", "failed", "partial"}
    for run in repo.list_all():
        assert run.status in valid
        assert isinstance(run.providers, list)
        assert run.papers >= 0


def test_interrupted_run_has_stop_reason() -> None:
    repo = HistoryRepository()
    interrupted = next(r for r in repo.list_all() if r.status == "interrupted")
    assert interrupted.stopReason is not None
    assert interrupted.stoppedAt is not None


def test_failed_run_has_failure_reason() -> None:
    repo = HistoryRepository()
    failed = next(r for r in repo.list_all() if r.status == "failed")
    assert failed.failureReason is not None
