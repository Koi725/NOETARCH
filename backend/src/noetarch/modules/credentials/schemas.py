"""Request/response schemas for the BYOK credential surface.

The response shape is write-only by design: it returns a MASKED key (``sk-…last4``) and
never the plaintext. The plaintext only ever travels inbound on the set/rotate request.
"""
from pydantic import BaseModel, Field


class CredentialUpsertRequest(BaseModel):
    """Body for PUT (set / rotate) a provider key."""

    api_key: str = Field(min_length=8, max_length=512)
    enabled: bool = True
    daily_budget: float | None = Field(default=None, ge=0)


class CredentialPatchRequest(BaseModel):
    """Body for PATCH — toggle enable / change budget WITHOUT re-sending the key."""

    enabled: bool | None = None
    daily_budget: float | None = Field(default=None, ge=0)


class CredentialStatus(BaseModel):
    """Masked, non-secret view of a provider credential."""

    provider: str
    configured: bool
    masked: str | None = None  # "sk-…last4" when configured, else None
    enabled: bool = False
    dailyBudget: float | None = None  # noqa: N815
    updatedAt: str | None = None  # noqa: N815
