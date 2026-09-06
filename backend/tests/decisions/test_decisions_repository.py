"""DB-backed unit tests for DecisionRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.seed import SEED_DECISIONS


def test_list_all_returns_all_seed(db_session: Session) -> None:
    assert len(DecisionRepository(db_session).list_all()) == len(SEED_DECISIONS)


def test_list_all_preserves_order(db_session: Session) -> None:
    ids = [d.id for d in DecisionRepository(db_session).list_all()]
    assert ids == [d.id for d in SEED_DECISIONS]


def test_get_by_id_known(db_session: Session) -> None:
    d = DecisionRepository(db_session).get_by_id("dec-001")
    assert d is not None
    assert d.risk == "high"
    assert d.type == "cloud-egress"


def test_get_by_id_unknown_returns_none(db_session: Session) -> None:
    assert DecisionRepository(db_session).get_by_id("dec-999") is None


def test_all_decisions_have_valid_enums(db_session: Session) -> None:
    for d in DecisionRepository(db_session).list_all():
        assert d.risk in ("high", "medium", "low")
        assert d.type in ("cloud-egress", "local-file", "workflow-change")
        assert d.status in ("pending", "approved", "rejected", "alternative")
        assert isinstance(d.alternatives, list)
