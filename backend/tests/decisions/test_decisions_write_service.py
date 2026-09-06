"""Service-level tests for the Decisions write path, including the atomicity guarantee."""
import pytest
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from noetarch.modules.audit.infrastructure.models import AuditLogORM
from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.write_service import (
    DecisionConflictError,
    DecisionNotFoundError,
    DecisionWriteService,
)


def _service(session: Session, audit: AuditRepository | None = None) -> DecisionWriteService:
    return DecisionWriteService(
        session, DecisionRepository(session), audit or AuditRepository(session)
    )


def test_valid_approve_writes_state_and_audit_atomically(fresh_db_session: Session) -> None:
    result = _service(fresh_db_session).action_decision(
        decision_id="dec-001", action="approve", expected_version=1, request_id="req-x"
    )
    assert result.status == "approved"
    assert result.version == 2
    assert result.resolvedAt is not None
    assert result.resolutionAction == "approve"

    audit = AuditRepository(fresh_db_session).list_for_entity("decision", "dec-001")
    assert len(audit) == 1
    assert audit[0].from_status == "pending"
    assert audit[0].to_status == "approved"
    assert audit[0].request_id == "req-x"
    assert audit[0].payload_hash  # a fingerprint was recorded


def test_use_local_alternative_maps_to_local_alternative(fresh_db_session: Session) -> None:
    result = _service(fresh_db_session).action_decision(
        decision_id="dec-001", action="use_local_alternative", expected_version=1
    )
    assert result.status == "local_alternative"
    assert result.resolutionAction == "use_local_alternative"


def test_stale_version_conflicts_and_writes_nothing(fresh_db_session: Session) -> None:
    with pytest.raises(DecisionConflictError):
        _service(fresh_db_session).action_decision(
            decision_id="dec-001", action="approve", expected_version=99
        )
    row = DecisionRepository(fresh_db_session).get_orm("dec-001")
    assert row is not None
    assert row.status == "pending"
    assert AuditRepository(fresh_db_session).list_for_entity("decision", "dec-001") == []


def test_action_on_resolved_decision_conflicts(fresh_db_session: Session) -> None:
    # dec-003 is seeded as already "rejected" (version 1).
    with pytest.raises(DecisionConflictError):
        _service(fresh_db_session).action_decision(
            decision_id="dec-003", action="approve", expected_version=1
        )


def test_unknown_decision_raises_not_found(fresh_db_session: Session) -> None:
    with pytest.raises(DecisionNotFoundError):
        _service(fresh_db_session).action_decision(
            decision_id="dec-999", action="approve", expected_version=1
        )


def test_double_action_second_call_conflicts(fresh_db_session: Session) -> None:
    _service(fresh_db_session).action_decision(
        decision_id="dec-001", action="approve", expected_version=1
    )
    # Second action with the stale original version must conflict.
    with pytest.raises(DecisionConflictError):
        _service(fresh_db_session).action_decision(
            decision_id="dec-001", action="reject", expected_version=1
        )


class _FailingAudit(AuditRepository):
    """An audit repository whose append always fails (to test rollback atomicity)."""

    def append(
        self,
        *,
        entity_type: str,
        entity_id: str,
        action: str,
        actor: str,
        from_status: str | None,
        to_status: str | None,
        request_id: str | None,
        payload_hash: str | None,
    ) -> AuditLogORM:
        raise RuntimeError("audit backend unavailable")


def test_audit_insert_failure_rolls_back_state_change(fresh_db_engine: Engine) -> None:
    with Session(fresh_db_engine) as session:
        service = _service(session, audit=_FailingAudit(session))
        with pytest.raises(RuntimeError):
            service.action_decision(
                decision_id="dec-001", action="approve", expected_version=1
            )
        session.rollback()

    # A brand-new session must observe NO state change and NO audit row.
    with Session(fresh_db_engine) as verify:
        row = DecisionRepository(verify).get_orm("dec-001")
        assert row is not None
        assert row.status == "pending"
        assert row.version == 1
        assert row.resolved_at is None
        assert AuditRepository(verify).list_for_entity("decision", "dec-001") == []
