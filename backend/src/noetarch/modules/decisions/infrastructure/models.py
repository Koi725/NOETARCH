"""SQLAlchemy ORM model + seed-row builder for the Decisions surface."""
from sqlalchemy import JSON, Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.decisions.seed import SEED_DECISIONS


class DecisionORM(Base):
    __tablename__ = "decisions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    risk: Mapped[str] = mapped_column(String)
    payload: Mapped[str | None] = mapped_column(String, nullable=True)
    cost: Mapped[str] = mapped_column(String)
    time: Mapped[str] = mapped_column(String)
    reversible: Mapped[bool] = mapped_column(Boolean)
    detail: Mapped[str] = mapped_column(String)
    alternatives: Mapped[list[str]] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String)
    rejected_at: Mapped[str | None] = mapped_column(String, nullable=True)


def build_seed_rows() -> list[DecisionORM]:
    return [
        DecisionORM(
            id=d.id,
            sort_order=i,
            title=d.title,
            type=d.type,
            risk=d.risk,
            payload=d.payload,
            cost=d.cost,
            time=d.time,
            reversible=d.reversible,
            detail=d.detail,
            alternatives=list(d.alternatives),
            status=d.status,
            rejected_at=d.rejectedAt,
        )
        for i, d in enumerate(SEED_DECISIONS)
    ]
