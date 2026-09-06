"""API contract and security-negative tests for the Recipes surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.recipes.seed import SEED_RECIPES

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_list_returns_200() -> None:
    assert client.get("/api/v1/recipes").status_code == 200


def test_list_count_matches_seed() -> None:
    assert len(client.get("/api/v1/recipes").json()) == len(SEED_RECIPES)


def test_list_item_camelcase_shape() -> None:
    first = client.get("/api/v1/recipes").json()[0]
    for key in ("id", "name", "description", "execution", "steps", "inputs", "outputs",
                "estimatedCost", "estimatedTime", "providers", "privacyPolicy"):
        assert key in first


def test_detail_returns_200_for_known() -> None:
    resp = client.get("/api/v1/recipes/rec-002")
    assert resp.status_code == 200
    assert resp.json()["execution"] == "cloud"


def test_request_id_header() -> None:
    assert client.get("/api/v1/recipes").headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_unknown_id_returns_404() -> None:
    assert client.get("/api/v1/recipes/rec-999").status_code == 404


def test_404_body_structured_no_leak() -> None:
    body = client.get("/api/v1/recipes/rec-999").json()
    assert body["error"]["code"] == 404
    assert "seed" not in body["error"]["message"].lower()


def test_uppercase_id_returns_422() -> None:
    assert client.get("/api/v1/recipes/REC-001").status_code == 422


def test_id_with_dot_returns_422() -> None:
    assert client.get("/api/v1/recipes/rec.001").status_code == 422


def test_oversized_id_returns_422() -> None:
    assert client.get("/api/v1/recipes/" + "r" * 64).status_code == 422


def test_no_duplicate_mutation_endpoint() -> None:
    # Duplicate/customize stay local/simulated; assert no write route leaked.
    assert client.post("/api/v1/recipes/rec-001/duplicate").status_code in (404, 405)
