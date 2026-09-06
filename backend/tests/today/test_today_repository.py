"""Unit tests for TodayRepository (in-process seed, no I/O)."""
from noetarch.modules.today.repository import TodayRepository
from noetarch.modules.today.schemas import TodayData


def test_get_returns_today_data() -> None:
    repo = TodayRepository()
    data = repo.get()
    assert isinstance(data, TodayData)


def test_get_has_project_and_question() -> None:
    repo = TodayRepository()
    data = repo.get()
    assert data.project
    assert data.question


def test_run_progress_in_range() -> None:
    repo = TodayRepository()
    data = repo.get()
    assert 0 <= data.run.progress <= 100


def test_kpis_are_triples() -> None:
    repo = TodayRepository()
    data = repo.get()
    assert len(data.run.kpis) > 0
    for kpi in data.run.kpis:
        assert len(kpi) == 3


def test_files_have_pending_bool() -> None:
    repo = TodayRepository()
    data = repo.get()
    assert len(data.files) > 0
    for name, meta, pending in data.files:
        assert isinstance(name, str)
        assert isinstance(meta, str)
        assert isinstance(pending, bool)
