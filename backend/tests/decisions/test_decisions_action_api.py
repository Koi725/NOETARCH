"""API tests for the Decisions write + audit endpoints (isolated fresh DB per test)."""
from fastapi.testclient import TestClient

_ACTION = "/api/v1/decisions/dec-001/action"
_AUDIT = "/api/v1/decisions/dec-001/audit"


def test_valid_action_returns_updated_decision(write_client: TestClient) -> None:
    resp = write_client.post(_ACTION, json={"action": "approve", "expected_version": 1})
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "approved"
    assert body["version"] == 2
    assert body["resolutionAction"] == "approve"
    assert body["resolvedAt"] is not None


def test_valid_action_writes_audit_trail(write_client: TestClient) -> None:
    write_client.post(_ACTION, json={"action": "approve", "expected_version": 1})
    resp = write_client.get(_AUDIT)
    assert resp.status_code == 200
    trail = resp.json()
    assert len(trail) == 1
    entry = trail[0]
    assert entry["action"] == "approve"
    assert entry["fromStatus"] == "pending"
    assert entry["toStatus"] == "approved"
    assert entry["actor"] == "local-user"
    assert entry["requestId"]
    assert entry["payloadHash"]
    assert entry["createdAt"]


def test_stale_version_returns_409(write_client: TestClient) -> None:
    resp = write_client.post(_ACTION, json={"action": "approve", "expected_version": 99})
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == 409


def test_double_action_returns_409(write_client: TestClient) -> None:
    first = write_client.post(_ACTION, json={"action": "approve", "expected_version": 1})
    assert first.status_code == 200
    # Re-fetch would give version 2 + resolved; any further action must conflict.
    stale = write_client.post(_ACTION, json={"action": "reject", "expected_version": 1})
    assert stale.status_code == 409
    resolved = write_client.post(_ACTION, json={"action": "reject", "expected_version": 2})
    assert resolved.status_code == 409


def test_action_on_already_resolved_seed_decision_returns_409(write_client: TestClient) -> None:
    # dec-003 is seeded as "rejected".
    resp = write_client.post(
        "/api/v1/decisions/dec-003/action", json={"action": "approve", "expected_version": 1}
    )
    assert resp.status_code == 409


def test_invalid_action_returns_422(write_client: TestClient) -> None:
    resp = write_client.post(_ACTION, json={"action": "delete", "expected_version": 1})
    assert resp.status_code == 422


def test_missing_expected_version_returns_422(write_client: TestClient) -> None:
    resp = write_client.post(_ACTION, json={"action": "approve"})
    assert resp.status_code == 422


def test_unknown_decision_returns_404(write_client: TestClient) -> None:
    resp = write_client.post(
        "/api/v1/decisions/dec-999/action", json={"action": "approve", "expected_version": 1}
    )
    assert resp.status_code == 404


def test_malformed_id_returns_422(write_client: TestClient) -> None:
    resp = write_client.post(
        "/api/v1/decisions/DEC-1/action", json={"action": "approve", "expected_version": 1}
    )
    assert resp.status_code == 422


def test_oversized_body_returns_413(write_client: TestClient) -> None:
    padding = "x" * (1024 * 1024 + 1000)
    payload = '{"action":"approve","expected_version":1,"pad":"' + padding + '"}'
    resp = write_client.post(
        _ACTION, content=payload.encode(), headers={"content-type": "application/json"}
    )
    assert resp.status_code == 413


def test_audit_for_unactioned_decision_is_empty(write_client: TestClient) -> None:
    resp = write_client.get("/api/v1/decisions/dec-002/audit")
    assert resp.status_code == 200
    assert resp.json() == []


def test_audit_for_unknown_decision_returns_404(write_client: TestClient) -> None:
    resp = write_client.get("/api/v1/decisions/dec-999/audit")
    assert resp.status_code == 404


def test_reject_and_local_alternative_actions(write_client: TestClient) -> None:
    reject = write_client.post(
        "/api/v1/decisions/dec-001/action", json={"action": "reject", "expected_version": 1}
    )
    assert reject.status_code == 200
    assert reject.json()["status"] == "rejected"

    alt = write_client.post(
        "/api/v1/decisions/dec-002/action",
        json={"action": "use_local_alternative", "expected_version": 1},
    )
    assert alt.status_code == 200
    assert alt.json()["status"] == "local_alternative"
