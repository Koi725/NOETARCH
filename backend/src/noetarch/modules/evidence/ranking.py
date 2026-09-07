"""Deterministic lexical relevance ranking of merged papers.

Ranking is intentionally NOT a model call: it is free, reproducible, and adds no
prompt-injection surface (retrieved titles/abstracts never reach a model here — they are
only tokenised and compared to the plan's concepts + question terms). Each paper gets a
relevance score in [0, 1]; higher = more on-topic. This is what turns a broad candidate
pool into a list where the top ``max_papers`` are genuinely about the question.
"""
import re

from noetarch.modules.evidence.dedup import RetrievedPaper

_WORD = re.compile(r"[a-z0-9]+")
_STOPWORDS = frozenset(
    {
        "a", "an", "the", "and", "or", "of", "for", "in", "on", "to", "with", "by", "from",
        "at", "as", "is", "are", "be", "does", "do", "how", "what", "which", "who", "whom",
        "effect", "effects", "impact", "vs", "versus", "between", "among",
    }
)
_TITLE_WEIGHT = 0.6
_ABSTRACT_WEIGHT = 0.4
_PHRASE_TITLE_BONUS = 0.15
_PHRASE_ABSTRACT_BONUS = 0.08
_AGREEMENT_BONUS = 0.05


def _terms(text: str) -> set[str]:
    return {w for w in _WORD.findall(text.lower()) if w not in _STOPWORDS and len(w) > 1}


def _coverage(query_terms: set[str], text_terms: set[str]) -> float:
    if not query_terms:
        return 0.0
    return len(query_terms & text_terms) / len(query_terms)


def _score_one(
    paper: RetrievedPaper, query_terms: set[str], concept_phrases: list[str]
) -> float:
    title = paper.record.title.lower()
    abstract = paper.abstract.lower()
    title_terms = _terms(title)
    abstract_terms = _terms(abstract)

    score = _TITLE_WEIGHT * _coverage(query_terms, title_terms)
    score += _ABSTRACT_WEIGHT * _coverage(query_terms, abstract_terms)

    for phrase in concept_phrases:
        if " " not in phrase:
            continue  # single words already covered by term coverage
        if phrase in title:
            score += _PHRASE_TITLE_BONUS
        elif phrase in abstract:
            score += _PHRASE_ABSTRACT_BONUS

    # Small bump when more than one source independently returned the paper.
    if paper.record.agreementCount > 1:
        score += _AGREEMENT_BONUS

    return max(0.0, min(1.0, score))


def rank_papers(
    papers: list[RetrievedPaper], *, question: str, concepts: list[str]
) -> list[RetrievedPaper]:
    """Score each paper against the question + planned concepts; return sorted (desc)."""
    query_terms = _terms(question)
    for concept in concepts:
        query_terms |= _terms(concept)
    concept_phrases = [c.lower().strip() for c in concepts if c.strip()]

    for paper in papers:
        paper.relevance = round(_score_one(paper, query_terms, concept_phrases), 4)

    # Stable, deterministic order: relevance desc, then source-agreement desc, then id.
    return sorted(
        papers,
        key=lambda p: (-p.relevance, -p.record.agreementCount, p.record.id),
    )
