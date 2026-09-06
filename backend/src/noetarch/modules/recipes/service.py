"""Recipes service — orchestration between router and repository."""
from noetarch.modules.recipes.repository import RecipeRepository
from noetarch.modules.recipes.schemas import Recipe


class RecipeService:
    def __init__(self, repo: RecipeRepository) -> None:
        self._repo = repo

    def list_recipes(self) -> list[Recipe]:
        return self._repo.list_all()

    def get_recipe(self, recipe_id: str) -> Recipe | None:
        return self._repo.get_by_id(recipe_id)
