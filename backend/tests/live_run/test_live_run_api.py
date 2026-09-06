"""API contract and security-negative tests for the LiveRun surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.live_run.seed import SEED_LIVE_RUN

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_live_run_returns_200() -> None:
    assert client.get("/api/v1/live-run").status_code == 200


def test_live_run_has_bundle_keys() -> None:
    body = client.get("/api/v1/live-run").json()
    for key in ("meta", "steps", "stepInspector", "kpis", "events", "decisions", "evidenceCards"):
        assert key in body


def test_live_run_meta_camelcase() -> None:
    meta = client.get("/api/v1/live-run").json()["meta"]
    assert "runId" in meta
    assert meta["runId"] == SEED_LIVE_RUN.meta.runId


def test_live_run_step_inspector_camelcase() -> None:
    inspector = client.get("/api/v1/live-run").json()["stepInspector"]
    assert "stepIndex" in inspector
    assert "outputSoFar" in inspector


def test_live_run_evidence_card_camelcase() -> None:
    cards = client.get("/api/v1/live-run").json()["evidenceCards"]
    assert len(cards) > 0
    assert "verifiedBy" in cards[0]


def test_live_run_step_count_matches_seed() -> None:
    steps = client.get("/api/v1/live-run").json()["steps"]
    assert len(steps) == len(SEED_LIVE_RUN.steps)


def test_request_id_header_on_live_run() -> None:
    assert client.get("/api/v1/live-run").headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_live_run_rejects_trailing_segment() -> None:
    assert client.get("/api/v1/live-run/anything").status_code in (404, 405)


def test_live_run_post_not_allowed() -> None:
    # No run-control mutation endpoints in this milestone.
    assert client.post("/api/v1/live-run").status_code in (404, 405)


def test_live_run_pause_endpoint_does_not_exist() -> None:
    # Run controls stay local/simulated; assert no mutation route leaked.
    assert client.post("/api/v1/live-run/pause").status_code in (404, 405)
