"""The NOETARCH_SEED_DEMO flag gates whether demo seed rows are loaded.

- Default is on: ``Settings().seed_demo`` is True and seeding populates the DB.
- When off: the schema is still created but no seed rows are inserted (real mode).

These use an isolated temp-file SQLite DB so they never touch the shared seeded DB.
"""
import os
import tempfile
from collections.abc import Iterator

import pytest
from sqlalchemy import Engine, create_engine, func, select
from sqlalchemy.orm import Session

from noetarch.core.config import Settings
from noetarch.core.database import Base
from noetarch.database import registry
from noetarch.database.seed_cli import seed_database
from noetarch.database.seeding import is_seeded
from noetarch.modules.evidence.infrastructure.models import EvidenceRecordORM


@pytest.fixture
def empty_engine() -> Iterator[Engine]:
    """A fresh, schema-only SQLite DB with no seed rows."""
    registry.import_all_models()
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    try:
        yield engine
    finally:
        engine.dispose()
        os.unlink(path)


def _evidence_count(session: Session) -> int:
    return session.execute(select(func.count()).select_from(EvidenceRecordORM)).scalar_one()


def test_seed_demo_defaults_on() -> None:
    assert Settings().seed_demo is True


def test_seed_demo_reads_env_false(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("NOETARCH_SEED_DEMO", "false")
    assert Settings().seed_demo is False


def test_seeding_runs_when_flag_on(empty_engine: Engine) -> None:
    with Session(empty_engine) as session:
        ran = seed_database(session, seed_demo=True)
        assert ran is True
        assert is_seeded(session) is True
        assert _evidence_count(session) > 0


def test_db_empty_when_flag_off(empty_engine: Engine) -> None:
    with Session(empty_engine) as session:
        ran = seed_database(session, seed_demo=False)
        assert ran is False
        assert is_seeded(session) is False
        assert _evidence_count(session) == 0
