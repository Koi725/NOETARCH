"""SQLAlchemy ORM model + seed-row builder for the History surface."""
from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.history.seed import SEED_RUNS


class HistoryRunORM(Base):
    __tablename__ = "history_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    recipe: Mapped[str] = mapped_column(String)
    started: Mapped[str] = mapped_column(String)
    stopped_at: Mapped[str | None] = mapped_column(String, nullable=True)
    duration: Mapped[str] = mapped_column(String)
    cost: Mapped[str] = mapped_column(String)
    papers: Mapped[int] = mapped_column(Integer)
    providers: Mapped[list[str]] = mapped_column(JSON)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    stop_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(String, nullable=True)


def build_seed_rows() -> list[HistoryRunORM]:
    return [
        HistoryRunORM(
            id=r.id,
            sort_order=i,
            status=r.status,
            title=r.title,
            recipe=r.recipe,
            started=r.started,
            stopped_at=r.stoppedAt,
            duration=r.duration,
            cost=r.cost,
            papers=r.papers,
            providers=list(r.providers),
            notes=r.notes,
            stop_reason=r.stopReason,
            failure_reason=r.failureReason,
        )
        for i, r in enumerate(SEED_RUNS)
    ]
