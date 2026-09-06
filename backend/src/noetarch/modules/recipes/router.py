"""Recipes router — GET /api/v1/recipes (list) and /{recipe_id} (detail).

Security controls:
  - recipe_id validated by regex: ^[a-z0-9][a-z0-9_-]{0,62}$. Rejects uppercase,
    path separators, dots, null bytes, and over-length values.
  - 404 on unknown id; structured error via the app-level exception handler.
  - Duplicate/customize are NOT exposed as endpoints — those actions stay
    local/simulated in the frontend. No mutation endpoints in this milestone.
  - No internal model fields, stack traces, or seed details in any response.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
"""
from fastapi import APIRouter, HTTPException, Path

from noetarch.modules.recipes.repository import RecipeRepository
from noetarch.modules.recipes.schemas import Recipe
from noetarch.modules.recipes.service import RecipeService

router = APIRouter(tags=["recipes"])

_service = RecipeService(RecipeRepository())

_ID_PATTERN = r"^[a-z0-9][a-z0-9_-]{0,62}$"


@router.get("", response_model=list[Recipe])
def list_recipes() -> list[Recipe]:
    """List all available workflow recipes."""
    return _service.list_recipes()


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(
    recipe_id: str = Path(
        ...,
        min_length=1,
        max_length=63,
        pattern=_ID_PATTERN,
        description="Recipe ID. Lowercase alphanumerics, hyphen, underscore.",
    ),
) -> Recipe:
    """Retrieve a single recipe by ID. Returns 404 if not found."""
    recipe = _service.get_recipe(recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail=f"Recipe '{recipe_id}' not found.")
    return recipe
