"""Evidence repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas.

All queries use SQLAlchemy constructs (parameterized); no raw SQL.
"""
from sqlalchemy import select
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

    def get_by_id(self, record_id: str) -> EvidenceRecord | None:
        row = self._session.get(EvidenceRecordORM, record_id)
        return self._to_schema(row) if row is not None else None

    def project_name(self) -> str:
        project = self._session.execute(
            select(EvidenceRecordORM.project).order_by(EvidenceRecordORM.sort_order).limit(1)
        ).scalar_one_or_none()
        return project or ""

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
            }
        )
