"""In-process Recipes repository. No database, no network, no file I/O."""
from noetarch.modules.recipes.schemas import Recipe
from noetarch.modules.recipes.seed import SEED_RECIPES


class RecipeRepository:
    def list_all(self) -> list[Recipe]:
        return list(SEED_RECIPES)

    def get_by_id(self, recipe_id: str) -> Recipe | None:
        return next((r for r in SEED_RECIPES if r.id == recipe_id), None)
