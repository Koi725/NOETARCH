"""Shared test fixtures: a seeded, temporary SQLite database.

- A session-scoped temp-file SQLite DB is created, schema built from the ORM
  metadata, and seeded with the canonical seed data.
- The app's ``get_session`` dependency is overridden to use this test DB, so every
  API/contract test runs against the seeded database.
- ``db_session`` gives repository/service tests a direct session on the same DB.
"""
import os
import tempfile
from collections.abc import Iterator

import pytest
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from noetarch.core.database import Base, get_session
from noetarch.database import registry
from noetarch.database.seeding import seed_all
from noetarch.main import app


@pytest.fixture(scope="session")
def db_engine() -> Iterator[Engine]:
    registry.import_all_models()
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        seed_all(session)
    try:
        yield engine
    finally:
        engine.dispose()
        os.unlink(path)


@pytest.fixture(scope="session", autouse=True)
def _override_get_session(db_engine: Engine) -> Iterator[None]:
    def _get_session() -> Iterator[Session]:
        with Session(db_engine) as session:
            yield session

    app.dependency_overrides[get_session] = _get_session
    try:
        yield
    finally:
        app.dependency_overrides.pop(get_session, None)


@pytest.fixture
def db_session(db_engine: Engine) -> Iterator[Session]:
    with Session(db_engine) as session:
        yield session
