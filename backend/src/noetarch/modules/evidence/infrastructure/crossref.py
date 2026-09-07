"""Crossref provider adapter — the second retrieval source, merged with OpenAlex.

Mirrors the OpenAlex adapter's guarantees: a query STRING flows in as the
``query.bibliographic`` param (never a raw URL); the response is validated against strict
Pydantic models with ``extra="ignore"``; all retrieved text is untrusted data — it is only
cleaned and truncated, then stored via parameterized DB writes, never executed.

Crossref returns abstracts as JATS XML (e.g. ``<jats:p>…</jats:p>``); tags are stripped and
entities unescaped before the text is used. Verified against the live ``api.crossref.org``
``/works`` endpoint (fields: DOI, title[], abstract, author[given/family], published
date-parts, container-title[], type, is-referenced-by-count).
"""
import html
import re
from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field

from noetarch.core.egress import EgressClient
from noetarch.modules.evidence.schemas import EvidenceRecord, EvidenceSource

CROSSREF_HOST = "api.crossref.org"
CROSSREF_PATH = "/works"
RANKED_ROWS = 25
MAX_TITLE = 500
MAX_AUTHORS = 500
MAX_JOURNAL = 300
MAX_ABSTRACT = 8000
_ID_SANITIZE = re.compile(r"[^a-z0-9]+")
_JATS_TAG = re.compile(r"<[^>]+>")


def _sanitise_query(value: str) -> str:
    """Collapse whitespace; the value only ever travels as a url-encoded query param."""
    return " ".join(value.split())


def _strip_jats(raw: str | None) -> str:
    if not raw:
        return ""
    text = _JATS_TAG.sub(" ", raw)
    text = html.unescape(text)
    return " ".join(text.split())[:MAX_ABSTRACT]


class _CrossrefAuthor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    given: str | None = None
    family: str | None = None


class _CrossrefDate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    date_parts: list[list[int]] | None = Field(default=None, alias="date-parts")


class CrossrefWork(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    doi: str | None = Field(default=None, alias="DOI")
    title: list[str] = Field(default_factory=list)
    abstract: str | None = None
    author: list[_CrossrefAuthor] = Field(default_factory=list)
    published: _CrossrefDate | None = None
    published_print: _CrossrefDate | None = Field(default=None, alias="published-print")
    published_online: _CrossrefDate | None = Field(default=None, alias="published-online")
    container_title: list[str] = Field(default_factory=list, alias="container-title")
    type: str | None = None


class _CrossrefMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: list[CrossrefWork] = Field(default_factory=list)


class CrossrefResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message: _CrossrefMessage | None = None


def _clean_doi(raw: str | None) -> str | None:
    if not raw:
        return None
    return raw.strip().lower() or None


def _record_id(doi: str | None) -> str:
    seed = (doi or "").rstrip("/").split("/")[-1]
    slug = _ID_SANITIZE.sub("-", seed.lower()).strip("-")
    if not slug:
        slug = "unknown"
    return f"cr-{slug}"[:63]


def _year(work: CrossrefWork) -> int:
    for date in (work.published, work.published_print, work.published_online):
        if date is not None and date.date_parts:
            first = date.date_parts[0]
            if first and isinstance(first[0], int):
                return first[0]
    return 0


class CrossrefProvider:
    """Fetches works from Crossref through the guarded egress client only."""

    def __init__(self, egress: EgressClient, *, contact_email: str = "") -> None:
        self._egress = egress
        self._contact_email = contact_email

    def search_ranked(
        self,
        query: str,
        *,
        year_from: int | None = None,
        year_to: int | None = None,
        rows: int = RANKED_ROWS,
    ) -> list[tuple[EvidenceRecord, str]]:
        """Bibliographic search restricted to journal articles that have an abstract.

        Verified against the live Crossref ``/works`` API. Returns (record, abstract) pairs.
        """
        term = _sanitise_query(query)
        if not term:
            return []
        filters = ["type:journal-article", "has-abstract:true"]
        if year_from is not None:
            filters.append(f"from-pub-date:{year_from:04d}-01-01")
        if year_to is not None:
            filters.append(f"until-pub-date:{year_to:04d}-12-31")
        params: dict[str, str] = {
            "query.bibliographic": term,
            "filter": ",".join(filters),
            "rows": str(rows),
            "select": "DOI,title,abstract,author,published,container-title,type",
        }
        if self._contact_email:
            params["mailto"] = self._contact_email

        raw = self._egress.get_json(host=CROSSREF_HOST, path=CROSSREF_PATH, params=params)
        parsed = CrossrefResponse.model_validate(raw)
        works = parsed.message.items if parsed.message is not None else []
        retrieved_at = datetime.now(tz=UTC).isoformat()
        out: list[tuple[EvidenceRecord, str]] = []
        for work in works:
            record, abstract = self._to_record(work, retrieved_at)
            out.append((record, abstract))
        return out

    @staticmethod
    def _to_record(work: CrossrefWork, retrieved_at: str) -> tuple[EvidenceRecord, str]:
        doi = _clean_doi(work.doi)
        title = (work.title[0] if work.title else "Untitled")[:MAX_TITLE]
        authors = ", ".join(
            " ".join(part for part in (a.given, a.family) if part)
            for a in work.author
            if a.given or a.family
        )[:MAX_AUTHORS] or "Unknown"
        journal = (work.container_title[0] if work.container_title else "Unknown source")[
            :MAX_JOURNAL
        ]
        abstract = _strip_jats(work.abstract)
        record = EvidenceRecord(
            id=_record_id(doi),
            title=title,
            authors=authors,
            year=_year(work),
            journal=journal,
            doi=doi,
            status="checked" if doi else "cannot-check",
            sources=[EvidenceSource(name="Crossref", found=True, note="Retrieved from Crossref")],
            provenance=[
                f"Retrieved from Crossref on {retrieved_at}",
                f"DOI: {doi}" if doi else "No DOI present in the Crossref record",
            ],
            agreementCount=1 if doi else 0,
            totalSources=1,
            missingDoi=doi is None,
            source="crossref",
            retrievedAt=retrieved_at,
        )
        return record, abstract
