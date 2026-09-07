"""Credentials router — write-only BYOK key management under Models & Policy.

Routes (mounted at /api/v1/models-policy/credentials):
  - GET    /{provider}  → masked status (never plaintext)
  - PUT    /{provider}  → set / rotate the key
  - PATCH  /{provider}  → toggle enable / change budget (no key re-send)
  - DELETE /{provider}  → remove the key

Security controls:
  - provider validated by regex ^[a-z][a-z0-9_-]{0,62}$ (no path separators/uppercase/dots).
  - The plaintext key is accepted only in the PUT body and is never returned or logged.
  - CORS allowlist + 1 MiB body cap enforced at the app level.
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.credentials.repository import CredentialRepository
from noetarch.modules.credentials.schemas import (
    CredentialPatchRequest,
    CredentialStatus,
    CredentialUpsertRequest,
)
from noetarch.modules.credentials.service import CredentialService

router = APIRouter(tags=["credentials"])

_PROVIDER_PATTERN = r"^[a-z][a-z0-9_-]{0,62}$"


def _service(session: Session) -> CredentialService:
    return CredentialService(session, CredentialRepository(session), AuditRepository(session))


def _provider_path() -> Any:
    return Path(
        ...,
        min_length=1,
        max_length=63,
        pattern=_PROVIDER_PATTERN,
        description="Provider id (e.g. 'anthropic'). Lowercase alphanumerics, hyphen, underscore.",
    )


@router.get("/{provider}", response_model=CredentialStatus)
def get_status(
    provider: str = _provider_path(),
    session: Session = Depends(get_session),
) -> CredentialStatus:
    return _service(session).status(provider)


@router.put("/{provider}", response_model=CredentialStatus)
def set_key(
    request: Request,
    body: CredentialUpsertRequest,
    provider: str = _provider_path(),
    session: Session = Depends(get_session),
) -> CredentialStatus:
    request_id = getattr(request.state, "request_id", None)
    return _service(session).set_key(
        provider=provider,
        api_key=body.api_key,
        enabled=body.enabled,
        daily_budget=body.daily_budget,
        request_id=request_id,
    )


@router.patch("/{provider}", response_model=CredentialStatus)
def patch_credential(
    request: Request,
    body: CredentialPatchRequest,
    provider: str = _provider_path(),
    session: Session = Depends(get_session),
) -> CredentialStatus:
    request_id = getattr(request.state, "request_id", None)
    status = _service(session).patch(
        provider=provider,
        enabled=body.enabled,
        daily_budget=body.daily_budget,
        request_id=request_id,
    )
    if status is None:
        raise HTTPException(status_code=404, detail=f"No credential configured for '{provider}'.")
    return status


@router.delete("/{provider}", response_model=CredentialStatus)
def delete_credential(
    request: Request,
    provider: str = _provider_path(),
    session: Session = Depends(get_session),
) -> CredentialStatus:
    request_id = getattr(request.state, "request_id", None)
    deleted = _service(session).delete(provider=provider, request_id=request_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"No credential configured for '{provider}'.")
    return CredentialStatus(provider=provider, configured=False)
