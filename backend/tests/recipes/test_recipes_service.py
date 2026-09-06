"""DB-backed unit tests for RecipeService."""
from sqlalchemy.orm import Session

from noetarch.modules.recipes.repository import RecipeRepository
from noetarch.modules.recipes.seed import SEED_RECIPES
from noetarch.modules.recipes.service import RecipeService


def _make_service(session: Session) -> RecipeService:
    return RecipeService(RecipeRepository(session))


def test_list_recipes_count_matches_seed(db_session: Session) -> None:
    assert len(_make_service(db_session).list_recipes()) == len(SEED_RECIPES)


def test_get_recipe_known(db_session: Session) -> None:
    r = _make_service(db_session).get_recipe("rec-002")
    assert r is not None
    assert r.execution == "cloud"
    assert "Anthropic API key" in r.inputs


def test_get_recipe_unknown_returns_none(db_session: Session) -> None:
    assert _make_service(db_session).get_recipe("nope") is None
