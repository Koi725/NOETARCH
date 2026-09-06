"""API contract and security-negative tests for the Decisions surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.decisions.seed import SEED_DECISIONS

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_list_returns_200() -> None:
    assert client.get("/api/v1/decisions").status_code == 200


def test_list_count_matches_seed() -> None:
    body = client.get("/api/v1/decisions").json()
    assert len(body) == len(SEED_DECISIONS)


def test_list_item_shape() -> None:
    first = client.get("/api/v1/decisions").json()[0]
    for key in ("id", "title", "type", "risk", "cost", "time", "reversible", "detail",
                "alternatives", "status"):
        assert key in first


def test_rejected_decision_has_rejected_at() -> None:
    body = client.get("/api/v1/decisions").json()
    rejected = next(d for d in body if d["status"] == "rejected")
    assert rejected["rejectedAt"] == "14:08"


def test_detail_returns_200_for_known() -> None:
    resp = client.get("/api/v1/decisions/dec-001")
    assert resp.status_code == 200
    assert resp.json()["id"] == "dec-001"


def test_request_id_header() -> None:
    assert client.get("/api/v1/decisions").headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_unknown_id_returns_404() -> None:
    assert client.get("/api/v1/decisions/dec-999").status_code == 404


def test_404_body_structured_no_leak() -> None:
    body = client.get("/api/v1/decisions/dec-999").json()
    assert body["error"]["code"] == 404
    assert "seed" not in body["error"]["message"].lower()
    assert "Traceback" not in body["error"]["message"]


def test_uppercase_id_returns_422() -> None:
    assert client.get("/api/v1/decisions/DEC-001").status_code == 422


def test_id_with_dot_returns_422() -> None:
    assert client.get("/api/v1/decisions/dec.001").status_code == 422


def test_oversized_id_returns_422() -> None:
    assert client.get("/api/v1/decisions/" + "d" * 64).status_code == 422


def test_no_mutation_endpoint() -> None:
    # Approve/reject stay local/simulated; assert no write route leaked.
    assert client.post("/api/v1/decisions/dec-001/approve").status_code in (404, 405)
