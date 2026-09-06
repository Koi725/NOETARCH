"""Pydantic v2 request/response schemas for the Evidence surface.

These types mirror frontend/src/contracts/evidence.ts exactly.
Only request/response shapes are exposed here; no internal model fields leak.
Field names are camelCase to match the TypeScript contract directly.
"""
from typing import Literal

from pydantic import BaseModel, Field

EvidenceStatus = Literal["checked", "conflicting", "cannot-check"]
# Where a record came from: the local seed, or an external provider (M9).
EvidenceOrigin = Literal["seed", "openalex", "crossref"]


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
    # Provenance / reproducibility (M9). Seed records default to "seed".
    source: EvidenceOrigin = "seed"
    retrievedAt: str | None = None  # noqa: N815  (ISO-8601 UTC when externally fetched)


class EvidenceListResponse(BaseModel):
    project: str
    records: list[EvidenceRecord]


class EvidenceSearchRequest(BaseModel):
    """Body for POST /api/v1/evidence/search. Only a query STRING is accepted — never a
    URL, host, or any field that could steer an outbound request."""

    query: str = Field(min_length=1, max_length=500)


class EvidenceSearchResponse(BaseModel):
    enabled: bool
    source: EvidenceOrigin
    query: str
    retrievedAt: str | None = None  # noqa: N815
    frozen: int = 0
    deduplicated: int = 0
    records: list[EvidenceRecord] = Field(default_factory=list)
    message: str | None = None
