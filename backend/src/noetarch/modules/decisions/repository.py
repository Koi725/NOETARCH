"""Decisions repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.decisions.infrastructure.models import DecisionORM
from noetarch.modules.decisions.schemas import Decision


class DecisionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[Decision]:
        rows = (
            self._session.execute(select(DecisionORM).order_by(DecisionORM.sort_order))
            .scalars()
            .all()
        )
        return [self._to_schema(r) for r in rows]

    def get_by_id(self, decision_id: str) -> Decision | None:
        row = self._session.get(DecisionORM, decision_id)
        return self._to_schema(row) if row is not None else None

    @staticmethod
    def _to_schema(row: DecisionORM) -> Decision:
        return Decision.model_validate(
            {
                "id": row.id,
                "title": row.title,
                "type": row.type,
                "risk": row.risk,
                "payload": row.payload,
                "cost": row.cost,
                "time": row.time,
                "reversible": row.reversible,
                "detail": row.detail,
                "alternatives": row.alternatives,
                "status": row.status,
                "rejectedAt": row.rejected_at,
            }
        )
