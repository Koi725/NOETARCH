"""Shared test doubles for the run executor — mocked provider + mocked sources, NO network.

The provider routes by the distinctive system prompt of each pipeline stage (query planning,
criteria derivation, screening, synthesis) so tests are robust to call ordering. Screening
decisions are driven by a marker embedded in the paper's abstract/title, so ranking is free
to reorder papers without breaking assertions.
"""
from noetarch.modules.evidence.schemas import EvidenceRecord
from noetarch.modules.providers.base import CompletionResult

_PLAN = '{"concepts": ["concept one"], "queries": ["planned query"]}'
_CRITERIA = (
    '{"population": "adults", "intervention": "X", "comparator": "placebo", '
    '"outcome": "Y", "include": ["RCTs"], "exclude": ["animal studies"]}'
)


class PhaseProvider:
    """Scripted provider. ``calls`` counts every completion; ``screen_calls`` only screenings."""

    model = "claude-haiku-4-5"

    def __init__(
        self,
        *,
        default_screen: str = '{"decision": "uncertain", "relevance": 0.5, "reason": "d"}',
        synthesis: str = '{"summary": "An overview.", "findings": []}',
        screen_tokens: tuple[int, int] = (1000, 1000),
        other_tokens: tuple[int, int] = (1000, 1000),
    ) -> None:
        self._default_screen = default_screen
        self._synthesis = synthesis
        self._screen_tokens = screen_tokens
        self._other_tokens = other_tokens
        self.calls = 0
        self.screen_calls = 0

    def complete(self, *, system: str, user: str, max_tokens: int) -> CompletionResult:
        self.calls += 1
        other_in, other_out = self._other_tokens
        if "query planner" in system:
            return CompletionResult(text=_PLAN, input_tokens=other_in, output_tokens=other_out)
        if "methodologist" in system:
            return CompletionResult(text=_CRITERIA, input_tokens=other_in, output_tokens=other_out)
        if "evidence synthesist" in system:
            return CompletionResult(
                text=self._synthesis, input_tokens=other_in, output_tokens=other_out
            )
        # Otherwise it's a screening call.
        self.screen_calls += 1
        screen_in, screen_out = self._screen_tokens
        if "MARK_INCLUDE" in user:
            text = '{"decision": "include", "relevance": 0.9, "reason": "on topic"}'
        elif "MARK_EXCLUDE" in user:
            text = '{"decision": "exclude", "relevance": 0.1, "reason": "off topic"}'
        elif "MARK_UNCERTAIN" in user:
            text = '{"decision": "uncertain", "relevance": 0.5, "reason": "unclear"}'
        else:
            text = self._default_screen
        return CompletionResult(text=text, input_tokens=screen_in, output_tokens=screen_out)


class FakeSource:
    """A ranked retrieval source returning canned (record, abstract) pairs — no network."""

    def __init__(self, pairs: list[tuple[EvidenceRecord, str]]) -> None:
        self._pairs = pairs

    def search_ranked(
        self,
        query: str,
        *,
        year_from: int | None = None,
        year_to: int | None = None,
    ) -> list[tuple[EvidenceRecord, str]]:
        return list(self._pairs)


def make_record(i: int, *, doi: str | None = None) -> EvidenceRecord:
    return EvidenceRecord(
        id=f"oa-p{i}",
        title=f"Paper {i}",
        authors="A. Author",
        year=2022,
        journal="Journal",
        doi=doi if doi is not None else f"10.1/p{i}",
        status="checked",
        sources=[],
        provenance=[],
        agreementCount=1,
        totalSources=1,
    )
