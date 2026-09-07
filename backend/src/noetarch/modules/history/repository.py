"""History repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas.

Real runs (the linear executor's ``RunORM`` rows) are surfaced here alongside any demo
seed rows, so the History & replay screen is populated by actual runs the moment one
completes. Real runs are listed newest-first, ahead of any seed rows.
"""
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.history.infrastructure.models import HistoryRunORM
from noetarch.modules.history.schemas import HistoryRun
from noetarch.runs.models import RunORM

# Map the executor's terminal RunStatus onto the History surface's display status.
_RUN_STATUS_MAP: dict[str, str] = {
    "completed": "complete",
    "halted_budget": "partial",
    "failed": "failed",
    "no_provider": "interrupted",
    "external_sources_disabled": "interrupted",
}


class HistoryRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[HistoryRun]:
        real = self.list_real_runs()
        seed_rows = (
            self._session.execute(select(HistoryRunORM).order_by(HistoryRunORM.sort_order))
            .scalars()
            .all()
        )
        return real + [self._to_schema(r) for r in seed_rows]

    def list_real_runs(self) -> list[HistoryRun]:
        rows = (
            self._session.execute(select(RunORM).order_by(RunORM.created_at.desc()))
            .scalars()
            .all()
        )
        return [self._run_to_schema(r) for r in rows]

    @classmethod
    def _run_to_schema(cls, row: RunORM) -> HistoryRun:
        status = _RUN_STATUS_MAP.get(row.status, "partial")
        notes = (
            f"{row.included} include · {row.excluded} exclude · "
            f"{row.uncertain} uncertain · {row.screened} screened"
        )
        stop_reason = (
            "Budget cap reached — run halted cleanly."
            if row.status == "halted_budget"
            else None
        )
        return HistoryRun(
            id=row.id,
            status=status,  # type: ignore[arg-type]
            title=row.question,
            recipe=f"Linear run · {row.model}",
            started=row.created_at,
            stoppedAt=row.finished_at,
            duration=cls._duration(row.created_at, row.finished_at),
            cost=f"${row.cost_usd:.4f}",
            papers=row.frozen,
            providers=[row.provider],
            notes=notes,
            stopReason=stop_reason,
            failureReason=row.error,
        )

    @staticmethod
    def _duration(started: str, finished: str | None) -> str:
        if not finished:
            return "—"
        try:
            delta = datetime.fromisoformat(finished) - datetime.fromisoformat(started)
        except ValueError:
            return "—"
        total = max(0, int(delta.total_seconds()))
        if total < 60:
            return f"{total}s"
        minutes, seconds = divmod(total, 60)
        return f"{minutes}m {seconds}s"

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
