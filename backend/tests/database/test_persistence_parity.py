"""DB-backed responses are byte-identical to the original seed serialization.

These tests guard the M7 invariant: moving seed → database must not change any
read endpoint's response. They compare the live API JSON (served from the seeded
test DB) against the seed models serialized directly.
"""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.decisions.seed import SEED_DECISIONS
from noetarch.modules.evidence.seed import SEED_PROJECT, SEED_RECORDS
from noetarch.modules.guided_review.seed import SEED_GUIDED_REVIEW
from noetarch.modules.history.seed import SEED_RUNS
from noetarch.modules.live_run.seed import SEED_LIVE_RUN
from noetarch.modules.models_policy.seed import SEED_PROVIDERS
from noetarch.modules.recipes.seed import SEED_RECIPES
from noetarch.modules.today.seed import SEED_TODAY

client = TestClient(app)


def test_evidence_list_matches_seed_serialization() -> None:
    body = client.get("/api/v1/evidence").json()
    expected = {
        "project": SEED_PROJECT,
        "records": [r.model_dump(mode="json") for r in SEED_RECORDS],
    }
    assert body == expected


def test_decisions_list_matches_seed_serialization() -> None:
    body = client.get("/api/v1/decisions").json()
    assert body == [d.model_dump(mode="json") for d in SEED_DECISIONS]


def test_recipes_list_matches_seed_serialization() -> None:
    body = client.get("/api/v1/recipes").json()
    assert body == [r.model_dump(mode="json") for r in SEED_RECIPES]


def test_history_list_matches_seed_serialization() -> None:
    body = client.get("/api/v1/history").json()
    assert body == [r.model_dump(mode="json") for r in SEED_RUNS]


def test_models_policy_list_matches_seed_serialization() -> None:
    body = client.get("/api/v1/models-policy/providers").json()
    assert body == [p.model_dump(mode="json") for p in SEED_PROVIDERS]


def test_today_matches_seed_serialization() -> None:
    body = client.get("/api/v1/today").json()
    assert body == SEED_TODAY.model_dump(mode="json")


def test_live_run_matches_seed_serialization() -> None:
    body = client.get("/api/v1/live-run").json()
    assert body == SEED_LIVE_RUN.model_dump(mode="json")


def test_guided_review_matches_seed_serialization() -> None:
    body = client.get("/api/v1/guided-review").json()
    assert body == SEED_GUIDED_REVIEW.model_dump(mode="json")
