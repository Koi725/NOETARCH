"""Unit tests for ModelsPolicyService."""
from noetarch.modules.models_policy.repository import ModelsPolicyRepository
from noetarch.modules.models_policy.seed import SEED_PROVIDERS
from noetarch.modules.models_policy.service import ModelsPolicyService


def _make_service() -> ModelsPolicyService:
    return ModelsPolicyService(ModelsPolicyRepository())


def test_list_providers_count_matches_seed() -> None:
    assert len(_make_service().list_providers()) == len(SEED_PROVIDERS)


def test_get_provider_known() -> None:
    p = _make_service().get_provider("ollama")
    assert p is not None
    assert p.status == "down"
    assert p.statusNote is not None


def test_get_provider_unknown_returns_none() -> None:
    assert _make_service().get_provider("nope") is None
