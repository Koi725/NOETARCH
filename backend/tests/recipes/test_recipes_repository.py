"""DB-backed unit tests for RecipeRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.recipes.repository import RecipeRepository
from noetarch.modules.recipes.seed import SEED_RECIPES


def test_list_all_returns_all_seed(db_session: Session) -> None:
    assert len(RecipeRepository(db_session).list_all()) == len(SEED_RECIPES)


def test_list_all_preserves_order(db_session: Session) -> None:
    ids = [r.id for r in RecipeRepository(db_session).list_all()]
    assert ids == [r.id for r in SEED_RECIPES]


def test_get_by_id_known(db_session: Session) -> None:
    r = RecipeRepository(db_session).get_by_id("rec-001")
    assert r is not None
    assert r.execution == "local"
    assert len(r.steps) > 0


def test_get_by_id_unknown_returns_none(db_session: Session) -> None:
    assert RecipeRepository(db_session).get_by_id("rec-999") is None


def test_all_recipes_have_valid_execution(db_session: Session) -> None:
    for r in RecipeRepository(db_session).list_all():
        assert r.execution in ("local", "cloud")
        assert isinstance(r.providers, list)
        assert r.privacyPolicy
