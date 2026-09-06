"""GuidedReview router — GET /api/v1/guided-review (current review state).

Security controls:
  - Read-only GET; no path/query params, so no injection surface on this route.
  - Include/exclude/uncertain decisions are NOT exposed as endpoints — those actions
    remain local/simulated in the frontend. No mutation endpoints in this milestone.
  - No internal model fields, stack traces, or seed details in the response.
  - CORS allowlist enforced at the app level (NOETARCH_CORS_ALLOW_ORIGINS).
  - No external egress; all data is in-process seed.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.modules.guided_review.repository import GuidedReviewRepository
from noetarch.modules.guided_review.schemas import GuidedReviewData
from noetarch.modules.guided_review.service import GuidedReviewService

router = APIRouter(tags=["guided-review"])


@router.get("", response_model=GuidedReviewData)
def get_review(session: Session = Depends(get_session)) -> GuidedReviewData:
    """Return the current guided-review state (paper, progress, reasons, history)."""
    return GuidedReviewService(GuidedReviewRepository(session)).get_review()
