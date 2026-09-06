"""API tests for POST /api/v1/evidence/search — flag behavior, freeze, dedupe.
No real network: the provider dependency is overridden with a fake."""
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.evidence.dependencies import (
    external_sources_enabled,
    get_evidence_provider,
)
from noetarch.modules.evidence.schemas import EvidenceRecord, EvidenceSource


def _record(rec_id: str, doi: str | None) -> EvidenceRecord:
    return EvidenceRecord(
        id=rec_id,
        title="Fetched",
        authors="A",
        year=2024,
        journal="J",
        doi=doi,
        status="checked" if doi else "cannot-check",
        sources=[EvidenceSource(name="OpenAlex", found=True, note="Retrieved from OpenAlex")],
        provenance=["Retrieved from OpenAlex on 2026-09-06T00:00:00+00:00"],
        agreementCount=1 if doi else 0,
        totalSources=1,
        missingDoi=doi is None,
        source="openalex",
        retrievedAt="2026-09-06T00:00:00+00:00",
    )


class _FakeProvider:
    def __init__(self, records: list[EvidenceRecord]) -> None:
        self._records = records
        self.called = 0

    def search(self, query: str) -> list[EvidenceRecord]:
        self.called += 1
        return list(self._records)


class _ExplodingProvider:
    def search(self, query: str) -> list[EvidenceRecord]:
        raise AssertionError("network/provider must not be called when the flag is OFF")


@pytest.fixture
def _clear_overrides() -> Iterator[None]:
    try:
        yield
    finally:
        app.dependency_overrides.pop(external_sources_enabled, None)
        app.dependency_overrides.pop(get_evidence_provider, None)


def test_flag_off_returns_disabled_state_and_makes_zero_network_calls(
    write_client: TestClient, _clear_overrides: None
) -> None:
    spy = _ExplodingProvider()
    app.dependency_overrides[external_sources_enabled] = lambda: False
    app.dependency_overrides[get_evidence_provider] = lambda: spy

    resp = write_client.post("/api/v1/evidence/search", json={"query": "worker well-being"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is False
    assert body["records"] == []
    assert body["message"]  # clear disabled message
    # If the provider had been called it would have raised → 200 proves zero fetch.


def test_flag_on_fetches_freezes_and_dedupes(
    write_client: TestClient, _clear_overrides: None
) -> None:
    # One record collides with a seed DOI (deduped); one is new (frozen).
    provider = _FakeProvider(
        [_record("oa-dup", "10.1016/j.techsoc.2023.102089"), _record("oa-new", "10.9999/new.1")]
    )
    app.dependency_overrides[external_sources_enabled] = lambda: True
    app.dependency_overrides[get_evidence_provider] = lambda: provider

    resp = write_client.post("/api/v1/evidence/search", json={"query": "x"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is True
    assert body["frozen"] == 1
    assert body["deduplicated"] == 1
    assert body["retrievedAt"] is not None
    assert provider.called == 1

    # The new record is now frozen and visible via the read endpoint, with provenance.
    detail = write_client.get("/api/v1/evidence/oa-new")
    assert detail.status_code == 200
    assert detail.json()["source"] == "openalex"
    assert detail.json()["retrievedAt"] is not None


def test_flag_on_second_identical_search_freezes_nothing(
    write_client: TestClient, _clear_overrides: None
) -> None:
    provider = _FakeProvider([_record("oa-a", "10.9999/a")])
    app.dependency_overrides[external_sources_enabled] = lambda: True
    app.dependency_overrides[get_evidence_provider] = lambda: provider

    first = write_client.post("/api/v1/evidence/search", json={"query": "x"})
    assert first.json()["frozen"] == 1
    second = write_client.post("/api/v1/evidence/search", json={"query": "x"})
    assert second.json()["frozen"] == 0
    assert second.json()["deduplicated"] == 1


def test_empty_query_is_rejected_422(write_client: TestClient, _clear_overrides: None) -> None:
    app.dependency_overrides[external_sources_enabled] = lambda: True
    app.dependency_overrides[get_evidence_provider] = lambda: _FakeProvider([])
    resp = write_client.post("/api/v1/evidence/search", json={"query": ""})
    assert resp.status_code == 422


def test_oversized_query_is_rejected_422(write_client: TestClient, _clear_overrides: None) -> None:
    app.dependency_overrides[external_sources_enabled] = lambda: True
    app.dependency_overrides[get_evidence_provider] = lambda: _FakeProvider([])
    resp = write_client.post("/api/v1/evidence/search", json={"query": "z" * 501})
    assert resp.status_code == 422
