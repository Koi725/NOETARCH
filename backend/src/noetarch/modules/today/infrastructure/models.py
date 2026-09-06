"""SQLAlchemy ORM model + seed-row builder for the Today surface.

Today is a single workspace snapshot. Scalar fields are columns; the composite
sub-objects and tuple lists are stored as JSON (portable SQLite/Postgres).
"""
from typing import Any

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.today.seed import SEED_TODAY

SNAPSHOT_ID = "current"


class TodaySnapshotORM(Base):
    __tablename__ = "today_snapshot"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project: Mapped[str] = mapped_column(String)
    question: Mapped[str] = mapped_column(String)
    waiting: Mapped[dict[str, Any]] = mapped_column(JSON)
    run: Mapped[dict[str, Any]] = mapped_column(JSON)
    failure: Mapped[dict[str, Any]] = mapped_column(JSON)
    finished: Mapped[list[Any]] = mapped_column(JSON)
    sources: Mapped[list[Any]] = mapped_column(JSON)
    files: Mapped[list[Any]] = mapped_column(JSON)


def build_seed_rows() -> list[TodaySnapshotORM]:
    d = SEED_TODAY.model_dump(mode="json")
    return [
        TodaySnapshotORM(
            id=SNAPSHOT_ID,
            project=d["project"],
            question=d["question"],
            waiting=d["waiting"],
            run=d["run"],
            failure=d["failure"],
            finished=d["finished"],
            sources=d["sources"],
            files=d["files"],
        )
    ]
