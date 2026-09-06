"""Unit tests for RecipeRepository (in-process seed, no I/O)."""
from noetarch.modules.recipes.repository import RecipeRepository
from noetarch.modules.recipes.seed import SEED_RECIPES


def test_list_all_returns_all_seed() -> None:
    repo = RecipeRepository()
    assert len(repo.list_all()) == len(SEED_RECIPES)


def test_list_all_returns_copy() -> None:
    repo = RecipeRepository()
    assert repo.list_all() is not repo.list_all()


def test_get_by_id_known() -> None:
    repo = RecipeRepository()
    r = repo.get_by_id("rec-001")
    assert r is not None
    assert r.execution == "local"
    assert len(r.steps) > 0


def test_get_by_id_unknown_returns_none() -> None:
    repo = RecipeRepository()
    assert repo.get_by_id("rec-999") is None


def test_all_recipes_have_valid_execution() -> None:
    repo = RecipeRepository()
    for r in repo.list_all():
        assert r.execution in ("local", "cloud")
        assert isinstance(r.providers, list)
        assert r.privacyPolicy
