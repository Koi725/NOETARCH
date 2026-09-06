"""DB-backed unit tests for DecisionService."""
from sqlalchemy.orm import Session

from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.seed import SEED_DECISIONS
from noetarch.modules.decisions.service import DecisionService


def _make_service(session: Session) -> DecisionService:
    return DecisionService(DecisionRepository(session))


def test_list_decisions_count_matches_seed(db_session: Session) -> None:
    assert len(_make_service(db_session).list_decisions()) == len(SEED_DECISIONS)


def test_get_decision_known(db_session: Session) -> None:
    d = _make_service(db_session).get_decision("dec-003")
    assert d is not None
    assert d.status == "rejected"
    assert d.rejectedAt == "14:08"


def test_get_decision_unknown_returns_none(db_session: Session) -> None:
    assert _make_service(db_session).get_decision("nope") is None
