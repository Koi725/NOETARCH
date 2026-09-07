"""Read endpoints against an EMPTY (unseeded) database — "real mode".

Regression tests for the bug where snapshot endpoints (Today / Live run / Guided
review) called ``.scalar_one()`` and raised 500 on an empty DB. Every read endpoint
must return HTTP 200 with a valid, empty-shaped payload — never crash — so the
frontend can render an intentional empty state instead of hanging.

These use the ``empty_client`` fixture (schema created, no seed rows).
"""
from fastapi.testclient import TestClient

# ─── Snapshot endpoints (previously crashed on empty DB) ─────────────────────

def test_today_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/today")
    assert resp.status_code == 200
    body = resp.json()
    # Full shape present, correctly typed, and empty.
    for key in ("project", "question", "waiting", "run", "failure", "finished", "sources", "files"):
        assert key in body
    assert body["project"] == ""
    assert body["run"]["title"] == ""
    assert body["run"]["kpis"] == []
    assert body["waiting"]["title"] == ""
    assert body["finished"] == []
    assert body["sources"] == []
    assert body["files"] == []


def test_live_run_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/live-run")
    assert resp.status_code == 200
    body = resp.json()
    for key in ("meta", "steps", "stepInspector", "kpis", "events", "decisions", "evidenceCards"):
        assert key in body
    assert body["meta"]["runId"] == ""
    assert body["steps"] == []
    assert body["kpis"] == []
    assert body["events"] == []
    assert body["decisions"] == []
    assert body["evidenceCards"] == []


def test_guided_review_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/guided-review")
    assert resp.status_code == 200
    body = resp.json()
    for key in ("project", "progress", "currentPaper", "nextPapers", "excludeReasons",
                "previousDecisions"):
        assert key in body
    assert body["currentPaper"]["id"] == ""
    assert body["progress"]["total"] == 0
    assert body["nextPapers"] == []
    assert body["excludeReasons"] == []
    assert body["previousDecisions"] == []


# ─── List endpoints (must also be 200 + empty shape) ─────────────────────────

def test_evidence_list_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/evidence")
    assert resp.status_code == 200
    body = resp.json()
    assert body["project"] == ""
    assert body["records"] == []


def test_history_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/history")
    assert resp.status_code == 200
    assert resp.json() == []


def test_recipes_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/recipes")
    assert resp.status_code == 200
    assert resp.json() == []


def test_decisions_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/decisions")
    assert resp.status_code == 200
    assert resp.json() == []


def test_models_policy_empty_ok(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/models-policy/providers")
    assert resp.status_code == 200
    assert resp.json() == []
