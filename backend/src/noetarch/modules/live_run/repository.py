"""LiveRun repository — DB-backed (SQLAlchemy), maps the ORM snapshot to the Pydantic schema."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.live_run.infrastructure.models import LiveRunSnapshotORM
from noetarch.modules.live_run.schemas import LiveRunData


class LiveRunRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_active(self) -> LiveRunData:
        row = self._session.execute(
            select(LiveRunSnapshotORM).order_by(LiveRunSnapshotORM.id).limit(1)
        ).scalar_one()
        return LiveRunData.model_validate(
            {
                "meta": row.meta,
                "steps": row.steps,
                "stepInspector": row.step_inspector,
                "kpis": row.kpis,
                "events": row.events,
                "decisions": row.decisions,
                "evidenceCards": row.evidence_cards,
            }
        )
