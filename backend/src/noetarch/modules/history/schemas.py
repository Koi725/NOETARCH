"""Pydantic v2 response schemas for the History surface.

Mirrors the HistoryRun type in frontend/src/contracts/run.ts exactly. Response-only.
camelCase field names match the TypeScript contract.
"""
from typing import Literal

from pydantic import BaseModel

RunStatus = Literal["running", "complete", "interrupted", "failed", "partial"]


class HistoryRun(BaseModel):
    id: str
    status: RunStatus
    title: str
    recipe: str
    started: str
    stoppedAt: str | None = None  # noqa: N815
    duration: str
    cost: str
    papers: int
    providers: list[str]
    notes: str | None = None
    stopReason: str | None = None  # noqa: N815
    failureReason: str | None = None  # noqa: N815
