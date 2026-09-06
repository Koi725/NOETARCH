"""Pydantic v2 response schemas for the LiveRun surface.

Mirrors the LiveRun types in frontend/src/contracts/run.ts exactly.
camelCase field names match the TypeScript contract. Response-only.
"""
from typing import Literal

from pydantic import BaseModel

StepState = Literal["done", "partial", "running", "waiting", "queued", "blocked"]
EventKind = Literal["system", "model"]
LiveRunDecisionKind = Literal["pending", "approved", "skipped"]
KPITone = Literal["warn", "ok", "bad"]


class RunMeta(BaseModel):
    runId: str  # noqa: N815
    title: str
    started: str
    elapsed: str


class WorkflowStep(BaseModel):
    index: int
    label: str
    state: StepState
    note: str | None = None


class RunKPI(BaseModel):
    label: str
    value: str
    tone: KPITone | None = None


class RunEvent(BaseModel):
    id: str
    time: str
    message: str
    kind: EventKind


class LiveRunDecision(BaseModel):
    id: str
    description: str
    kind: LiveRunDecisionKind


class LiveRunEvidenceCard(BaseModel):
    id: str
    title: str
    doi: str
    source: str
    verifiedBy: str  # noqa: N815


class StepInspector(BaseModel):
    stepIndex: int  # noqa: N815
    label: str
    method: str
    locality: str
    status: str
    input: str
    outputSoFar: str  # noqa: N815


class LiveRunData(BaseModel):
    meta: RunMeta
    steps: list[WorkflowStep]
    stepInspector: StepInspector  # noqa: N815
    kpis: list[RunKPI]
    events: list[RunEvent]
    decisions: list[LiveRunDecision]
    evidenceCards: list[LiveRunEvidenceCard]  # noqa: N815
