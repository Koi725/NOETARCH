"""Pydantic v2 response schemas for the Decisions surface.

Mirrors frontend/src/contracts/decision.ts exactly. Response-only.
camelCase field names (rejectedAt) match the TypeScript contract.
"""
from typing import Literal

from pydantic import BaseModel

DecisionRisk = Literal["high", "medium", "low"]
DecisionType = Literal["cloud-egress", "local-file", "workflow-change"]
DecisionStatus = Literal["pending", "approved", "rejected", "alternative"]


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
    rejectedAt: str | None = None  # noqa: N815
