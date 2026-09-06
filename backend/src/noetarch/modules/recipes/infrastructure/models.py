"""SQLAlchemy ORM model + seed-row builder for the Recipes surface."""
from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.recipes.seed import SEED_RECIPES


class RecipeORM(Base):
    __tablename__ = "recipes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    execution: Mapped[str] = mapped_column(String)
    steps: Mapped[list[str]] = mapped_column(JSON)
    inputs: Mapped[list[str]] = mapped_column(JSON)
    outputs: Mapped[list[str]] = mapped_column(JSON)
    estimated_cost: Mapped[str] = mapped_column(String)
    estimated_time: Mapped[str] = mapped_column(String)
    providers: Mapped[list[str]] = mapped_column(JSON)
    privacy_policy: Mapped[str] = mapped_column(String)


def build_seed_rows() -> list[RecipeORM]:
    return [
        RecipeORM(
            id=r.id,
            sort_order=i,
            name=r.name,
            description=r.description,
            execution=r.execution,
            steps=list(r.steps),
            inputs=list(r.inputs),
            outputs=list(r.outputs),
            estimated_cost=r.estimatedCost,
            estimated_time=r.estimatedTime,
            providers=list(r.providers),
            privacy_policy=r.privacyPolicy,
        )
        for i, r in enumerate(SEED_RECIPES)
    ]
