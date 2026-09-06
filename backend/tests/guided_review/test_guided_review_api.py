"""API contract and security-negative tests for the GuidedReview surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.guided_review.seed import SEED_GUIDED_REVIEW

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_returns_200() -> None:
    assert client.get("/api/v1/guided-review").status_code == 200


def test_bundle_keys() -> None:
    body = client.get("/api/v1/guided-review").json()
    for key in ("project", "progress", "currentPaper", "nextPapers", "excludeReasons",
                "previousDecisions"):
        assert key in body


def test_current_paper_camelcase() -> None:
    paper = client.get("/api/v1/guided-review").json()["currentPaper"]
    assert "initialStatus" in paper
    assert "initialStatusNote" in paper


def test_progress_matches_seed() -> None:
    progress = client.get("/api/v1/guided-review").json()["progress"]
    assert progress["reviewed"] == SEED_GUIDED_REVIEW.progress.reviewed
    assert progress["total"] == SEED_GUIDED_REVIEW.progress.total


def test_history_entry_camelcase() -> None:
    entries = client.get("/api/v1/guided-review").json()["previousDecisions"]
    assert len(entries) > 0
    assert "paperTitle" in entries[0]


def test_request_id_header() -> None:
    assert client.get("/api/v1/guided-review").headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_rejects_trailing_segment() -> None:
    assert client.get("/api/v1/guided-review/anything").status_code in (404, 405)


def test_no_decide_mutation_endpoint() -> None:
    # Decisions stay local/simulated; assert no write route leaked.
    assert client.post("/api/v1/guided-review/decide").status_code in (404, 405)


def test_post_not_allowed() -> None:
    assert client.post("/api/v1/guided-review").status_code in (404, 405)
