"""API contract and security-negative tests for the Today surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.today.seed import SEED_TODAY

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_today_returns_200() -> None:
    assert client.get("/api/v1/today").status_code == 200


def test_today_has_top_level_fields() -> None:
    body = client.get("/api/v1/today").json()
    for key in ("project", "question", "waiting", "run", "failure", "finished", "sources", "files"):
        assert key in body


def test_today_project_matches_seed() -> None:
    body = client.get("/api/v1/today").json()
    assert body["project"] == SEED_TODAY.project


def test_today_run_shape() -> None:
    run = client.get("/api/v1/today").json()["run"]
    assert "progress" in run
    assert isinstance(run["progress"], int)
    assert isinstance(run["kpis"], list)
    assert len(run["kpis"][0]) == 3  # tuple serializes to a 3-element array


def test_today_waiting_next_field_present() -> None:
    waiting = client.get("/api/v1/today").json()["waiting"]
    assert "next" in waiting


def test_today_files_serialize_as_arrays_with_bool() -> None:
    files = client.get("/api/v1/today").json()["files"]
    assert len(files) > 0
    name, meta, pending = files[0]
    assert isinstance(name, str)
    assert isinstance(meta, str)
    assert isinstance(pending, bool)


def test_today_sources_serialize_as_triples() -> None:
    sources = client.get("/api/v1/today").json()["sources"]
    assert len(sources) > 0
    assert all(len(s) == 3 for s in sources)


def test_request_id_header_on_today() -> None:
    resp = client.get("/api/v1/today")
    assert resp.headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_today_rejects_trailing_path_segment() -> None:
    # No detail route exists on this surface.
    resp = client.get("/api/v1/today/anything")
    assert resp.status_code in (404, 405)


def test_today_post_not_allowed() -> None:
    # Read-only surface: no write verb.
    resp = client.post("/api/v1/today")
    assert resp.status_code in (404, 405)
