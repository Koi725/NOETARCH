"""Pydantic v2 response schemas for the ModelsPolicy surface.

Mirrors the PolicyProvider type in frontend/src/contracts/models-policy.ts exactly.
Response-only. camelCase field names match the TypeScript contract. The routing
option/label constants stay on the frontend (UI display config) and are not served.
"""
from typing import Literal

from pydantic import BaseModel

ProviderType = Literal["cloud", "local"]
ProviderStatus = Literal["available", "down"]
EgressPolicy = Literal["explicit-approval", "none"]
RoutingPreference = Literal["prefer", "prefer-local-fallback", "allow", "disabled"]


class PolicyProvider(BaseModel):
    id: str
    name: str
    type: ProviderType
    status: ProviderStatus
    statusNote: str | None = None  # noqa: N815
    enabled: bool
    dailyCostLimit: float | None = None  # noqa: N815
    dataRetention: str  # noqa: N815
    egressPolicy: EgressPolicy  # noqa: N815
    capabilities: list[str]
    routingPreference: RoutingPreference  # noqa: N815
    requiresApproval: bool  # noqa: N815
