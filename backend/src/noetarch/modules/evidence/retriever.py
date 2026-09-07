"""Retriever: turn a query plan into a ranked, deduplicated candidate set.

Orchestrates the WS1 pipeline (the model-driven planning step happens in the executor and
is passed in as a ``QueryPlan``):

    plan.queries → OpenAlex + Crossref (title/abstract-scoped) → merge/dedup → rank → top-N

Every outbound call goes through the guarded egress client inside each source adapter; no
network I/O happens here directly. A source that fails on a query is skipped for that query
(the other source still contributes) so one flaky provider never aborts a run.
"""
from collections.abc import Sequence
from typing import Protocol

from noetarch.core.egress import EgressError
from noetarch.modules.evidence.dedup import RetrievedPaper, merge_and_dedup
from noetarch.modules.evidence.query_planning import QueryPlan
from noetarch.modules.evidence.ranking import rank_papers
from noetarch.modules.evidence.schemas import EvidenceRecord


class RankedSource(Protocol):
    """A retrieval source that supports a targeted, year-bounded search."""

    def search_ranked(
        self,
        query: str,
        *,
        year_from: int | None = None,
        year_to: int | None = None,
    ) -> list[tuple[EvidenceRecord, str]]: ...


class Retriever:
    def __init__(self, sources: Sequence[RankedSource]) -> None:
        # At least one source (OpenAlex). Crossref is added when available.
        self._sources = list(sources)

    def retrieve(
        self,
        plan: QueryPlan,
        *,
        question: str,
        year_from: int | None,
        year_to: int | None,
        max_papers: int,
    ) -> tuple[list[RetrievedPaper], int]:
        """Return (ranked top-N papers, number of duplicates collapsed)."""
        collected: list[RetrievedPaper] = []
        for source in self._sources:
            for query in plan.queries:
                try:
                    pairs = source.search_ranked(
                        query, year_from=year_from, year_to=year_to
                    )
                except EgressError:
                    continue  # degrade: skip this query for this source
                for record, abstract in pairs:
                    collected.append(RetrievedPaper(record=record, abstract=abstract))

        merged, collapsed = merge_and_dedup(collected, sources_queried=len(self._sources))
        ranked = rank_papers(merged, question=question, concepts=plan.concepts)
        return ranked[:max_papers], collapsed
