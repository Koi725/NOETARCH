"""Pydantic v2 schemas for the Decisions surface.

Response schemas mirror frontend/src/contracts/decision.ts (camelCase). M8 adds the
persisted-write state machine: ``version`` (optimistic lock), ``resolvedAt`` and
``resolutionAction``, plus the mutation request body and the audit-entry response.
"""
from typing import Literal

from pydantic import BaseModel, Field

DecisionRisk = Literal["high", "medium", "low"]
DecisionType = Literal["cloud-egress", "local-file", "workflow-change"]
DecisionStatus = Literal["pending", "approved", "rejected", "local_alternative"]

# The action a client may request on a pending decision.
DecisionAction = Literal["approve", "reject", "use_local_alternative"]

# Which resolved status each action produces.
ACTION_TO_STATUS: dict[DecisionAction, DecisionStatus] = {
    "approve": "approved",
    "reject": "rejected",
    "use_local_alternative": "local_alternative",
}


class Decision(BaseModel):
    id: str
    title: str
    type: DecisionType
    risk: DecisionRisk
    payload: str | None = None
    cost: str
    time: str
    reversible: bool
    detail: str
    alternatives: list[str]
    status: DecisionStatus
    rejectedAt: str | None = None  # noqa: N815  (legacy seed field)
    version: int = 1
    resolvedAt: str | None = None  # noqa: N815
    resolutionAction: DecisionAction | None = None  # noqa: N815


class DecisionActionRequest(BaseModel):
    """Body for POST /api/v1/decisions/{id}/action.

    ``expected_version`` powers optimistic concurrency: it must equal the decision's
    current version or the write is rejected with 409.
    """

    action: DecisionAction
    expected_version: int = Field(ge=0)


class AuditEntry(BaseModel):
    """A single append-only audit-log record (read-only response shape)."""

    id: str
    entityType: str  # noqa: N815
    entityId: str  # noqa: N815
    action: str
    actor: str
    fromStatus: str | None = None  # noqa: N815
    toStatus: str | None = None  # noqa: N815
    requestId: str | None = None  # noqa: N815
    createdAt: str  # noqa: N815  (ISO-8601 UTC)
    payloadHash: str | None = None  # noqa: N815
