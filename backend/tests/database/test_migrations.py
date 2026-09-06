"""The Alembic initial migration applies cleanly and matches the ORM metadata."""
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from noetarch.core.database import Base
from noetarch.database import registry

_BACKEND_DIR = Path(__file__).resolve().parents[2]


def _make_config(db_url: str) -> Config:
    cfg = Config(str(_BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(_BACKEND_DIR / "alembic"))
    cfg.set_main_option("sqlalchemy.url", db_url)
    return cfg


def test_migration_applies_and_matches_models(tmp_path: Path) -> None:
    registry.import_all_models()
    db_file = tmp_path / "migration_test.db"
    url = f"sqlite:///{db_file}"

    command.upgrade(_make_config(url), "head")

    engine = create_engine(url)
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    expected_tables = set(Base.metadata.tables.keys())
    # Every ORM table exists after migration (plus alembic's own version table).
    assert expected_tables <= tables
    assert "alembic_version" in tables

    # Column names per table match the ORM metadata exactly.
    for table_name in expected_tables:
        migrated_cols = {col["name"] for col in inspector.get_columns(table_name)}
        model_cols = set(Base.metadata.tables[table_name].columns.keys())
        assert migrated_cols == model_cols, f"column mismatch for {table_name}"
    engine.dispose()


def test_migration_downgrade_removes_tables(tmp_path: Path) -> None:
    registry.import_all_models()
    db_file = tmp_path / "downgrade_test.db"
    url = f"sqlite:///{db_file}"
    cfg = _make_config(url)

    command.upgrade(cfg, "head")
    command.downgrade(cfg, "base")

    engine = create_engine(url)
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    for table_name in Base.metadata.tables:
        assert table_name not in tables
    engine.dispose()
