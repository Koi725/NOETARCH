"""Create tables (if missing) and, unless disabled, load seed data.

Usage:
    uv run python -m noetarch.database.seed_cli

The database URL comes from the environment (NOETARCH_DATABASE_URL / DATABASE_URL),
defaulting to a local, gitignored SQLite file. No network, no user writes.

Seeding is gated by ``NOETARCH_SEED_DEMO`` (default true). When it is false the schema
is still ensured but no demo rows are inserted, yielding a clean, empty database
("real mode"). The seed code is never removed — it remains the demo data and the test
fixtures; this flag only decides whether to load it here.
"""
from sqlalchemy.orm import Session

from noetarch.core.config import get_settings
from noetarch.core.database import Base, get_engine
from noetarch.database import registry
from noetarch.database.seeding import seed_all


def seed_database(session: Session, *, seed_demo: bool) -> bool:
    """Load the demo seed rows when ``seed_demo`` is set. Returns True if it ran.

    When ``seed_demo`` is False this is a no-op — the caller has already ensured the
    schema, so the database is left clean and empty (real mode).
    """
    if not seed_demo:
        return False
    seed_all(session)
    return True


def main() -> None:
    registry.import_all_models()
    settings = get_settings()
    engine = get_engine()
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        seeded = seed_database(session, seed_demo=settings.seed_demo)
    if seeded:
        print("NOETARCH: database schema ensured and demo seed data loaded.")
    else:
        print(
            "NOETARCH: database schema ensured; real mode "
            "(NOETARCH_SEED_DEMO=false) — no seed rows loaded."
        )


if __name__ == "__main__":
    main()
