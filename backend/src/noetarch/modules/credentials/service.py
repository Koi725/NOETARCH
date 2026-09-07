"""Credential service: encrypt/store/mask BYOK provider keys with an atomic audit trail.

Security guarantees:
  - The plaintext key is encrypted (Fernet) before it touches the DB; only ciphertext and
    a masked ``last4`` are persisted.
  - GET returns a MASKED value only (``sk-…last4``); the plaintext is never returned by any
    method reachable from the API. ``get_plaintext`` is internal (provider factory only).
  - The key never enters the audit log: the audit ``payload_hash`` is a hash of
    ``provider|action`` — it contains no key material.
  - Each mutation + its audit row commit in one transaction (append-only audit invariant).
"""
import hashlib
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from noetarch.core.crypto import get_secret_box
from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.credentials.infrastructure.models import ProviderCredentialORM
from noetarch.modules.credentials.repository import CredentialRepository
from noetarch.modules.credentials.schemas import CredentialStatus

ENTITY_TYPE = "credential"
DEFAULT_ACTOR = "local-user"


def _mask(last4: str) -> str:
    return f"sk-…{last4}"


def _audit_hash(provider: str, action: str) -> str:
    # Binds the audit row to the action without storing any key material.
    return hashlib.sha256(f"{provider}|{action}".encode()).hexdigest()


class CredentialService:
    def __init__(
        self, session: Session, repo: CredentialRepository, audit: AuditRepository
    ) -> None:
        self._session = session
        self._repo = repo
        self._audit = audit

    def _now(self) -> str:
        return datetime.now(tz=UTC).isoformat()

    def status(self, provider: str) -> CredentialStatus:
        row = self._repo.get(provider)
        if row is None:
            return CredentialStatus(provider=provider, configured=False)
        return CredentialStatus(
            provider=provider,
            configured=True,
            masked=_mask(row.last4),
            enabled=row.enabled,
            dailyBudget=row.daily_budget,
            updatedAt=row.updated_at,
        )

    def set_key(
        self,
        *,
        provider: str,
        api_key: str,
        enabled: bool = True,
        daily_budget: float | None = None,
        actor: str = DEFAULT_ACTOR,
        request_id: str | None = None,
    ) -> CredentialStatus:
        """Set or rotate the provider key. Encrypts at rest; never logs/returns plaintext."""
        box = get_secret_box()
        ciphertext = box.encrypt(api_key)
        last4 = api_key[-4:]
        now = self._now()
        row = self._repo.get(provider)
        action = "credential.set" if row is None else "credential.rotate"
        if row is None:
            row = ProviderCredentialORM(
                provider=provider,
                ciphertext=ciphertext,
                last4=last4,
                enabled=enabled,
                daily_budget=daily_budget,
                created_at=now,
                updated_at=now,
            )
            self._session.add(row)
        else:
            row.ciphertext = ciphertext
            row.last4 = last4
            row.enabled = enabled
            row.daily_budget = daily_budget
            row.updated_at = now
        self._audit.append(
            entity_type=ENTITY_TYPE,
            entity_id=provider,
            action=action,
            actor=actor,
            from_status=None,
            to_status="enabled" if enabled else "disabled",
            request_id=request_id,
            payload_hash=_audit_hash(provider, action),
        )
        self._session.commit()
        return self.status(provider)

    def patch(
        self,
        *,
        provider: str,
        enabled: bool | None = None,
        daily_budget: float | None = None,
        actor: str = DEFAULT_ACTOR,
        request_id: str | None = None,
    ) -> CredentialStatus | None:
        """Update enable/budget without re-sending the key. None if not configured."""
        row = self._repo.get(provider)
        if row is None:
            return None
        if enabled is not None:
            row.enabled = enabled
        if daily_budget is not None:
            row.daily_budget = daily_budget
        row.updated_at = self._now()
        self._audit.append(
            entity_type=ENTITY_TYPE,
            entity_id=provider,
            action="credential.update",
            actor=actor,
            from_status=None,
            to_status="enabled" if row.enabled else "disabled",
            request_id=request_id,
            payload_hash=_audit_hash(provider, "credential.update"),
        )
        self._session.commit()
        return self.status(provider)

    def delete(
        self,
        *,
        provider: str,
        actor: str = DEFAULT_ACTOR,
        request_id: str | None = None,
    ) -> bool:
        deleted = self._repo.delete(provider)
        if not deleted:
            return False
        self._audit.append(
            entity_type=ENTITY_TYPE,
            entity_id=provider,
            action="credential.delete",
            actor=actor,
            from_status=None,
            to_status="deleted",
            request_id=request_id,
            payload_hash=_audit_hash(provider, "credential.delete"),
        )
        self._session.commit()
        return True

    # ── internal: not exposed through any API route ─────────────────────────────

    def get_plaintext(self, provider: str) -> str | None:
        """Decrypt and return the key for an ENABLED credential (provider factory only)."""
        row = self._repo.get(provider)
        if row is None or not row.enabled:
            return None
        return get_secret_box().decrypt(row.ciphertext)

    def daily_budget(self, provider: str) -> float | None:
        row = self._repo.get(provider)
        return row.daily_budget if row is not None else None
