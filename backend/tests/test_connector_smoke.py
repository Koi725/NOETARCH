"""End-to-end connector smoke: proves the three integration paths against the running app
(in-process TestClient, fresh seeded DB). Network stays offline — the OpenAlex provider is
substituted with a fake, so CI never makes a real request.

Covers: (1) a READ (/evidence), (2) the Decisions WRITE + audit trail, (3) the OpenAlex
/search fetch-and-freeze with the feature flag ON.
"""
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.evidence.dependencies import (
    external_sources_enabled,
    get_evidence_provider,
)
from noetarch.modules.evidence.schemas import EvidenceRecord, EvidenceSource


class _FakeProvider:
    def search(self, query: str) -> list[EvidenceRecord]:
        return [
            EvidenceRecord(
                id="oa-smoke",
                title="Smoke-test fetched paper",
                authors="A B",
                year=2024,
                journal="J",
                doi="10.9999/smoke.1",
                status="checked",
                sources=[EvidenceSource(name="OpenAlex", found=True, note="Retrieved")],
                provenance=["Retrieved from OpenAlex on 2026-09-06T00:00:00+00:00"],
                agreementCount=1,
                totalSources=1,
                missingDoi=False,
                source="openalex",
                retrievedAt="2026-09-06T00:00:00+00:00",
            )
        ]


@pytest.fixture
def _clear_overrides() -> Iterator[None]:
    try:
        yield
    finally:
        app.dependency_overrides.pop(external_sources_enabled, None)
        app.dependency_overrides.pop(get_evidence_provider, None)


def test_connector_smoke_read_write_search(
    write_client: TestClient, _clear_overrides: None
) -> None:
    # 1) READ — evidence list serves from the database.
    read = write_client.get("/api/v1/evidence")
    assert read.status_code == 200
    assert len(read.json()["records"]) > 0

    # 2) WRITE + AUDIT — approve a pending decision and confirm the audit trail.
    action = write_client.post(
        "/api/v1/decisions/dec-001/action",
        json={"action": "approve", "expected_version": 1},
    )
    assert action.status_code == 200
    assert action.json()["status"] == "approved"
    assert action.json()["version"] == 2

    audit = write_client.get("/api/v1/decisions/dec-001/audit")
    assert audit.status_code == 200
    trail = audit.json()
    assert len(trail) == 1
    assert trail[0]["fromStatus"] == "pending" and trail[0]["toStatus"] == "approved"

    # 3) OpenAlex SEARCH — flag ON, provider mocked (no real network), fetch-and-freeze.
    app.dependency_overrides[external_sources_enabled] = lambda: True
    app.dependency_overrides[get_evidence_provider] = lambda: _FakeProvider()

    search = write_client.post("/api/v1/evidence/search", json={"query": "worker well-being"})
    assert search.status_code == 200
    body = search.json()
    assert body["enabled"] is True
    assert body["frozen"] == 1
    assert body["records"][0]["source"] == "openalex"

    # The frozen record is now readable via the DB-backed detail endpoint.
    frozen = write_client.get("/api/v1/evidence/oa-smoke")
    assert frozen.status_code == 200
    assert frozen.json()["retrievedAt"] is not None


def test_connector_smoke_search_disabled_by_default(write_client: TestClient) -> None:
    # With the flag OFF (default), /search returns a disabled state and makes no fetch.
    resp = write_client.post("/api/v1/evidence/search", json={"query": "x"})
    assert resp.status_code == 200
    assert resp.json()["enabled"] is False
    assert resp.json()["records"] == []
