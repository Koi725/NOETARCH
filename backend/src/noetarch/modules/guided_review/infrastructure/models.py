"""SQLAlchemy ORM model + seed-row builder for the GuidedReview surface.

GuidedReview is a single current-review snapshot. The project is a scalar column;
progress, the current paper, the lookahead, reasons, and history are stored as JSON.
"""
from typing import Any

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.guided_review.seed import SEED_GUIDED_REVIEW

SNAPSHOT_ID = "current"


class GuidedReviewSnapshotORM(Base):
    __tablename__ = "guided_review_snapshot"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project: Mapped[str] = mapped_column(String)
    progress: Mapped[dict[str, Any]] = mapped_column(JSON)
    current_paper: Mapped[dict[str, Any]] = mapped_column(JSON)
    next_papers: Mapped[list[Any]] = mapped_column(JSON)
    exclude_reasons: Mapped[list[Any]] = mapped_column(JSON)
    previous_decisions: Mapped[list[Any]] = mapped_column(JSON)


def build_seed_rows() -> list[GuidedReviewSnapshotORM]:
    d = SEED_GUIDED_REVIEW.model_dump(mode="json")
    return [
        GuidedReviewSnapshotORM(
            id=SNAPSHOT_ID,
            project=d["project"],
            progress=d["progress"],
            current_paper=d["currentPaper"],
            next_papers=d["nextPapers"],
            exclude_reasons=d["excludeReasons"],
            previous_decisions=d["previousDecisions"],
        )
    ]
