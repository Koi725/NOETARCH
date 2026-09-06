"""Pydantic v2 request/response schemas for the Evidence surface.

These types mirror frontend/src/contracts/evidence.ts exactly.
Only request/response shapes are exposed here; no internal model fields leak.
Field names are camelCase to match the TypeScript contract directly.
"""
from typing import Literal

from pydantic import BaseModel

EvidenceStatus = Literal["checked", "conflicting", "cannot-check"]


class EvidenceSource(BaseModel):
    name: str
    found: bool
    note: str


class EvidenceRecord(BaseModel):
    id: str
    title: str
    authors: str
    year: int
    journal: str
    doi: str | None
    status: EvidenceStatus
    sources: list[EvidenceSource]
    provenance: list[str]
    agreementCount: int  # noqa: N815
    totalSources: int  # noqa: N815
    missingDoi: bool | None = None  # noqa: N815
    conflictNote: str | None = None  # noqa: N815


class EvidenceListResponse(BaseModel):
    project: str
    records: list[EvidenceRecord]
