"""Tests for the OpenAlex provider adapter: strict validation, field-dropping, mapping.
No network — a fake egress returns a canned payload."""
from typing import Any

from noetarch.core.egress import EgressClient
from noetarch.modules.evidence.infrastructure.openalex import OpenAlexProvider
from noetarch.modules.evidence.schemas import EvidenceRecord


class _FakeEgress(EgressClient):
    def __init__(self, payload: Any) -> None:
        super().__init__()
        self._payload = payload
        self.last_call: dict[str, Any] = {}

    def get_json(self, *, host: str, path: str, params: Any) -> Any:
        self.last_call = {"host": host, "path": path, "params": dict(params)}
        return self._payload


def _payload() -> dict[str, Any]:
    return {
        "meta": {"count": 2},  # unexpected top-level field → must be dropped
        "results": [
            {
                "id": "https://openalex.org/W2755950973",
                "doi": "https://doi.org/10.1016/J.TECHSOC.2023.102089",
                "title": "A" * 600,  # oversized → truncated
                "publication_year": 2023,
                "authorships": [
                    {"author": {"display_name": "Müller J", "orcid": "x"}},  # extra dropped
                    {"author": {"display_name": "Zhang W"}},
                ],
                "primary_location": {"source": {"display_name": "Technology in Society"}},
                "unexpected_field": "ignore me",  # dropped
            },
            {
                "id": "https://openalex.org/W999",
                "doi": None,
                "display_name": "No DOI paper",
                "publication_year": None,
                "authorships": [],
                "primary_location": None,
            },
        ],
    }


def test_query_is_sent_as_param_never_as_url() -> None:
    egress = _FakeEgress(_payload())
    OpenAlexProvider(egress).search("worker well-being")
    assert egress.last_call["host"] == "api.openalex.org"
    assert egress.last_call["path"] == "/works"
    assert egress.last_call["params"]["search"] == "worker well-being"


def test_maps_and_drops_unexpected_and_oversized_fields() -> None:
    records = OpenAlexProvider(_FakeEgress(_payload())).search("q")
    assert len(records) == 2
    first = records[0]
    assert isinstance(first, EvidenceRecord)
    assert first.id.startswith("oa-")
    assert first.doi == "10.1016/j.techsoc.2023.102089"  # normalized + lowercased
    assert first.status == "checked"
    assert first.source == "openalex"
    assert first.retrievedAt is not None
    assert len(first.title) <= 500  # oversized title truncated
    assert first.authors == "Müller J, Zhang W"
    assert first.journal == "Technology in Society"


def test_record_without_doi_is_cannot_check_and_missing_doi() -> None:
    records = OpenAlexProvider(_FakeEgress(_payload())).search("q")
    second = records[1]
    assert second.doi is None
    assert second.status == "cannot-check"
    assert second.missingDoi is True
    assert second.year == 0


def test_empty_results_yields_no_records() -> None:
    records = OpenAlexProvider(_FakeEgress({"results": []})).search("q")
    assert records == []
