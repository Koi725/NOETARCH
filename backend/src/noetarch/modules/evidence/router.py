"""Evidence router — GET /api/v1/evidence (list) and GET /api/v1/evidence/{record_id} (detail).

Security controls:
  - record_id validated by regex: starts with lowercase letter, then [a-z0-9_-], max 64 chars total.
    Rejects uppercase, path separators, dots, null bytes, and over-length values.
  - 404 on unknown id; structured error via the app-level exception handler.
  - 422 (FastAPI validation) on malformed id.
  - No internal model fields, stack traces, or seed implementation details in any response.
  - No write endpoints on this surface.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
"""
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.core.egress import EgressError
from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.evidence.dependencies import (
    EvidenceProvider,
    external_sources_enabled,
    get_evidence_provider,
)
from noetarch.modules.evidence.freeze_service import EvidenceFreezeService
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import (
    EvidenceListResponse,
    EvidenceRecord,
    EvidenceSearchRequest,
    EvidenceSearchResponse,
)
from noetarch.modules.evidence.service import EvidenceService

router = APIRouter(tags=["evidence"])

_ID_PATTERN = r"^[a-z][a-z0-9_-]{0,62}$"
_RUN_ID_PATTERN = r"^[a-z0-9][a-z0-9_-]{0,127}$"


@router.get("", response_model=EvidenceListResponse)
def list_evidence(
    run: str | None = Query(
        default=None,
        min_length=1,
        max_length=128,
        pattern=_RUN_ID_PATTERN,
        description="Optional run id — return only the evidence a given run froze/screened.",
    ),
    session: Session = Depends(get_session),
) -> EvidenceListResponse:
    """List evidence records; ``?run=`` scopes to the records a single run screened."""
    service = EvidenceService(EvidenceRepository(session))
    if run:
        record_ids = DecisionRepository(session).paper_ids_for_run(run)
        return service.list_records(record_ids=record_ids)
    return service.list_records()


@router.post("/search", response_model=EvidenceSearchResponse)
def search_evidence(
    request: Request,
    body: EvidenceSearchRequest,
    enabled: bool = Depends(external_sources_enabled),
    provider: EvidenceProvider = Depends(get_evidence_provider),
    session: Session = Depends(get_session),
) -> EvidenceSearchResponse:
    """Fetch matching works from an external source, freeze them, return typed records.

    A query STRING is the only input. When external sources are disabled (default) this
    makes ZERO network calls and returns a clear disabled state.
    """
    if not enabled:
        return EvidenceSearchResponse(
            enabled=False,
            source="openalex",
            query=body.query,
            message=(
                "External sources are disabled. Set NOETARCH_EXTERNAL_SOURCES_ENABLED=1 to"
                " enable fetching; the app otherwise runs on local data only."
            ),
        )

    request_id = getattr(request.state, "request_id", None)
    try:
        records = provider.search(body.query)
    except EgressError as exc:
        raise HTTPException(status_code=502, detail="External source unavailable.") from exc

    freeze = EvidenceFreezeService(
        session, EvidenceRepository(session), AuditRepository(session)
    )
    result = freeze.freeze(records, query=body.query, source="openalex", request_id=request_id)
    retrieved_at = records[0].retrievedAt if records else None
    return EvidenceSearchResponse(
        enabled=True,
        source="openalex",
        query=body.query,
        retrievedAt=retrieved_at,
        frozen=len(result.frozen),
        deduplicated=result.deduplicated,
        records=records,
    )


@router.get("/{record_id}", response_model=EvidenceRecord)
def get_evidence(
    record_id: str = Path(
        ...,
        min_length=1,
        max_length=63,
        pattern=_ID_PATTERN,
        description="Evidence record ID. Must start with a lowercase letter.",
    ),
    session: Session = Depends(get_session),
) -> EvidenceRecord:
    """Retrieve a single evidence record by ID. Returns 404 if not found."""
    record = EvidenceService(EvidenceRepository(session)).get_record(record_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"Evidence record '{record_id}' not found.")
    return record
