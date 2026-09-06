"""DB-backed unit tests for TodayRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.today.repository import TodayRepository
from noetarch.modules.today.schemas import TodayData


def test_get_returns_today_data(db_session: Session) -> None:
    assert isinstance(TodayRepository(db_session).get(), TodayData)


def test_get_has_project_and_question(db_session: Session) -> None:
    data = TodayRepository(db_session).get()
    assert data.project
    assert data.question


def test_run_progress_in_range(db_session: Session) -> None:
    data = TodayRepository(db_session).get()
    assert 0 <= data.run.progress <= 100


def test_kpis_are_triples(db_session: Session) -> None:
    data = TodayRepository(db_session).get()
    assert len(data.run.kpis) > 0
    for kpi in data.run.kpis:
        assert len(kpi) == 3


def test_files_have_pending_bool(db_session: Session) -> None:
    data = TodayRepository(db_session).get()
    assert len(data.files) > 0
    for name, meta, pending in data.files:
        assert isinstance(name, str)
        assert isinstance(meta, str)
        assert isinstance(pending, bool)
