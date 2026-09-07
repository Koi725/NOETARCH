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
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from noetarch.core.database import Base, get_session
from noetarch.database import registry
from noetarch.database.seeding import seed_all
from noetarch.main import app


def _seeded_engine(path: str) -> Engine:
    registry.import_all_models()
    engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        seed_all(session)
    return engine


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


# ─── Isolated, mutable database for write (M8) tests ─────────────────────────
# Mutation tests must not pollute the shared read DB used by parity/read tests,
# so each gets its own freshly-seeded database.


@pytest.fixture
def fresh_db_engine() -> Iterator[Engine]:
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    engine = _seeded_engine(path)
    try:
        yield engine
    finally:
        engine.dispose()
        os.unlink(path)


@pytest.fixture
def fresh_db_session(fresh_db_engine: Engine) -> Iterator[Session]:
    with Session(fresh_db_engine) as session:
        yield session


# ─── Empty (unseeded) database for "real mode" tests ─────────────────────────
# Schema is created but NO seed rows are inserted, mirroring NOETARCH_SEED_DEMO=false.
# Read endpoints must return HTTP 200 with a valid empty-shaped payload against this DB.


@pytest.fixture
def empty_db_engine() -> Iterator[Engine]:
    registry.import_all_models()
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)  # schema only — deliberately not seeded
    try:
        yield engine
    finally:
        engine.dispose()
        os.unlink(path)


@pytest.fixture
def empty_client(empty_db_engine: Engine, db_engine: Engine) -> Iterator[TestClient]:
    """A TestClient whose get_session points at a schema-only, unseeded DB.

    On teardown the dependency is restored to the shared read DB so later tests are
    unaffected (same restore protocol as ``write_client``).
    """

    def _empty_session() -> Iterator[Session]:
        with Session(empty_db_engine) as session:
            yield session

    def _shared_session() -> Iterator[Session]:
        with Session(db_engine) as session:
            yield session

    app.dependency_overrides[get_session] = _empty_session
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides[get_session] = _shared_session


@pytest.fixture
def write_client(fresh_db_engine: Engine, db_engine: Engine) -> Iterator[TestClient]:
    """A TestClient whose get_session points at an isolated, freshly-seeded DB.

    On teardown the dependency is restored to the shared read DB so later tests are
    unaffected. The overrides are generator functions (FastAPI's yield-dependency
    protocol), not lambdas that merely return a generator.
    """

    def _fresh_session() -> Iterator[Session]:
        with Session(fresh_db_engine) as session:
            yield session

    def _shared_session() -> Iterator[Session]:
        with Session(db_engine) as session:
            yield session

    app.dependency_overrides[get_session] = _fresh_session
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides[get_session] = _shared_session
