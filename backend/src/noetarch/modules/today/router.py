"""Today router — GET /api/v1/today (single workspace snapshot).

Security controls:
  - Read-only GET; no path/query params, so no injection surface on this route.
  - No internal model fields, stack traces, or seed details in the response.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
  - No external egress; all data is in-process seed.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.modules.today.repository import TodayRepository
from noetarch.modules.today.schemas import TodayData
from noetarch.modules.today.service import TodayService

router = APIRouter(tags=["today"])


@router.get("", response_model=TodayData)
def get_today(session: Session = Depends(get_session)) -> TodayData:
    """Return the current workspace snapshot for the Today screen."""
    return TodayService(TodayRepository(session)).get_today()
