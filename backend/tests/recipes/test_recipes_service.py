"""Unit tests for RecipeService."""
from noetarch.modules.recipes.repository import RecipeRepository
from noetarch.modules.recipes.seed import SEED_RECIPES
from noetarch.modules.recipes.service import RecipeService


def _make_service() -> RecipeService:
    return RecipeService(RecipeRepository())


def test_list_recipes_count_matches_seed() -> None:
    assert len(_make_service().list_recipes()) == len(SEED_RECIPES)


def test_get_recipe_known() -> None:
    r = _make_service().get_recipe("rec-002")
    assert r is not None
    assert r.execution == "cloud"
    assert "Anthropic API key" in r.inputs


def test_get_recipe_unknown_returns_none() -> None:
    assert _make_service().get_recipe("nope") is None
