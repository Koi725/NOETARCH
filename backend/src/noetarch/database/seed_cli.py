"""Create tables (if missing) and load seed data into the configured database.

Usage:
    uv run python -m noetarch.database.seed_cli

The database URL comes from the environment (NOETARCH_DATABASE_URL / DATABASE_URL),
defaulting to a local, gitignored SQLite file. No network, no user writes.
"""
from sqlalchemy.orm import Session

from noetarch.core.database import Base, get_engine
from noetarch.database import registry
from noetarch.database.seeding import seed_all


def main() -> None:
    registry.import_all_models()
    engine = get_engine()
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        seed_all(session)
    print("NOETARCH: database schema ensured and seed data loaded.")


if __name__ == "__main__":
    main()
