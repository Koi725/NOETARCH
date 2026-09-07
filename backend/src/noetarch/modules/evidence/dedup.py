"""Merge + deduplicate retrieved papers across sources.

The same paper often appears in both OpenAlex and Crossref, and co-published consensus
statements (e.g. the ADA/EASD reports carried by two journals) appear twice with different
DOIs. Collapsing them is what makes "N of M sources agree" meaningful.

Two papers are the same when:
  - their DOIs match exactly (after normalisation), OR
  - their normalised titles are near-identical (token-set Jaccard over the threshold, with a
    sequence-ratio backstop) and their years are compatible.

Merging keeps the richer record (longer abstract, present DOI) and records how many distinct
sources contained the paper (``agreementCount``) out of how many were searched
(``totalSources``). All values are derived locally from already-fetched data; nothing here
touches the network or executes retrieved text.
"""
import difflib
import re
from dataclasses import dataclass, field

from noetarch.modules.evidence.schemas import EvidenceRecord

_TITLE_JACCARD_THRESHOLD = 0.82
_TITLE_RATIO_THRESHOLD = 0.90
_WORD = re.compile(r"[a-z0-9]+")
_STOPWORDS = frozenset(
    {
        "a", "an", "the", "and", "or", "of", "for", "in", "on", "to", "with", "by", "from",
        "at", "as", "is", "are", "be", "study", "trial", "randomized", "randomised",
        "systematic", "review", "meta", "analysis", "report", "consensus",
    }
)


@dataclass
class RetrievedPaper:
    """One candidate: its evidence record, reconstructed abstract, and (later) relevance."""

    record: EvidenceRecord
    abstract: str
    relevance: float = 0.0
    _source_names: set[str] = field(default_factory=set)


def _title_tokens(title: str) -> frozenset[str]:
    return frozenset(w for w in _WORD.findall(title.lower()) if w not in _STOPWORDS)


def _normalised_title(title: str) -> str:
    return " ".join(_WORD.findall(title.lower()))


def _jaccard(a: frozenset[str], b: frozenset[str]) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


def _years_compatible(a: int, b: int) -> bool:
    if a <= 0 or b <= 0:
        return True  # unknown year on either side → don't block a title match
    return abs(a - b) <= 1


def _source_names_of(record: EvidenceRecord) -> set[str]:
    return {s.name for s in record.sources if s.found}


def _merge_into(keeper: RetrievedPaper, other: RetrievedPaper) -> None:
    """Fold ``other`` into ``keeper``: richer abstract/DOI/metadata, union of sources."""
    keeper._source_names |= other._source_names
    if len(other.abstract) > len(keeper.abstract):
        keeper.abstract = other.abstract
    rec = keeper.record
    other_rec = other.record
    if rec.doi is None and other_rec.doi is not None:
        rec.doi = other_rec.doi
        rec.status = "checked"
        rec.missingDoi = False
    if rec.journal in ("", "Unknown source") and other_rec.journal not in ("", "Unknown source"):
        rec.journal = other_rec.journal
    if rec.year <= 0 < other_rec.year:
        rec.year = other_rec.year
    # Union the per-source provenance rows so both origins remain visible.
    existing_notes = {s.note for s in rec.sources}
    for src in other_rec.sources:
        if src.note not in existing_notes:
            rec.sources.append(src)


def merge_and_dedup(
    papers: list[RetrievedPaper], *, sources_queried: int
) -> tuple[list[RetrievedPaper], int]:
    """Collapse duplicates. Returns (deduped papers, number collapsed)."""
    kept: list[RetrievedPaper] = []
    kept_tokens: list[frozenset[str]] = []
    doi_index: dict[str, RetrievedPaper] = {}
    collapsed = 0

    for paper in papers:
        if not paper._source_names:
            paper._source_names = _source_names_of(paper.record) or {paper.record.source}
        doi = paper.record.doi.lower() if paper.record.doi else None

        if doi is not None and doi in doi_index:
            _merge_into(doi_index[doi], paper)
            collapsed += 1
            continue

        tokens = _title_tokens(paper.record.title)
        match: RetrievedPaper | None = None
        for existing, existing_tokens in zip(kept, kept_tokens, strict=True):
            if not _years_compatible(paper.record.year, existing.record.year):
                continue
            if _jaccard(tokens, existing_tokens) >= _TITLE_JACCARD_THRESHOLD or (
                difflib.SequenceMatcher(
                    None,
                    _normalised_title(paper.record.title),
                    _normalised_title(existing.record.title),
                ).ratio()
                >= _TITLE_RATIO_THRESHOLD
            ):
                match = existing
                break

        if match is not None:
            _merge_into(match, paper)
            if doi is not None:
                doi_index.setdefault(doi, match)
            collapsed += 1
            continue

        kept.append(paper)
        kept_tokens.append(tokens)
        if doi is not None:
            doi_index[doi] = paper

    for paper in kept:
        agreement = len(paper._source_names)
        paper.record.agreementCount = agreement
        paper.record.totalSources = max(sources_queried, agreement, 1)

    return kept, collapsed
