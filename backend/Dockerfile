# Backend image: installs the package + deps, then on start applies migrations (create-only),
# seeds the DB, and serves the API. No secrets are baked in; config comes from the environment.
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

COPY pyproject.toml README.md ./
COPY src ./src
COPY alembic.ini ./alembic.ini
COPY alembic ./alembic

RUN pip install --upgrade pip && pip install .

# Ensure the SQLite data dir exists (compose mounts a volume at /data).
RUN mkdir -p /data

EXPOSE 8000

# Migrate (create-only) → seed → serve.
CMD ["sh", "-c", "alembic upgrade head && python -m noetarch.database.seed_cli && uvicorn noetarch.main:app --host 0.0.0.0 --port 8000"]
