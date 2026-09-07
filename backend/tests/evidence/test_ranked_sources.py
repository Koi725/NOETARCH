"""OpenAlex + Crossref ranked-search adapters: exact filter params, cursor paging, JATS.

No network — a fake egress records each call and returns canned payloads. The filter/param
shapes asserted here were verified against the live APIs.
"""
from typing import Any

from noetarch.core.egress import EgressClient
from noetarch.modules.evidence.infrastructure.crossref import CrossrefProvider
from noetarch.modules.evidence.infrastructure.openalex import OpenAlexProvider


class _FakeEgress(EgressClient):
    def __init__(self, payloads: list[Any]) -> None:
        super().__init__()
        self._payloads = payloads
        self.calls: list[dict[str, Any]] = []

    def get_json(self, *, host: str, path: str, params: Any) -> Any:
        self.calls.append({"host": host, "path": path, "params": dict(params)})
        idx = min(len(self.calls) - 1, len(self._payloads) - 1)
        return self._payloads[idx]


def test_openalex_ranked_builds_verified_filter_and_selects_abstract() -> None:
    payload = {
        "meta": {"next_cursor": None},
        "results": [
            {
                "id": "https://openalex.org/W1",
                "doi": "https://doi.org/10.1/A",
                "title": "Fasting and glucose",
                "publication_year": 2022,
                "type": "article",
                "authorships": [{"author": {"display_name": "Doe J"}}],
                "primary_location": {"source": {"display_name": "Journal"}},
                "abstract_inverted_index": {"Fasting": [0], "helps": [1]},
            }
        ],
    }
    egress = _FakeEgress([payload])
    provider = OpenAlexProvider(egress, contact_email="me@example.com")
    pairs = provider.search_ranked("fasting glucose", year_from=2018, year_to=2023)

    assert len(pairs) == 1
    record, abstract = pairs[0]
    assert abstract == "Fasting helps"  # reconstructed from the inverted index
    assert record.doi == "10.1/a"

    params = egress.calls[0]["params"]
    filt = params["filter"]
    assert "title_and_abstract.search:fasting glucose" in filt
    assert "has_abstract:true" in filt
    assert "type:article|review" in filt
    assert "from_publication_date:2018-01-01" in filt
    assert "to_publication_date:2023-12-31" in filt
    assert "abstract_inverted_index" in params["select"]
    assert params["cursor"] == "*"
    assert params["mailto"] == "me@example.com"


def test_openalex_ranked_pages_with_cursor() -> None:
    page1 = {
        "meta": {"next_cursor": "CURSOR2"},
        "results": [{"id": "https://openalex.org/W1", "doi": "10.1/a", "title": "One"}],
    }
    page2 = {
        "meta": {"next_cursor": None},
        "results": [{"id": "https://openalex.org/W2", "doi": "10.1/b", "title": "Two"}],
    }
    egress = _FakeEgress([page1, page2])
    pairs = OpenAlexProvider(egress).search_ranked("q", max_pages=3)
    assert len(pairs) == 2
    assert len(egress.calls) == 2  # stopped when next_cursor was null
    assert egress.calls[1]["params"]["cursor"] == "CURSOR2"


def test_openalex_ranked_strips_filter_metacharacters() -> None:
    egress = _FakeEgress([{"results": []}])
    OpenAlexProvider(egress).search_ranked("fasting, glucose | insulin: adults")
    filt = egress.calls[0]["params"]["filter"]
    # The query segment must not smuggle extra filter clauses.
    query_seg = filt.split(",")[0]
    assert query_seg == "title_and_abstract.search:fasting glucose insulin adults"


def test_crossref_ranked_params_and_jats_stripping() -> None:
    payload = {
        "message": {
            "items": [
                {
                    "DOI": "10.5/XYZ",
                    "title": ["Time-restricted eating in adults"],
                    "abstract": (
                        "<jats:p>Hello <jats:italic>world</jats:italic> &amp; more</jats:p>"
                    ),
                    "author": [{"given": "Jane", "family": "Roe"}, {"family": "Smith"}],
                    "published": {"date-parts": [[2021, 5]]},
                    "container-title": ["Diabetes Care"],
                    "type": "journal-article",
                }
            ]
        }
    }
    egress = _FakeEgress([payload])
    provider = CrossrefProvider(egress, contact_email="me@example.com")
    pairs = provider.search_ranked("fasting", year_from=2019, year_to=2022)

    assert len(pairs) == 1
    record, abstract = pairs[0]
    assert abstract == "Hello world & more"  # JATS tags stripped, entities unescaped
    assert record.doi == "10.5/xyz"
    assert record.year == 2021
    assert record.journal == "Diabetes Care"
    assert record.authors == "Jane Roe, Smith"
    assert record.source == "crossref"

    params = egress.calls[0]["params"]
    assert params["query.bibliographic"] == "fasting"
    filt = params["filter"]
    assert "type:journal-article" in filt
    assert "has-abstract:true" in filt
    assert "from-pub-date:2019-01-01" in filt
    assert "until-pub-date:2022-12-31" in filt
    assert params["mailto"] == "me@example.com"
