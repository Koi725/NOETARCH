"""Decisions repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas.

Exposes read mappings plus ORM access used by the write path. All queries use
SQLAlchemy constructs (parameterized); no raw SQL.
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from noetarch.modules.decisions.infrastructure.models import DecisionORM
from noetarch.modules.decisions.schemas import Decision


class DecisionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    # ── creation helpers (used by the run executor; caller owns the commit) ──────

    def id_exists(self, decision_id: str) -> bool:
        return self._session.get(DecisionORM, decision_id) is not None

    def next_sort_order(self) -> int:
        current_max = self._session.execute(
            select(func.max(DecisionORM.sort_order))
        ).scalar_one_or_none()
        return (current_max or 0) + 1

    def add(self, row: DecisionORM) -> None:
        """Insert a decision row (parameterized via the ORM). Caller commits."""
        self._session.add(row)

    def list_all(self) -> list[Decision]:
        rows = (
            self._session.execute(select(DecisionORM).order_by(DecisionORM.sort_order))
            .scalars()
            .all()
        )
        return [self.to_schema(r) for r in rows]

    @staticmethod
    def _run_prefix(run_id: str) -> str:
        """Deterministic id prefix the run executor writes: ``run-{run_id}-{paper_id}``."""
        return f"run-{run_id}-"

    @staticmethod
    def _escape_like(value: str) -> str:
        # Neutralize SQL LIKE wildcards so the prefix match is literal (defence in depth;
        # run_id is already regex-validated at the route). Pairs with escape="\\".
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

    def list_for_run(self, run_id: str) -> list[Decision]:
        """Decisions produced by a single run, in stable order (run-scoped deep-link)."""
        like = self._escape_like(self._run_prefix(run_id)) + "%"
        rows = (
            self._session.execute(
                select(DecisionORM)
                .where(DecisionORM.id.like(like, escape="\\"))
                .order_by(DecisionORM.sort_order)
            )
            .scalars()
            .all()
        )
        return [self.to_schema(r) for r in rows]

    def paper_ids_for_run(self, run_id: str) -> list[str]:
        """Evidence record ids a run screened, recovered from its decision ids."""
        prefix = self._run_prefix(run_id)
        like = self._escape_like(prefix) + "%"
        ids = (
            self._session.execute(
                select(DecisionORM.id).where(DecisionORM.id.like(like, escape="\\"))
            )
            .scalars()
            .all()
        )
        return [rid[len(prefix):] for rid in ids if rid.startswith(prefix)]

    def get_by_id(self, decision_id: str) -> Decision | None:
        row = self._session.get(DecisionORM, decision_id)
        return self.to_schema(row) if row is not None else None

    def get_orm(self, decision_id: str) -> DecisionORM | None:
        """Return the mutable ORM row (write path only)."""
        return self._session.get(DecisionORM, decision_id)

    @staticmethod
    def to_schema(row: DecisionORM) -> Decision:
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
                "version": row.version,
                "resolvedAt": row.resolved_at,
                "resolutionAction": row.resolution_action,
            }
        )
