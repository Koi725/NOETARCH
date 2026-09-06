"""Unit tests for LiveRunService."""
from noetarch.modules.live_run.repository import LiveRunRepository
from noetarch.modules.live_run.schemas import LiveRunData
from noetarch.modules.live_run.service import LiveRunService


def _make_service() -> LiveRunService:
    return LiveRunService(LiveRunRepository())


def test_get_active_run_returns_live_run_data() -> None:
    assert isinstance(_make_service().get_active_run(), LiveRunData)


def test_get_active_run_has_meta_and_kpis() -> None:
    data = _make_service().get_active_run()
    assert data.meta.runId
    assert len(data.kpis) > 0


def test_get_active_run_has_pending_decision() -> None:
    data = _make_service().get_active_run()
    assert len(data.decisions) > 0
    assert data.decisions[0].kind == "pending"
