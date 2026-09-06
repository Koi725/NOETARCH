"""History repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.history.infrastructure.models import HistoryRunORM
from noetarch.modules.history.schemas import HistoryRun


class HistoryRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[HistoryRun]:
        rows = (
            self._session.execute(select(HistoryRunORM).order_by(HistoryRunORM.sort_order))
            .scalars()
            .all()
        )
        return [self._to_schema(r) for r in rows]

    @staticmethod
    def _to_schema(row: HistoryRunORM) -> HistoryRun:
        return HistoryRun.model_validate(
            {
                "id": row.id,
                "status": row.status,
                "title": row.title,
                "recipe": row.recipe,
                "started": row.started,
                "stoppedAt": row.stopped_at,
                "duration": row.duration,
                "cost": row.cost,
                "papers": row.papers,
                "providers": row.providers,
                "notes": row.notes,
                "stopReason": row.stop_reason,
                "failureReason": row.failure_reason,
            }
        )
