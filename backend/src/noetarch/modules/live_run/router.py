"""LiveRun router — GET /api/v1/live-run (active run snapshot).

Security controls:
  - Read-only GET; no path/query params, so no injection surface on this route.
  - Run control actions (pause/stop/retry/skip) are NOT exposed here — they remain
    local/simulated in the frontend. No mutation endpoints in this milestone.
  - No internal model fields, stack traces, or seed details in the response.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
  - No external egress; all data is in-process seed.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.modules.live_run.repository import LiveRunRepository
from noetarch.modules.live_run.schemas import LiveRunData
from noetarch.modules.live_run.service import LiveRunService

router = APIRouter(tags=["live-run"])


@router.get("", response_model=LiveRunData)
def get_active_run(session: Session = Depends(get_session)) -> LiveRunData:
    """Return the active run snapshot for the Live Run screen."""
    return LiveRunService(LiveRunRepository(session)).get_active_run()
