"""Decisions router — reads (M6/M7) plus the first persisted write + audit (M8).

Security controls:
  - decision_id validated by regex: ^[a-z0-9][a-z0-9_-]{0,62}$ (rejects uppercase,
    path separators, dots, null bytes, over-length) → 422 on malformed id.
  - Action + expected_version validated by the Pydantic body → 422 on invalid input.
    The request body is size-limited by the app-level 1 MiB middleware (413).
  - Optimistic concurrency + valid-transition enforced in the write service → 409.
  - Unknown decision → 404. Structured errors via the app-level handler; no internals leak.
  - Writes are LOCAL-ONLY and PRE-AUTH — see THREAT.md. CORS remains deny-by-default.
"""
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.modules.audit.infrastructure.models import AuditLogORM
from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.schemas import (
    AuditEntry,
    Decision,
    DecisionActionRequest,
)
from noetarch.modules.decisions.service import DecisionService
from noetarch.modules.decisions.write_service import (
    ENTITY_TYPE,
    DecisionConflictError,
    DecisionNotFoundError,
    DecisionWriteService,
)

router = APIRouter(tags=["decisions"])

_ID_PATTERN = r"^[a-z0-9][a-z0-9_-]{0,62}$"


def _to_audit_entry(row: AuditLogORM) -> AuditEntry:
    return AuditEntry(
        id=row.id,
        entityType=row.entity_type,
        entityId=row.entity_id,
        action=row.action,
        actor=row.actor,
        fromStatus=row.from_status,
        toStatus=row.to_status,
        requestId=row.request_id,
        createdAt=row.created_at.isoformat(),
        payloadHash=row.payload_hash,
    )


@router.get("", response_model=list[Decision])
def list_decisions(session: Session = Depends(get_session)) -> list[Decision]:
    """List all decisions awaiting or past review."""
    return DecisionService(DecisionRepository(session)).list_decisions()


@router.get("/{decision_id}", response_model=Decision)
def get_decision(
    decision_id: str = Path(
        ..., min_length=1, max_length=63, pattern=_ID_PATTERN,
        description="Decision ID. Lowercase alphanumerics, hyphen, underscore.",
    ),
    session: Session = Depends(get_session),
) -> Decision:
    """Retrieve a single decision by ID. Returns 404 if not found."""
    decision = DecisionService(DecisionRepository(session)).get_decision(decision_id)
    if decision is None:
        raise HTTPException(status_code=404, detail=f"Decision '{decision_id}' not found.")
    return decision


@router.post("/{decision_id}/action", response_model=Decision)
def action_decision(
    request: Request,
    body: DecisionActionRequest,
    decision_id: str = Path(
        ..., min_length=1, max_length=63, pattern=_ID_PATTERN,
        description="Decision ID. Lowercase alphanumerics, hyphen, underscore.",
    ),
    session: Session = Depends(get_session),
) -> Decision:
    """Approve / reject / use-local-alternative on a pending decision (LOCAL-ONLY, PRE-AUTH).

    Returns the updated decision. Version mismatch or an already-resolved decision → 409.
    """
    request_id = getattr(request.state, "request_id", None)
    write_service = DecisionWriteService(
        session, DecisionRepository(session), AuditRepository(session)
    )
    try:
        return write_service.action_decision(
            decision_id=decision_id,
            action=body.action,
            expected_version=body.expected_version,
            request_id=request_id,
        )
    except DecisionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Decision '{decision_id}' not found.") from exc
    except DecisionConflictError as exc:
        raise HTTPException(status_code=409, detail=exc.message) from exc


@router.get("/{decision_id}/audit", response_model=list[AuditEntry])
def get_decision_audit(
    decision_id: str = Path(
        ..., min_length=1, max_length=63, pattern=_ID_PATTERN,
        description="Decision ID. Lowercase alphanumerics, hyphen, underscore.",
    ),
    session: Session = Depends(get_session),
) -> list[AuditEntry]:
    """Return the append-only audit trail for a decision (read-only provenance)."""
    decisions = DecisionRepository(session)
    if decisions.get_orm(decision_id) is None:
        raise HTTPException(status_code=404, detail=f"Decision '{decision_id}' not found.")
    rows = AuditRepository(session).list_for_entity(ENTITY_TYPE, decision_id)
    return [_to_audit_entry(r) for r in rows]
