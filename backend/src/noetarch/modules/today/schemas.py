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

    @classmethod
    def empty(cls) -> "TodayData":
        """Well-formed empty snapshot for an unseeded ("real mode") database.

        Every field is present and correctly typed; nested objects carry blank
        defaults and the lists are empty. The frontend detects this shape and renders
        an intentional empty state instead of blank content.
        """
        return cls(
            project="",
            question="",
            waiting=TodayWaiting(title="", detail="", next=""),
            run=TodayRun(title="", meta="", current="", progress=0, kpis=[]),
            failure=TodayFailure(title="", body=""),
            finished=[],
            sources=[],
            files=[],
        )
