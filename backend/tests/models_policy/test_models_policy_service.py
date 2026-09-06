"""DB-backed unit tests for ModelsPolicyService."""
from sqlalchemy.orm import Session

from noetarch.modules.models_policy.repository import ModelsPolicyRepository
from noetarch.modules.models_policy.seed import SEED_PROVIDERS
from noetarch.modules.models_policy.service import ModelsPolicyService


def _make_service(session: Session) -> ModelsPolicyService:
    return ModelsPolicyService(ModelsPolicyRepository(session))


def test_list_providers_count_matches_seed(db_session: Session) -> None:
    assert len(_make_service(db_session).list_providers()) == len(SEED_PROVIDERS)


def test_get_provider_known(db_session: Session) -> None:
    p = _make_service(db_session).get_provider("ollama")
    assert p is not None
    assert p.status == "down"
    assert p.statusNote is not None


def test_get_provider_unknown_returns_none(db_session: Session) -> None:
    assert _make_service(db_session).get_provider("nope") is None
