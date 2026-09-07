"""GuidedReview repository — DB-backed (SQLAlchemy), maps the ORM snapshot to Pydantic."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.guided_review.infrastructure.models import GuidedReviewSnapshotORM
from noetarch.modules.guided_review.schemas import GuidedReviewData


class GuidedReviewRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_current(self) -> GuidedReviewData:
        row = self._session.execute(
            select(GuidedReviewSnapshotORM).order_by(GuidedReviewSnapshotORM.id).limit(1)
        ).scalar_one_or_none()
        if row is None:
            # Unseeded / real mode: return a valid empty review state, never crash.
            return GuidedReviewData.empty()
        return GuidedReviewData.model_validate(
            {
                "project": row.project,
                "progress": row.progress,
                "currentPaper": row.current_paper,
                "nextPapers": row.next_papers,
                "excludeReasons": row.exclude_reasons,
                "previousDecisions": row.previous_decisions,
            }
        )
