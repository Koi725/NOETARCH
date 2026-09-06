"""DB-backed unit tests for ModelsPolicyRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.models_policy.repository import ModelsPolicyRepository
from noetarch.modules.models_policy.seed import SEED_PROVIDERS


def test_list_all_returns_all_seed(db_session: Session) -> None:
    assert len(ModelsPolicyRepository(db_session).list_all()) == len(SEED_PROVIDERS)


def test_list_all_preserves_order(db_session: Session) -> None:
    ids = [p.id for p in ModelsPolicyRepository(db_session).list_all()]
    assert ids == [p.id for p in SEED_PROVIDERS]


def test_get_by_id_known(db_session: Session) -> None:
    p = ModelsPolicyRepository(db_session).get_by_id("anthropic")
    assert p is not None
    assert p.type == "cloud"
    assert p.egressPolicy == "explicit-approval"


def test_get_by_id_unknown_returns_none(db_session: Session) -> None:
    assert ModelsPolicyRepository(db_session).get_by_id("gemini") is None


def test_local_providers_have_none_egress_and_no_cost(db_session: Session) -> None:
    for p in ModelsPolicyRepository(db_session).list_all():
        if p.type == "local":
            assert p.egressPolicy == "none"
            assert p.dailyCostLimit is None


def test_no_secret_fields_present(db_session: Session) -> None:
    for p in ModelsPolicyRepository(db_session).list_all():
        for key in p.model_dump():
            assert "key" not in key.lower()
            assert "secret" not in key.lower()
            assert "token" not in key.lower()
