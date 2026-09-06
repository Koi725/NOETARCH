"""SQLAlchemy ORM model + seed-row builder for the Evidence surface.

ORM models never leave this layer; repositories map them to Pydantic response
schemas. Nested/array fields are stored as JSON columns (portable SQLite/Postgres).
"""
from typing import Any

from sqlalchemy import JSON, Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.evidence.seed import SEED_PROJECT, SEED_RECORDS


class EvidenceRecordORM(Base):
    __tablename__ = "evidence_records"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    project: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    authors: Mapped[str] = mapped_column(String)
    year: Mapped[int] = mapped_column(Integer)
    journal: Mapped[str] = mapped_column(String)
    doi: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String)
    sources: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    provenance: Mapped[list[str]] = mapped_column(JSON)
    agreement_count: Mapped[int] = mapped_column(Integer)
    total_sources: Mapped[int] = mapped_column(Integer)
    missing_doi: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    conflict_note: Mapped[str | None] = mapped_column(String, nullable=True)


def build_seed_rows() -> list[EvidenceRecordORM]:
    rows: list[EvidenceRecordORM] = []
    for i, rec in enumerate(SEED_RECORDS):
        rows.append(
            EvidenceRecordORM(
                id=rec.id,
                sort_order=i,
                project=SEED_PROJECT,
                title=rec.title,
                authors=rec.authors,
                year=rec.year,
                journal=rec.journal,
                doi=rec.doi,
                status=rec.status,
                sources=[s.model_dump() for s in rec.sources],
                provenance=list(rec.provenance),
                agreement_count=rec.agreementCount,
                total_sources=rec.totalSources,
                missing_doi=rec.missingDoi,
                conflict_note=rec.conflictNote,
            )
        )
    return rows
