"""Alembic environment.

The DB URL is taken from an explicit ``sqlalchemy.url`` option if provided (e.g. by
tests), otherwise from application settings (env-driven). No connection string is
hard-coded here.
"""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from noetarch.core.config import get_settings
from noetarch.core.database import Base
from noetarch.database import registry

# Register all ORM tables on Base.metadata.
registry.import_all_models()

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _get_url() -> str:
    return config.get_main_option("sqlalchemy.url") or get_settings().database_url


def run_migrations_offline() -> None:
    context.configure(
        url=_get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    section = config.get_section(config.config_ini_section) or {}
    section["sqlalchemy.url"] = _get_url()
    connectable = engine_from_config(
        section, prefix="sqlalchemy.", poolclass=pool.NullPool
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
