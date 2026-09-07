"""Today repository — DB-backed (SQLAlchemy), maps the ORM snapshot to the Pydantic schema."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.today.infrastructure.models import TodaySnapshotORM
from noetarch.modules.today.schemas import TodayData


class TodayRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get(self) -> TodayData:
        row = self._session.execute(
            select(TodaySnapshotORM).order_by(TodaySnapshotORM.id).limit(1)
        ).scalar_one_or_none()
        if row is None:
            # Unseeded / real mode: return a valid empty snapshot, never crash.
            return TodayData.empty()
        return TodayData.model_validate(
            {
                "project": row.project,
                "question": row.question,
                "waiting": row.waiting,
                "run": row.run,
                "failure": row.failure,
                "finished": row.finished,
                "sources": row.sources,
                "files": row.files,
            }
        )
