"""Decisions router — GET /api/v1/decisions (list) and /{decision_id} (detail).

Security controls:
  - decision_id validated by regex: ^[a-z0-9][a-z0-9_-]{0,62}$. Rejects uppercase,
    path separators, dots, null bytes, and over-length values.
  - 404 on unknown id; structured error via the app-level exception handler.
  - Approve/reject/alternative are NOT exposed as endpoints — those actions stay
    local/simulated in the frontend. No mutation endpoints in this milestone.
  - No internal model fields, stack traces, or seed details in any response.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
"""
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.schemas import Decision
from noetarch.modules.decisions.service import DecisionService

router = APIRouter(tags=["decisions"])

_ID_PATTERN = r"^[a-z0-9][a-z0-9_-]{0,62}$"


@router.get("", response_model=list[Decision])
def list_decisions(session: Session = Depends(get_session)) -> list[Decision]:
    """List all decisions awaiting or past review."""
    return DecisionService(DecisionRepository(session)).list_decisions()


@router.get("/{decision_id}", response_model=Decision)
def get_decision(
    decision_id: str = Path(
        ...,
        min_length=1,
        max_length=63,
        pattern=_ID_PATTERN,
        description="Decision ID. Lowercase alphanumerics, hyphen, underscore.",
    ),
    session: Session = Depends(get_session),
) -> Decision:
    """Retrieve a single decision by ID. Returns 404 if not found."""
    decision = DecisionService(DecisionRepository(session)).get_decision(decision_id)
    if decision is None:
        raise HTTPException(status_code=404, detail=f"Decision '{decision_id}' not found.")
    return decision
