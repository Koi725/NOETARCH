"""Tests for the append-only audit repository."""
from sqlalchemy.orm import Session

from noetarch.modules.audit.repository import AuditRepository


def _append(repo: AuditRepository, action: str, to_status: str) -> None:
    repo.append(
        entity_type="decision",
        entity_id="dec-001",
        action=action,
        actor="local-user",
        from_status="pending",
        to_status=to_status,
        request_id="req-1",
        payload_hash="abc123",
    )


def test_append_then_list_returns_entry(fresh_db_session: Session) -> None:
    repo = AuditRepository(fresh_db_session)
    _append(repo, "approve", "approved")
    fresh_db_session.commit()

    entries = repo.list_for_entity("decision", "dec-001")
    assert len(entries) == 1
    assert entries[0].action == "approve"
    assert entries[0].from_status == "pending"
    assert entries[0].to_status == "approved"
    assert entries[0].actor == "local-user"
    assert entries[0].created_at is not None


def test_list_is_scoped_to_entity(fresh_db_session: Session) -> None:
    repo = AuditRepository(fresh_db_session)
    _append(repo, "approve", "approved")
    fresh_db_session.commit()
    assert repo.list_for_entity("decision", "dec-002") == []
    assert repo.list_for_entity("recipe", "dec-001") == []


def test_repository_is_append_only() -> None:
    # The audit repository must expose no update/delete surface.
    assert not hasattr(AuditRepository, "update")
    assert not hasattr(AuditRepository, "delete")
    assert not hasattr(AuditRepository, "remove")
    public = {name for name in dir(AuditRepository) if not name.startswith("_")}
    assert public == {"append", "list_for_entity"}
