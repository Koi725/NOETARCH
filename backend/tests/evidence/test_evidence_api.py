"""API contract and security-negative tests for the Evidence surface."""
from fastapi.testclient import TestClient

from noetarch.main import app
from noetarch.modules.evidence.seed import SEED_PROJECT, SEED_RECORDS

client = TestClient(app)


# ─── Contract tests ────────────────────────────────────────────────────────────

def test_list_returns_200() -> None:
    resp = client.get("/api/v1/evidence")
    assert resp.status_code == 200


def test_list_response_has_project_and_records() -> None:
    body = client.get("/api/v1/evidence").json()
    assert "project" in body
    assert "records" in body
    assert isinstance(body["records"], list)


def test_list_project_matches_seed() -> None:
    body = client.get("/api/v1/evidence").json()
    assert body["project"] == SEED_PROJECT


def test_list_record_count_matches_seed() -> None:
    body = client.get("/api/v1/evidence").json()
    assert len(body["records"]) == len(SEED_RECORDS)


def test_list_record_shape_has_camel_case_fields() -> None:
    """Verify the JSON output matches the TypeScript contract (camelCase keys)."""
    body = client.get("/api/v1/evidence").json()
    first = body["records"][0]
    assert "agreementCount" in first
    assert "totalSources" in first
    assert "id" in first
    assert "title" in first
    assert "authors" in first
    assert "year" in first
    assert "journal" in first
    assert "doi" in first
    assert "status" in first
    assert "sources" in first
    assert "provenance" in first


def test_list_source_shape() -> None:
    body = client.get("/api/v1/evidence").json()
    checked = next(r for r in body["records"] if r["status"] == "checked")
    assert len(checked["sources"]) > 0
    src = checked["sources"][0]
    assert "name" in src
    assert "found" in src
    assert "note" in src


def test_detail_returns_200_for_known_id() -> None:
    resp = client.get("/api/v1/evidence/rec-1")
    assert resp.status_code == 200


def test_detail_returns_correct_record() -> None:
    body = client.get("/api/v1/evidence/rec-1").json()
    assert body["id"] == "rec-1"
    assert body["status"] == "checked"
    assert body["agreementCount"] == 2
    assert body["totalSources"] == 3


def test_detail_conflict_record_has_conflict_note() -> None:
    body = client.get("/api/v1/evidence/rec-2").json()
    assert body["id"] == "rec-2"
    assert body["status"] == "conflicting"
    assert body["conflictNote"] is not None


def test_detail_missing_doi_record() -> None:
    body = client.get("/api/v1/evidence/rec-3").json()
    assert body["id"] == "rec-3"
    assert body["doi"] is None
    assert body["missingDoi"] is True
    assert body["sources"] == []


def test_request_id_header_on_evidence_list() -> None:
    resp = client.get("/api/v1/evidence")
    assert resp.headers.get("x-request-id")


# ─── Security-negative tests ───────────────────────────────────────────────────

def test_unknown_id_returns_404() -> None:
    resp = client.get("/api/v1/evidence/rec-does-not-exist")
    assert resp.status_code == 404


def test_404_error_body_is_structured() -> None:
    body = client.get("/api/v1/evidence/rec-does-not-exist").json()
    assert "error" in body
    assert body["error"]["code"] == 404


def test_404_message_does_not_leak_internals() -> None:
    body = client.get("/api/v1/evidence/rec-does-not-exist").json()
    msg = body["error"]["message"]
    assert "Traceback" not in msg
    assert "seed" not in msg.lower()
    assert "SEED" not in msg


def test_uppercase_id_returns_422() -> None:
    resp = client.get("/api/v1/evidence/REC-1")
    assert resp.status_code == 422


def test_id_with_dot_returns_422() -> None:
    resp = client.get("/api/v1/evidence/rec.1")
    assert resp.status_code == 422


def test_id_with_slash_treated_as_separate_path_segment() -> None:
    # A slash in the id would be a separate URL path; the router has no matching route.
    resp = client.get("/api/v1/evidence/rec/extra")
    assert resp.status_code in (404, 405, 422)


def test_oversized_id_returns_422() -> None:
    long_id = "r" + "a" * 63
    resp = client.get(f"/api/v1/evidence/{long_id}")
    assert resp.status_code == 422


def test_id_starting_with_digit_returns_422() -> None:
    resp = client.get("/api/v1/evidence/1rec")
    assert resp.status_code == 422


def test_id_with_percent_encoding_attempt() -> None:
    resp = client.get("/api/v1/evidence/rec%2F1")
    assert resp.status_code in (404, 422)
