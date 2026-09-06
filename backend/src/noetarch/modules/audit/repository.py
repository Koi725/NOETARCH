"""Append-only audit repository.

Exposes exactly two operations: ``append`` (insert) and ``list_for_entity`` (read).
There is deliberately no update or delete method — the audit trail is immutable.
The caller owns the transaction boundary, so an audit insert can be committed
atomically together with the state change it records.
"""
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.audit.infrastructure.models import AuditLogORM


class AuditRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

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
        entry = AuditLogORM(
            id=uuid.uuid4().hex,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor=actor,
            from_status=from_status,
            to_status=to_status,
            request_id=request_id,
            payload_hash=payload_hash,
        )
        self._session.add(entry)
        # Flush (not commit) so the row is written inside the caller's transaction;
        # the caller commits it atomically with the state change.
        self._session.flush()
        return entry

    def list_for_entity(self, entity_type: str, entity_id: str) -> list[AuditLogORM]:
        return list(
            self._session.execute(
                select(AuditLogORM)
                .where(
                    AuditLogORM.entity_type == entity_type,
                    AuditLogORM.entity_id == entity_id,
                )
                .order_by(AuditLogORM.created_at, AuditLogORM.id)
            )
            .scalars()
            .all()
        )
