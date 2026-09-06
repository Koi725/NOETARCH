"""Pydantic v2 response schemas for the Today surface.

Mirrors frontend/src/contracts/today.ts exactly. Tuple fields serialize to
JSON arrays, matching the TypeScript readonly-tuple contract.
Response-only; no internal models exposed.
"""
from pydantic import BaseModel

# Tuple aliases mirror the TS readonly-tuple contract (serialize as JSON arrays).
TodayKPITuple = tuple[str, str, str]
TodaySourceTuple = tuple[str, str, str]
TodayFileTuple = tuple[str, str, bool]
TodayFinishedTuple = tuple[str, str, str]


class TodayWaiting(BaseModel):
    title: str
    detail: str
    next: str


class TodayRun(BaseModel):
    title: str
    meta: str
    current: str
    progress: int
    kpis: list[TodayKPITuple]


class TodayFailure(BaseModel):
    title: str
    body: str


class TodayData(BaseModel):
    project: str
    question: str
    waiting: TodayWaiting
    run: TodayRun
    failure: TodayFailure
    finished: list[TodayFinishedTuple]
    sources: list[TodaySourceTuple]
    files: list[TodayFileTuple]
