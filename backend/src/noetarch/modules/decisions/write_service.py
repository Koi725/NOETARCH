"""Decisions write path — the first persisted mutation in NOETARCH.

Guarantees:
  - Valid transitions: only a ``pending`` decision may be actioned.
  - Optimistic concurrency: ``expected_version`` must equal the current version,
    otherwise the write is rejected (prevents double-approve from two tabs / a
    double-click).
  - Idempotency policy: an action on an already-resolved decision is rejected with a
    conflict (NOT an idempotent no-op) — chosen so the audit trail records exactly one
    resolution and never a silent re-resolution.
  - Atomicity: the status change and the audit-log insert are committed in a single
    transaction. If either fails, both roll back — a state change can never exist
    without its audit record.
"""
import hashlib
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.schemas import ACTION_TO_STATUS, Decision, DecisionAction

ENTITY_TYPE = "decision"
DEFAULT_ACTOR = "local-user"  # placeholder until auth lands (M-future)


class DecisionNotFoundError(Exception):
    """Raised when the target decision does not exist."""


class DecisionConflictError(Exception):
    """Raised on a version mismatch or an action against an already-resolved decision."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def _payload_hash(decision_id: str, action: DecisionAction, expected_version: int) -> str:
    """SHA-256 of the canonical action payload — a tamper-evidence fingerprint.

    Not a secret and not reversible to sensitive data; it binds the audit record to the
    exact request that produced the state change.
    """
    canonical = f"{decision_id}|{action}|{expected_version}"
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


class DecisionWriteService:
    def __init__(
        self, session: Session, decisions: DecisionRepository, audit: AuditRepository
    ) -> None:
        self._session = session
        self._decisions = decisions
        self._audit = audit

    def action_decision(
        self,
        *,
        decision_id: str,
        action: DecisionAction,
        expected_version: int,
        actor: str = DEFAULT_ACTOR,
        request_id: str | None = None,
    ) -> Decision:
        row = self._decisions.get_orm(decision_id)
        if row is None:
            raise DecisionNotFoundError(decision_id)

        # Optimistic concurrency check first (a stale client version always conflicts).
        if row.version != expected_version:
            raise DecisionConflictError(
                f"Version conflict: expected {expected_version}, current {row.version}."
            )
        # Valid-transition check: only pending decisions may be actioned.
        if row.status != "pending":
            raise DecisionConflictError(
                f"Decision '{decision_id}' is already resolved ({row.status})."
            )

        from_status = row.status
        to_status = ACTION_TO_STATUS[action]

        # 1) state change
        row.status = to_status
        row.version = row.version + 1
        row.resolved_at = datetime.now(tz=UTC).isoformat()
        row.resolution_action = action

        # 2) audit insert (same transaction — flushed, not yet committed)
        self._audit.append(
            entity_type=ENTITY_TYPE,
            entity_id=decision_id,
            action=action,
            actor=actor,
            from_status=from_status,
            to_status=to_status,
            request_id=request_id,
            payload_hash=_payload_hash(decision_id, action, expected_version),
        )

        # 3) atomic commit — both the state change and the audit row, or neither.
        self._session.commit()
        self._session.refresh(row)
        return DecisionRepository.to_schema(row)
