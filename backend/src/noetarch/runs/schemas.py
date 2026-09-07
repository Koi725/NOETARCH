"""Request/response schemas for the run executor (POST /runs and the CLI)."""
from typing import Literal

from pydantic import BaseModel, Field

# Terminal states. ``halted_budget`` reuses the budget-exhausted concept: the run stopped
# cleanly at the cost cap rather than failing.
RunStatus = Literal[
    "completed",
    "halted_budget",
    "failed",
    "no_provider",
    "external_sources_disabled",
]


class RunRequest(BaseModel):
    """Inputs for a run. Only a query STRING and numeric bounds — no URLs/hosts."""

    question: str = Field(min_length=1, max_length=500)
    year_from: int | None = Field(default=None, ge=1800, le=2100)
    year_to: int | None = Field(default=None, ge=1800, le=2100)
    max_results: int = Field(default=50, ge=1, le=200)
    budget_usd: float | None = Field(default=None, ge=0)


class RunCriteria(BaseModel):
    """PICO-style screening criteria derived for the run (shown in the UI)."""

    population: str = ""
    intervention: str = ""
    comparator: str = ""
    outcome: str = ""
    include: list[str] = Field(default_factory=list)
    exclude: list[str] = Field(default_factory=list)
    offSchema: bool = False  # noqa: N815


class RunSynthesisFinding(BaseModel):
    doi: str
    title: str
    finding: str


class RunSynthesis(BaseModel):
    """Grounded synthesis of the included set. Every cited DOI is in the frozen set."""

    summary: str = ""
    findings: list[RunSynthesisFinding] = Field(default_factory=list)
    grounded: bool = True
    droppedFindings: int = 0  # noqa: N815
    redactedCitations: int = 0  # noqa: N815
    offSchema: bool = False  # noqa: N815


class RunResult(BaseModel):
    id: str
    status: RunStatus
    question: str
    provider: str
    model: str
    frozen: int = 0
    deduplicated: int = 0
    screened: int = 0
    included: int = 0
    excluded: int = 0
    uncertain: int = 0
    offSchema: int = 0  # noqa: N815
    inputTokens: int = 0  # noqa: N815
    outputTokens: int = 0  # noqa: N815
    costUsd: float = 0.0  # noqa: N815
    createdAt: str  # noqa: N815
    finishedAt: str | None = None  # noqa: N815
    elapsedMs: int | None = None  # noqa: N815
    error: str | None = None
    plannedQueries: list[str] = Field(default_factory=list)  # noqa: N815
    criteria: RunCriteria | None = None
    synthesis: RunSynthesis | None = None
