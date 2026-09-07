"""BYOK credential API: write-only, masked reads, and the key never leaks.

The headline guarantee — the plaintext key is absent from every response, from the audit
log, and from logs — is asserted by grepping for a sentinel key value.
"""
import logging
from collections.abc import Iterator

import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from noetarch.core.config import get_settings
from noetarch.core.crypto import get_secret_box
from noetarch.core.logging import RedactSecretsFilter
from noetarch.modules.audit.infrastructure.models import AuditLogORM

SENTINEL_KEY = "sk-ant-SENTINELVALUE-do-not-leak-9f8e7d6c5b4a"


@pytest.fixture(autouse=True)
def _master_key(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv("NOETARCH_SECRET_KEY", Fernet.generate_key().decode())
    get_settings.cache_clear()
    get_secret_box.cache_clear()
    try:
        yield
    finally:
        get_settings.cache_clear()
        get_secret_box.cache_clear()


def test_set_get_rotate_delete_masks_and_never_returns_plaintext(empty_client: TestClient) -> None:
    # Not configured initially.
    r = empty_client.get("/api/v1/models-policy/credentials/anthropic")
    assert r.status_code == 200
    assert r.json() == {
        "provider": "anthropic",
        "configured": False,
        "masked": None,
        "enabled": False,
        "dailyBudget": None,
        "updatedAt": None,
    }

    # Set the key.
    r = empty_client.put(
        "/api/v1/models-policy/credentials/anthropic",
        json={"api_key": SENTINEL_KEY, "enabled": True, "daily_budget": 2.5},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["configured"] is True
    assert body["enabled"] is True
    assert body["dailyBudget"] == 2.5
    assert body["masked"] == "sk-…" + SENTINEL_KEY[-4:]
    assert SENTINEL_KEY not in r.text  # plaintext never returned

    # GET returns masked only.
    r = empty_client.get("/api/v1/models-policy/credentials/anthropic")
    assert SENTINEL_KEY not in r.text
    assert r.json()["masked"] == "sk-…" + SENTINEL_KEY[-4:]

    # PATCH toggles without re-sending the key.
    r = empty_client.patch(
        "/api/v1/models-policy/credentials/anthropic", json={"enabled": False}
    )
    assert r.status_code == 200
    assert r.json()["enabled"] is False

    # DELETE removes it.
    r = empty_client.delete("/api/v1/models-policy/credentials/anthropic")
    assert r.status_code == 200
    after = empty_client.get("/api/v1/models-policy/credentials/anthropic").json()
    assert after["configured"] is False


def test_key_absent_from_audit_log(empty_client: TestClient, empty_db_engine: Engine) -> None:
    empty_client.put(
        "/api/v1/models-policy/credentials/anthropic",
        json={"api_key": SENTINEL_KEY, "enabled": True},
    )
    empty_client.delete("/api/v1/models-policy/credentials/anthropic")
    with Session(empty_db_engine) as session:
        rows = session.query(AuditLogORM).all()
        assert rows, "expected credential audit rows"
        for row in rows:
            serialized = "|".join(
                str(v) for v in (
                    row.entity_type, row.entity_id, row.action, row.actor,
                    row.from_status, row.to_status, row.request_id, row.payload_hash,
                )
            )
            assert SENTINEL_KEY not in serialized
            assert SENTINEL_KEY[-10:] not in serialized  # not even a long tail


def test_log_filter_redacts_key() -> None:
    f = RedactSecretsFilter()
    record = logging.LogRecord(
        "t", logging.INFO, __file__, 1, "using key %s now", (SENTINEL_KEY,), None
    )
    assert f.filter(record) is True
    rendered = record.getMessage()
    assert SENTINEL_KEY not in rendered
    assert "REDACTED" in rendered


def test_invalid_provider_id_rejected(empty_client: TestClient) -> None:
    r = empty_client.put(
        "/api/v1/models-policy/credentials/BadProvider!",
        json={"api_key": SENTINEL_KEY},
    )
    assert r.status_code == 422
