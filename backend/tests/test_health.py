"""Smoke tests for the health endpoints."""
from fastapi.testclient import TestClient

from noetarch.main import app

client = TestClient(app)


def test_liveness() -> None:
    resp = client.get("/api/v1/health/live")
    assert resp.status_code == 200
    assert resp.json()["status"] == "alive"


def test_readiness() -> None:
    resp = client.get("/api/v1/health/ready")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ready"


def test_request_id_header() -> None:
    resp = client.get("/api/v1/health/live")
    assert resp.headers.get("x-request-id")
