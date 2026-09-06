"""DB-backed unit tests for LiveRunService."""
from sqlalchemy.orm import Session

from noetarch.modules.live_run.repository import LiveRunRepository
from noetarch.modules.live_run.schemas import LiveRunData
from noetarch.modules.live_run.service import LiveRunService


def _make_service(session: Session) -> LiveRunService:
    return LiveRunService(LiveRunRepository(session))


def test_get_active_run_returns_live_run_data(db_session: Session) -> None:
    assert isinstance(_make_service(db_session).get_active_run(), LiveRunData)


def test_get_active_run_has_meta_and_kpis(db_session: Session) -> None:
    data = _make_service(db_session).get_active_run()
    assert data.meta.runId
    assert len(data.kpis) > 0


def test_get_active_run_has_pending_decision(db_session: Session) -> None:
    data = _make_service(db_session).get_active_run()
    assert len(data.decisions) > 0
    assert data.decisions[0].kind == "pending"
