"""History router — GET /api/v1/history (list of past/active runs).

Security controls:
  - Read-only GET; no path/query params, so no injection surface on this route.
  - No per-run detail-by-id route: run IDs are display strings containing a middot
    ("0f3a·91"), not URL-safe slugs. Exposing them as path params would require
    accepting non-ASCII input; per-run detail is deferred instead (smaller attack surface).
  - Replay is NOT exposed as an endpoint — it stays local/simulated in the frontend.
    No mutation endpoints in this milestone.
  - No internal model fields, stack traces, or seed details in the response.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
  - No external egress; all data is in-process seed.
"""
from fastapi import APIRouter

from noetarch.modules.history.repository import HistoryRepository
from noetarch.modules.history.schemas import HistoryRun
from noetarch.modules.history.service import HistoryService

router = APIRouter(tags=["history"])

_service = HistoryService(HistoryRepository())


@router.get("", response_model=list[HistoryRun])
def list_runs() -> list[HistoryRun]:
    """List recent runs (active and past) for the History & replay screen."""
    return _service.list_runs()
