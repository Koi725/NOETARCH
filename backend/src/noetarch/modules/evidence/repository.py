"""Evidence repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas.

All queries use SQLAlchemy constructs (parameterized); no raw SQL.
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from noetarch.modules.evidence.infrastructure.models import EvidenceRecordORM
from noetarch.modules.evidence.schemas import EvidenceRecord


class EvidenceRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[EvidenceRecord]:
        rows = (
            self._session.execute(
                select(EvidenceRecordORM).order_by(EvidenceRecordORM.sort_order)
            )
            .scalars()
            .all()
        )
        return [self._to_schema(r) for r in rows]

    def list_by_ids(self, record_ids: list[str]) -> list[EvidenceRecord]:
        """Records for the given ids, in the table's stable sort order (run deep-link)."""
        if not record_ids:
            return []
        rows = (
            self._session.execute(
                select(EvidenceRecordORM)
                .where(EvidenceRecordORM.id.in_(record_ids))
                .order_by(EvidenceRecordORM.sort_order)
            )
            .scalars()
            .all()
        )
        return [self._to_schema(r) for r in rows]

    def get_by_id(self, record_id: str) -> EvidenceRecord | None:
        row = self._session.get(EvidenceRecordORM, record_id)
        return self._to_schema(row) if row is not None else None

    def project_name(self) -> str:
        project = self._session.execute(
            select(EvidenceRecordORM.project).order_by(EvidenceRecordORM.sort_order).limit(1)
        ).scalar_one_or_none()
        return project or ""

    # ── freeze helpers (M9 write path) ──────────────────────────────────────────

    def existing_dois(self) -> set[str]:
        """Lowercased DOIs already persisted — used for fetch-and-freeze dedupe."""
        rows = self._session.execute(
            select(EvidenceRecordORM.doi).where(EvidenceRecordORM.doi.is_not(None))
        ).scalars().all()
        return {d.lower() for d in rows if d}

    def id_exists(self, record_id: str) -> bool:
        return self._session.get(EvidenceRecordORM, record_id) is not None

    def next_sort_order(self) -> int:
        current_max = self._session.execute(
            select(func.max(EvidenceRecordORM.sort_order))
        ).scalar_one_or_none()
        return (current_max or 0) + 1

    def add_record(self, record: EvidenceRecord, *, sort_order: int) -> None:
        """Insert a fetched record (parameterized via the ORM). Caller commits."""
        self._session.add(
            EvidenceRecordORM(
                id=record.id,
                sort_order=sort_order,
                project=self.project_name(),
                title=record.title,
                authors=record.authors,
                year=record.year,
                journal=record.journal,
                doi=record.doi,
                status=record.status,
                sources=[s.model_dump() for s in record.sources],
                provenance=list(record.provenance),
                agreement_count=record.agreementCount,
                total_sources=record.totalSources,
                missing_doi=record.missingDoi,
                conflict_note=record.conflictNote,
                source=record.source,
                retrieved_at=record.retrievedAt,
            )
        )

    @staticmethod
    def _to_schema(row: EvidenceRecordORM) -> EvidenceRecord:
        return EvidenceRecord.model_validate(
            {
                "id": row.id,
                "title": row.title,
                "authors": row.authors,
                "year": row.year,
                "journal": row.journal,
                "doi": row.doi,
                "status": row.status,
                "sources": row.sources,
                "provenance": row.provenance,
                "agreementCount": row.agreement_count,
                "totalSources": row.total_sources,
                "missingDoi": row.missing_doi,
                "conflictNote": row.conflict_note,
                "source": row.source,
                "retrievedAt": row.retrieved_at,
            }
        )
