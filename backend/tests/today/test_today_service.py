"""DB-backed unit tests for TodayService."""
from sqlalchemy.orm import Session

from noetarch.modules.today.repository import TodayRepository
from noetarch.modules.today.schemas import TodayData
from noetarch.modules.today.service import TodayService


def _make_service(session: Session) -> TodayService:
    return TodayService(TodayRepository(session))


def test_get_today_returns_today_data(db_session: Session) -> None:
    assert isinstance(_make_service(db_session).get_today(), TodayData)


def test_get_today_waiting_populated(db_session: Session) -> None:
    data = _make_service(db_session).get_today()
    assert data.waiting.title
    assert data.waiting.detail
    assert data.waiting.next


def test_get_today_has_sources_and_finished(db_session: Session) -> None:
    data = _make_service(db_session).get_today()
    assert len(data.sources) > 0
    assert len(data.finished) > 0
