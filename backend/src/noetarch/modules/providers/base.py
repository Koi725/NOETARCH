"""Provider-neutral LLM interface.

A provider implements a single generic ``complete()`` primitive. Higher-level helpers
(e.g. ``screen_abstract``) are built on top of it in :mod:`screening`, so adding a new
provider (OpenAI, a local model, …) only requires implementing ``complete()`` — see
:mod:`factory` for the documented extension point.

All model output is treated as UNTRUSTED: it is parsed against a strict schema and stored
as a provenance-tagged claim; it never drives a tool call or any side effect.
"""
from dataclasses import dataclass
from typing import Literal, Protocol, runtime_checkable

ScreeningDecision = Literal["include", "exclude", "uncertain"]


@dataclass(frozen=True)
class CompletionResult:
    """One model completion plus token accounting for budget tracking."""

    text: str
    input_tokens: int
    output_tokens: int


@dataclass(frozen=True)
class ScreeningResult:
    """Parsed, validated screening output. ``off_schema`` flags non-conforming output.

    Off-schema output is never obeyed: it is coerced to the safe ``uncertain`` default and
    flagged for human review. ``raw`` is a truncated copy of the model text for provenance.
    """

    decision: ScreeningDecision
    reason: str
    off_schema: bool
    input_tokens: int
    output_tokens: int
    raw: str


@runtime_checkable
class CompletionProvider(Protocol):
    """Minimal provider contract: a single text completion."""

    model: str

    def complete(self, *, system: str, user: str, max_tokens: int) -> CompletionResult: ...
