"""Unit tests for DecisionService."""
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.seed import SEED_DECISIONS
from noetarch.modules.decisions.service import DecisionService


def _make_service() -> DecisionService:
    return DecisionService(DecisionRepository())


def test_list_decisions_count_matches_seed() -> None:
    assert len(_make_service().list_decisions()) == len(SEED_DECISIONS)


def test_get_decision_known() -> None:
    d = _make_service().get_decision("dec-003")
    assert d is not None
    assert d.status == "rejected"
    assert d.rejectedAt == "14:08"


def test_get_decision_unknown_returns_none() -> None:
    assert _make_service().get_decision("nope") is None
