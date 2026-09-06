"""Unit tests for ModelsPolicyRepository (in-process seed, no I/O)."""
from noetarch.modules.models_policy.repository import ModelsPolicyRepository
from noetarch.modules.models_policy.seed import SEED_PROVIDERS


def test_list_all_returns_all_seed() -> None:
    repo = ModelsPolicyRepository()
    assert len(repo.list_all()) == len(SEED_PROVIDERS)


def test_list_all_returns_copy() -> None:
    repo = ModelsPolicyRepository()
    assert repo.list_all() is not repo.list_all()


def test_get_by_id_known() -> None:
    repo = ModelsPolicyRepository()
    p = repo.get_by_id("anthropic")
    assert p is not None
    assert p.type == "cloud"
    assert p.egressPolicy == "explicit-approval"


def test_get_by_id_unknown_returns_none() -> None:
    repo = ModelsPolicyRepository()
    assert repo.get_by_id("gemini") is None


def test_local_providers_have_none_egress_and_no_cost() -> None:
    repo = ModelsPolicyRepository()
    for p in repo.list_all():
        if p.type == "local":
            assert p.egressPolicy == "none"
            assert p.dailyCostLimit is None


def test_no_secret_fields_present() -> None:
    # The schema must not carry credentials/keys.
    repo = ModelsPolicyRepository()
    for p in repo.list_all():
        dumped = p.model_dump()
        for key in dumped:
            assert "key" not in key.lower()
            assert "secret" not in key.lower()
            assert "token" not in key.lower()
