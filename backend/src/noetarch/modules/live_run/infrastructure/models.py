"""SQLAlchemy ORM model + seed-row builder for the LiveRun surface.

LiveRun is a single active-run snapshot. Composite parts are stored as JSON.
"""
from typing import Any

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.live_run.seed import SEED_LIVE_RUN

SNAPSHOT_ID = "active"


class LiveRunSnapshotORM(Base):
    __tablename__ = "live_run_snapshot"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    meta: Mapped[dict[str, Any]] = mapped_column(JSON)
    steps: Mapped[list[Any]] = mapped_column(JSON)
    step_inspector: Mapped[dict[str, Any]] = mapped_column(JSON)
    kpis: Mapped[list[Any]] = mapped_column(JSON)
    events: Mapped[list[Any]] = mapped_column(JSON)
    decisions: Mapped[list[Any]] = mapped_column(JSON)
    evidence_cards: Mapped[list[Any]] = mapped_column(JSON)


def build_seed_rows() -> list[LiveRunSnapshotORM]:
    d = SEED_LIVE_RUN.model_dump(mode="json")
    return [
        LiveRunSnapshotORM(
            id=SNAPSHOT_ID,
            meta=d["meta"],
            steps=d["steps"],
            step_inspector=d["stepInspector"],
            kpis=d["kpis"],
            events=d["events"],
            decisions=d["decisions"],
            evidence_cards=d["evidenceCards"],
        )
    ]
