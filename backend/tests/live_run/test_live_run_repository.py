"""DB-backed unit tests for LiveRunRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.live_run.repository import LiveRunRepository
from noetarch.modules.live_run.schemas import LiveRunData


def test_get_active_returns_live_run_data(db_session: Session) -> None:
    assert isinstance(LiveRunRepository(db_session).get_active(), LiveRunData)


def test_steps_are_ordered_and_nonempty(db_session: Session) -> None:
    steps = LiveRunRepository(db_session).get_active().steps
    assert len(steps) > 0
    indices = [s.index for s in steps]
    assert indices == sorted(indices)


def test_step_states_are_valid(db_session: Session) -> None:
    valid = {"done", "partial", "running", "waiting", "queued", "blocked"}
    for step in LiveRunRepository(db_session).get_active().steps:
        assert step.state in valid


def test_events_have_valid_kind(db_session: Session) -> None:
    for evt in LiveRunRepository(db_session).get_active().events:
        assert evt.kind in ("system", "model")


def test_step_inspector_matches_a_step_index(db_session: Session) -> None:
    data = LiveRunRepository(db_session).get_active()
    step_indices = {s.index for s in data.steps}
    assert data.stepInspector.stepIndex in step_indices
