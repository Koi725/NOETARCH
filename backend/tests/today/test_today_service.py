"""Unit tests for TodayService."""
from noetarch.modules.today.repository import TodayRepository
from noetarch.modules.today.schemas import TodayData
from noetarch.modules.today.service import TodayService


def _make_service() -> TodayService:
    return TodayService(TodayRepository())


def test_get_today_returns_today_data() -> None:
    service = _make_service()
    assert isinstance(service.get_today(), TodayData)


def test_get_today_waiting_populated() -> None:
    service = _make_service()
    data = service.get_today()
    assert data.waiting.title
    assert data.waiting.detail
    assert data.waiting.next


def test_get_today_has_sources_and_finished() -> None:
    service = _make_service()
    data = service.get_today()
    assert len(data.sources) > 0
    assert len(data.finished) > 0
