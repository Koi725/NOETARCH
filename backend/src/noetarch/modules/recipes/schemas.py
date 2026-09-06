"""Pydantic v2 response schemas for the Recipes surface.

Mirrors the Recipe type in frontend/src/contracts/recipe.ts exactly. Response-only.
camelCase field names match the TypeScript contract. CustomRecipe is a
frontend-only client-side concept (duplication) and is not served by the backend.
"""
from typing import Literal

from pydantic import BaseModel

RecipeExecution = Literal["local", "cloud"]


class Recipe(BaseModel):
    id: str
    name: str
    description: str
    execution: RecipeExecution
    steps: list[str]
    inputs: list[str]
    outputs: list[str]
    estimatedCost: str  # noqa: N815
    estimatedTime: str  # noqa: N815
    providers: list[str]
    privacyPolicy: str  # noqa: N815
