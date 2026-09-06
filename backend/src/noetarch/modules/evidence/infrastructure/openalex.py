"""OpenAlex provider adapter.

A query STRING flows in and is sent to OpenAlex as a query parameter (never a raw URL).
The response is validated against strict Pydantic models with ``extra="ignore"`` so
unexpected fields are dropped, then mapped to ``EvidenceRecord``. All retrieved text is
treated as untrusted data: it is only truncated and stored via parameterized DB writes;
it is never executed, evaluated, or fed back as instructions.
"""
import hashlib
import re
from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field

from noetarch.core.egress import EgressClient
from noetarch.modules.evidence.schemas import EvidenceRecord, EvidenceSource

OPENALEX_HOST = "api.openalex.org"
OPENALEX_PATH = "/works"
MAX_RESULTS = 50
MAX_TITLE = 500
MAX_AUTHORS = 500
MAX_JOURNAL = 300
_DOI_PREFIX = re.compile(r"^https?://(dx\.)?doi\.org/", re.IGNORECASE)
_ID_SANITIZE = re.compile(r"[^a-z0-9]+")


class _OpenAlexAuthor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    display_name: str | None = None


class _OpenAlexAuthorship(BaseModel):
    model_config = ConfigDict(extra="ignore")
    author: _OpenAlexAuthor | None = None


class _OpenAlexSource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    display_name: str | None = None


class _OpenAlexLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    source: _OpenAlexSource | None = None


class OpenAlexWork(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str | None = None
    doi: str | None = None
    title: str | None = None
    display_name: str | None = None
    publication_year: int | None = None
    authorships: list[_OpenAlexAuthorship] = Field(default_factory=list)
    primary_location: _OpenAlexLocation | None = None


class OpenAlexResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    results: list[OpenAlexWork] = Field(default_factory=list)


def _clean_doi(raw: str | None) -> str | None:
    if not raw:
        return None
    doi = _DOI_PREFIX.sub("", raw).strip().lower()
    return doi or None


def _record_id(openalex_id: str | None, doi: str | None) -> str:
    seed = openalex_id or doi or ""
    tail = seed.rstrip("/").split("/")[-1] if seed else ""
    slug = _ID_SANITIZE.sub("-", tail.lower()).strip("-")
    if not slug:
        slug = hashlib.sha1((doi or seed or "unknown").encode()).hexdigest()[:16]  # noqa: S324
    return f"oa-{slug}"[:63]


class OpenAlexProvider:
    """Fetches works from OpenAlex through the guarded egress client only."""

    def __init__(self, egress: EgressClient, *, contact_email: str = "") -> None:
        self._egress = egress
        self._contact_email = contact_email

    def search(self, query: str) -> list[EvidenceRecord]:
        params: dict[str, str] = {
            "search": query,  # the query travels as a param; never as host/path/URL
            "per_page": "25",
            "select": "id,doi,title,display_name,publication_year,authorships,primary_location",
        }
        if self._contact_email:
            params["mailto"] = self._contact_email

        raw = self._egress.get_json(host=OPENALEX_HOST, path=OPENALEX_PATH, params=params)
        parsed = OpenAlexResponse.model_validate(raw)  # drops unexpected fields
        retrieved_at = datetime.now(tz=UTC).isoformat()
        return [self._to_record(work, retrieved_at) for work in parsed.results[:MAX_RESULTS]]

    @staticmethod
    def _to_record(work: OpenAlexWork, retrieved_at: str) -> EvidenceRecord:
        doi = _clean_doi(work.doi)
        title = (work.title or work.display_name or "Untitled")[:MAX_TITLE]
        authors = ", ".join(
            a.author.display_name
            for a in work.authorships
            if a.author is not None and a.author.display_name
        )[:MAX_AUTHORS] or "Unknown"
        journal = (
            work.primary_location.source.display_name
            if work.primary_location is not None and work.primary_location.source is not None
            else None
        )
        journal = (journal or "Unknown source")[:MAX_JOURNAL]
        year = work.publication_year or 0
        return EvidenceRecord(
            id=_record_id(work.id, doi),
            title=title,
            authors=authors,
            year=year,
            journal=journal,
            doi=doi,
            status="checked" if doi else "cannot-check",
            sources=[EvidenceSource(name="OpenAlex", found=True, note="Retrieved from OpenAlex")],
            provenance=[
                f"Retrieved from OpenAlex on {retrieved_at}",
                f"DOI: {doi}" if doi else "No DOI present in the OpenAlex record",
            ],
            agreementCount=1 if doi else 0,
            totalSources=1,
            missingDoi=doi is None,
            source="openalex",
            retrievedAt=retrieved_at,
        )
