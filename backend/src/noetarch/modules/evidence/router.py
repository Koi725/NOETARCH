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
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import EvidenceListResponse, EvidenceRecord
from noetarch.modules.evidence.service import EvidenceService

router = APIRouter(tags=["evidence"])

_ID_PATTERN = r"^[a-z][a-z0-9_-]{0,62}$"


@router.get("", response_model=EvidenceListResponse)
def list_evidence(session: Session = Depends(get_session)) -> EvidenceListResponse:
    """List all evidence records for the active project."""
    return EvidenceService(EvidenceRepository(session)).list_records()


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
