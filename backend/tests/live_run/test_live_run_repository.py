"""Unit tests for LiveRunRepository (in-process seed, no I/O)."""
from noetarch.modules.live_run.repository import LiveRunRepository
from noetarch.modules.live_run.schemas import LiveRunData


def test_get_active_returns_live_run_data() -> None:
    repo = LiveRunRepository()
    assert isinstance(repo.get_active(), LiveRunData)


def test_steps_are_ordered_and_nonempty() -> None:
    repo = LiveRunRepository()
    steps = repo.get_active().steps
    assert len(steps) > 0
    indices = [s.index for s in steps]
    assert indices == sorted(indices)


def test_step_states_are_valid() -> None:
    repo = LiveRunRepository()
    valid = {"done", "partial", "running", "waiting", "queued", "blocked"}
    for step in repo.get_active().steps:
        assert step.state in valid


def test_events_have_valid_kind() -> None:
    repo = LiveRunRepository()
    for evt in repo.get_active().events:
        assert evt.kind in ("system", "model")


def test_step_inspector_matches_a_step_index() -> None:
    repo = LiveRunRepository()
    data = repo.get_active()
    step_indices = {s.index for s in data.steps}
    assert data.stepInspector.stepIndex in step_indices
