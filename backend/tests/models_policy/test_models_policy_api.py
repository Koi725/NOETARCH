"""API contract and security-negative tests for the ModelsPolicy surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.models_policy.seed import SEED_PROVIDERS

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_list_returns_200() -> None:
    assert client.get("/api/v1/models-policy/providers").status_code == 200


def test_list_count_matches_seed() -> None:
    assert len(client.get("/api/v1/models-policy/providers").json()) == len(SEED_PROVIDERS)


def test_list_item_camelcase_shape() -> None:
    first = client.get("/api/v1/models-policy/providers").json()[0]
    for key in ("id", "name", "type", "status", "enabled", "dailyCostLimit", "dataRetention",
                "egressPolicy", "capabilities", "routingPreference", "requiresApproval"):
        assert key in first


def test_down_provider_has_status_note() -> None:
    body = client.get("/api/v1/models-policy/providers").json()
    down = next(p for p in body if p["status"] == "down")
    assert down["statusNote"] is not None


def test_detail_returns_200_for_known() -> None:
    resp = client.get("/api/v1/models-policy/providers/anthropic")
    assert resp.status_code == 200
    assert resp.json()["id"] == "anthropic"


def test_response_carries_no_credentials() -> None:
    first = client.get("/api/v1/models-policy/providers").json()[0]
    for key in first:
        assert "key" not in key.lower()
        assert "secret" not in key.lower()
        assert "token" not in key.lower()


def test_request_id_header() -> None:
    assert client.get("/api/v1/models-policy/providers").headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_unknown_id_returns_404() -> None:
    assert client.get("/api/v1/models-policy/providers/gemini").status_code == 404


def test_404_body_structured_no_leak() -> None:
    body = client.get("/api/v1/models-policy/providers/gemini").json()
    assert body["error"]["code"] == 404
    assert "seed" not in body["error"]["message"].lower()


def test_uppercase_id_returns_422() -> None:
    assert client.get("/api/v1/models-policy/providers/Anthropic").status_code == 422


def test_id_with_dot_returns_422() -> None:
    assert client.get("/api/v1/models-policy/providers/an.thropic").status_code == 422


def test_oversized_id_returns_422() -> None:
    assert client.get("/api/v1/models-policy/providers/" + "a" * 64).status_code == 422


def test_no_mutation_endpoint() -> None:
    # Enable/disable/routing changes stay local/simulated; assert no write route leaked.
    assert client.post("/api/v1/models-policy/providers/anthropic").status_code in (404, 405)
