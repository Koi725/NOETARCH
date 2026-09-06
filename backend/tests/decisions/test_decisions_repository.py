"""Unit tests for DecisionRepository (in-process seed, no I/O)."""
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.seed import SEED_DECISIONS


def test_list_all_returns_all_seed() -> None:
    repo = DecisionRepository()
    assert len(repo.list_all()) == len(SEED_DECISIONS)


def test_list_all_returns_copy() -> None:
    repo = DecisionRepository()
    assert repo.list_all() is not repo.list_all()


def test_get_by_id_known() -> None:
    repo = DecisionRepository()
    d = repo.get_by_id("dec-001")
    assert d is not None
    assert d.risk == "high"
    assert d.type == "cloud-egress"


def test_get_by_id_unknown_returns_none() -> None:
    repo = DecisionRepository()
    assert repo.get_by_id("dec-999") is None


def test_all_decisions_have_valid_enums() -> None:
    repo = DecisionRepository()
    for d in repo.list_all():
        assert d.risk in ("high", "medium", "low")
        assert d.type in ("cloud-egress", "local-file", "workflow-change")
        assert d.status in ("pending", "approved", "rejected", "alternative")
        assert isinstance(d.alternatives, list)
