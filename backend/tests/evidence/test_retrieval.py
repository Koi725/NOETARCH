"""Merge/dedup + ranking + retriever orchestration (no network)."""
from noetarch.modules.evidence.dedup import RetrievedPaper, merge_and_dedup
from noetarch.modules.evidence.query_planning import QueryPlan
from noetarch.modules.evidence.ranking import rank_papers
from noetarch.modules.evidence.retriever import Retriever
from noetarch.modules.evidence.schemas import EvidenceRecord, EvidenceSource


def _rec(rid: str, title: str, *, doi: str | None, source: str, year: int = 2020) -> EvidenceRecord:
    name = "OpenAlex" if source == "openalex" else "Crossref"
    return EvidenceRecord(
        id=rid,
        title=title,
        authors="A",
        year=year,
        journal="J",
        doi=doi,
        status="checked" if doi else "cannot-check",
        sources=[EvidenceSource(name=name, found=True, note=f"from {name}")],
        provenance=[],
        agreementCount=1,
        totalSources=1,
        source=source,  # type: ignore[arg-type]
    )


def _paper(rec: EvidenceRecord, abstract: str = "") -> RetrievedPaper:
    return RetrievedPaper(record=rec, abstract=abstract)


def test_dedup_collapses_same_doi_across_sources() -> None:
    papers = [
        _paper(_rec("oa-1", "Study of fasting", doi="10.1/x", source="openalex")),
        _paper(_rec("cr-1", "Study of fasting", doi="10.1/X", source="crossref")),  # same DOI
    ]
    merged, collapsed = merge_and_dedup(papers, sources_queried=2)
    assert len(merged) == 1 and collapsed == 1
    # Both sources are now credited: "2 of 2 sources agree".
    assert merged[0].record.agreementCount == 2
    assert merged[0].record.totalSources == 2


def test_dedup_collapses_near_duplicate_titles_with_different_dois() -> None:
    # The ADA/EASD consensus report, co-published in two journals with two DOIs.
    title = (
        "Management of Hyperglycemia in Type 2 Diabetes 2018 A Consensus Report by the "
        "American Diabetes Association and the European Association for the Study of Diabetes"
    )
    papers = [
        _paper(_rec("oa-ada", title, doi="10.2337/dci18-0033", source="openalex", year=2018)),
        _paper(_rec("cr-easd", title + ".", doi="10.1007/s00125-018-4729-5",
                    source="crossref", year=2018)),
    ]
    merged, collapsed = merge_and_dedup(papers, sources_queried=2)
    assert len(merged) == 1 and collapsed == 1
    assert merged[0].record.agreementCount == 2


def test_dedup_keeps_distinct_papers() -> None:
    papers = [
        _paper(_rec("oa-1", "Fasting and glucose control", doi="10.1/a", source="openalex")),
        _paper(_rec("oa-2", "Sleep and cognition in adults", doi="10.1/b", source="openalex")),
    ]
    merged, collapsed = merge_and_dedup(papers, sources_queried=2)
    assert len(merged) == 2 and collapsed == 0


def test_ranking_orders_on_topic_above_off_topic() -> None:
    on = _paper(
        _rec("oa-1", "Intermittent fasting lowers HbA1c", doi="10.1/a", source="openalex"),
        "A randomized trial of intermittent fasting on HbA1c and glucose in adults.",
    )
    off = _paper(
        _rec("oa-2", "Volcanic activity in the Pacific", doi="10.1/b", source="openalex"),
        "Seismic measurements of tectonic plates.",
    )
    ranked = rank_papers(
        [off, on],
        question="Does intermittent fasting lower HbA1c?",
        concepts=["intermittent fasting", "HbA1c"],
    )
    assert ranked[0].record.id == "oa-1"
    assert ranked[0].relevance > ranked[1].relevance


class _FakeSource:
    def __init__(self, pairs: list[tuple[EvidenceRecord, str]]) -> None:
        self._pairs = pairs

    def search_ranked(
        self, query: str, *, year_from: int | None = None, year_to: int | None = None
    ) -> list[tuple[EvidenceRecord, str]]:
        return list(self._pairs)


def test_retriever_merges_two_sources_and_ranks_top_n() -> None:
    shared_doi = "10.1/shared"
    oa = _FakeSource(
        [
            (_rec("oa-1", "Intermittent fasting and HbA1c", doi=shared_doi, source="openalex"),
             "fasting reduces HbA1c"),
            (_rec("oa-2", "Unrelated topic", doi="10.1/oa2", source="openalex"), "noise"),
        ]
    )
    cr = _FakeSource(
        [
            (_rec("cr-1", "Intermittent fasting and HbA1c", doi=shared_doi, source="crossref"),
             "fasting reduces HbA1c"),  # duplicate of oa-1 by DOI
        ]
    )
    retriever = Retriever([oa, cr])
    plan = QueryPlan(queries=["fasting HbA1c"], concepts=["intermittent fasting", "HbA1c"])
    papers, collapsed = retriever.retrieve(
        plan, question="does fasting lower HbA1c?", year_from=None, year_to=None, max_papers=10
    )
    ids = [p.record.id for p in papers]
    assert collapsed == 1  # the shared-DOI paper collapsed across sources
    assert len(papers) == 2
    # The on-topic, two-source paper ranks first.
    assert papers[0].record.title.startswith("Intermittent fasting")
    assert papers[0].record.agreementCount == 2
    assert "oa-2" in ids
