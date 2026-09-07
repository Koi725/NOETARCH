"""POST /runs gating — the app runs with NO key; only real runs are blocked (clear 409)."""
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from noetarch.core.config import get_settings


def test_run_blocked_when_external_sources_disabled(empty_client: TestClient) -> None:
    # Default: external sources OFF → a real run is unavailable, but the API stays up.
    r = empty_client.post("/api/v1/runs", json={"question": "does X help Y?"})
    assert r.status_code == 409
    assert "external sources" in r.json()["error"]["message"].lower()


@pytest.fixture
def _external_enabled(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv("NOETARCH_EXTERNAL_SOURCES_ENABLED", "true")
    get_settings.cache_clear()
    try:
        yield
    finally:
        get_settings.cache_clear()


def test_run_blocked_when_no_provider_key(
    empty_client: TestClient, _external_enabled: None
) -> None:
    # External sources on, but no BYOK key configured → 409 no_provider.
    r = empty_client.post("/api/v1/runs", json={"question": "q"})
    assert r.status_code == 409
    assert "provider key" in r.json()["error"]["message"].lower()


def test_unknown_run_returns_404(empty_client: TestClient) -> None:
    r = empty_client.get("/api/v1/runs/nope123")
    assert r.status_code == 404
