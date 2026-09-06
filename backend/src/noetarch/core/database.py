"""Database engine, session management, and the declarative base.

Security notes:
  - The DB URL comes from the environment (NOETARCH_DATABASE_URL / DATABASE_URL);
    it is never hard-coded or committed. The local default is a gitignored SQLite file.
  - All queries are built with SQLAlchemy constructs (parameterized) — never raw
    string SQL. The only literal SQL is the constant readiness probe "SELECT 1".
  - `check_connection` returns a bool and never surfaces the connection string.
"""
from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session

from noetarch.core.config import get_settings


class Base(DeclarativeBase):
    """Declarative base shared by every ORM model."""


def _connect_args(url: str) -> dict[str, object]:
    # SQLite must allow cross-thread use (e.g. Starlette's threadpool / TestClient).
    if url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


@lru_cache
def get_engine() -> Engine:
    """Process-wide engine, created lazily from settings."""
    url = get_settings().database_url
    return create_engine(url, connect_args=_connect_args(url))


def get_session() -> Iterator[Session]:
    """FastAPI dependency: yield a session and always close it."""
    with Session(get_engine()) as session:
        yield session


def check_connection(session: Session) -> bool:
    """Readiness probe: True if the database answers a trivial query.

    Uses a constant literal (no interpolation). Never returns or logs the DSN.
    """
    session.execute(text("SELECT 1"))
    return True
