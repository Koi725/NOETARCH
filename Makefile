# NOETARCH developer entry points.
.PHONY: dev up down smoke gates

# One-command local dev (backend auto-migrate+seed + frontend, pre-wired). No API key needed.
dev:
	./scripts/dev.sh

# One-command containerized startup.
up:
	docker compose up --build

down:
	docker compose down

# Offline connector smoke (read + Decisions write/audit + mocked OpenAlex search).
smoke:
	cd backend && uv run pytest tests/test_connector_smoke.py -v

# All quality gates.
gates:
	cd backend && uv run ruff check . && uv run mypy && uv run pytest
	cd frontend && npm run lint && npm run type-check && npm run test && npm run build
