"""Recipes repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.recipes.infrastructure.models import RecipeORM
from noetarch.modules.recipes.schemas import Recipe


class RecipeRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[Recipe]:
        rows = (
            self._session.execute(select(RecipeORM).order_by(RecipeORM.sort_order))
            .scalars()
            .all()
        )
        return [self._to_schema(r) for r in rows]

    def get_by_id(self, recipe_id: str) -> Recipe | None:
        row = self._session.get(RecipeORM, recipe_id)
        return self._to_schema(row) if row is not None else None

    @staticmethod
    def _to_schema(row: RecipeORM) -> Recipe:
        return Recipe.model_validate(
            {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "execution": row.execution,
                "steps": row.steps,
                "inputs": row.inputs,
                "outputs": row.outputs,
                "estimatedCost": row.estimated_cost,
                "estimatedTime": row.estimated_time,
                "providers": row.providers,
                "privacyPolicy": row.privacy_policy,
            }
        )
