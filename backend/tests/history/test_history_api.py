"""API contract and security-negative tests for the History surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.history.seed import SEED_RUNS

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_list_returns_200() -> None:
    assert client.get("/api/v1/history").status_code == 200


def test_list_count_matches_seed() -> None:
    assert len(client.get("/api/v1/history").json()) == len(SEED_RUNS)


def test_list_item_camelcase_shape() -> None:
    first = client.get("/api/v1/history").json()[0]
    for key in ("id", "status", "title", "recipe", "started", "duration", "cost",
                "papers", "providers"):
        assert key in first


def test_interrupted_run_has_camelcase_optionals() -> None:
    body = client.get("/api/v1/history").json()
    interrupted = next(r for r in body if r["status"] == "interrupted")
    assert "stopReason" in interrupted
    assert "stoppedAt" in interrupted
    assert interrupted["stoppedAt"] is not None


def test_request_id_header() -> None:
    assert client.get("/api/v1/history").headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_no_detail_by_id_route() -> None:
    # Run IDs are non-URL-safe display strings; no detail route is exposed.
    assert client.get("/api/v1/history/0f3a·91").status_code in (404, 405)


def test_no_replay_mutation_endpoint() -> None:
    # Replay stays local/simulated; assert no write route leaked.
    assert client.post("/api/v1/history/replay").status_code in (404, 405)


def test_post_not_allowed() -> None:
    assert client.post("/api/v1/history").status_code in (404, 405)
