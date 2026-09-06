"""ModelsPolicy router — GET /api/v1/models-policy/providers (list) and /{provider_id}.

Only the provider list is backend-backed; the routing option/label constants are UI
display config and remain on the frontend (no endpoint).

Security controls:
  - provider_id validated by regex: ^[a-z0-9][a-z0-9_-]{0,62}$. Rejects uppercase,
    path separators, dots, null bytes, and over-length values.
  - 404 on unknown id; structured error via the app-level exception handler.
  - Enable/disable, cost-limit, routing, and approval changes are NOT exposed as
    endpoints — those actions stay local/simulated in the frontend. No mutation
    endpoints in this milestone. No credential/secret fields are served.
  - No internal model fields, stack traces, or seed details in any response.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
"""
from fastapi import APIRouter, HTTPException, Path

from noetarch.modules.models_policy.repository import ModelsPolicyRepository
from noetarch.modules.models_policy.schemas import PolicyProvider
from noetarch.modules.models_policy.service import ModelsPolicyService

router = APIRouter(tags=["models-policy"])

_service = ModelsPolicyService(ModelsPolicyRepository())

_ID_PATTERN = r"^[a-z0-9][a-z0-9_-]{0,62}$"


@router.get("/providers", response_model=list[PolicyProvider])
def list_providers() -> list[PolicyProvider]:
    """List all configured AI providers and their policy settings."""
    return _service.list_providers()


@router.get("/providers/{provider_id}", response_model=PolicyProvider)
def get_provider(
    provider_id: str = Path(
        ...,
        min_length=1,
        max_length=63,
        pattern=_ID_PATTERN,
        description="Provider ID. Lowercase alphanumerics, hyphen, underscore.",
    ),
) -> PolicyProvider:
    """Retrieve a single provider policy by ID. Returns 404 if not found."""
    provider = _service.get_provider(provider_id)
    if provider is None:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not found.")
    return provider
