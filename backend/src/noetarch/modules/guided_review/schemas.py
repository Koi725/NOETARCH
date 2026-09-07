"""Pydantic v2 response schemas for the GuidedReview surface.

Mirrors frontend/src/contracts/guided-review.ts exactly. Response-only.
camelCase field names match the TypeScript contract.
"""
from typing import Literal

from pydantic import BaseModel

# ReviewDecision excludes null on the wire; history entries carry the four concrete values.
HistoryDecision = Literal["include", "exclude", "uncertain", "needs-human-review"]
InitialStatus = Literal["needs-human-review"] | None


class ReviewPaper(BaseModel):
    id: str
    index: int
    title: str
    authors: str
    year: int
    journal: str
    doi: str
    abstract: str
    initialStatus: InitialStatus = None  # noqa: N815
    initialStatusNote: str | None = None  # noqa: N815


class ExcludeReason(BaseModel):
    id: str
    label: str


class ReviewHistoryEntry(BaseModel):
    id: str
    paperTitle: str  # noqa: N815
    decision: HistoryDecision
    reasons: list[str]


class ReviewProgress(BaseModel):
    reviewed: int
    total: int
    remaining: int


class GuidedReviewData(BaseModel):
    project: str
    progress: ReviewProgress
    currentPaper: ReviewPaper  # noqa: N815
    nextPapers: list[ReviewPaper]  # noqa: N815
    excludeReasons: list[ExcludeReason]  # noqa: N815
    previousDecisions: list[ReviewHistoryEntry]  # noqa: N815

    @classmethod
    def empty(cls) -> "GuidedReviewData":
        """Well-formed empty state for an unseeded ("real mode") database.

        Every field is present and correctly typed; the current paper carries blank
        defaults and the lists are empty. The frontend detects this shape (blank
        current-paper id / zero total) and renders an intentional empty state.
        """
        return cls(
            project="",
            progress=ReviewProgress(reviewed=0, total=0, remaining=0),
            currentPaper=ReviewPaper(
                id="",
                index=0,
                title="",
                authors="",
                year=0,
                journal="",
                doi="",
                abstract="",
                initialStatus=None,
                initialStatusNote=None,
            ),
            nextPapers=[],
            excludeReasons=[],
            previousDecisions=[],
        )
