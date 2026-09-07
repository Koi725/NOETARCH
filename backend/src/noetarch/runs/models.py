"""SQLAlchemy ORM model for run records (the linear executor's persisted state).

A run row captures the inputs/params (question, year range, caps, budget, provider/model)
so a run is replayable, plus the outcome counters and token/cost accounting. No seed
builder — this table is empty in demo mode and populated only by real runs.
"""
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base


class RunORM(Base):
    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    # Replay inputs / params
    question: Mapped[str] = mapped_column(String)
    year_from: Mapped[int | None] = mapped_column(Integer, nullable=True)
    year_to: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_results: Mapped[int] = mapped_column(Integer)
    budget_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    provider: Mapped[str] = mapped_column(String)
    model: Mapped[str] = mapped_column(String)
    # Outcome
    status: Mapped[str] = mapped_column(String)
    frozen: Mapped[int] = mapped_column(Integer, default=0)
    deduplicated: Mapped[int] = mapped_column(Integer, default=0)
    screened: Mapped[int] = mapped_column(Integer, default=0)
    included: Mapped[int] = mapped_column(Integer, default=0)
    excluded: Mapped[int] = mapped_column(Integer, default=0)
    uncertain: Mapped[int] = mapped_column(Integer, default=0)
    off_schema: Mapped[int] = mapped_column(Integer, default=0)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[str] = mapped_column(String)
    finished_at: Mapped[str | None] = mapped_column(String, nullable=True)
    error: Mapped[str | None] = mapped_column(String, nullable=True)
