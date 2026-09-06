"""API v1 aggregate router."""
from fastapi import APIRouter

from noetarch.api.v1 import health
from noetarch.modules.decisions.router import router as decisions_router
from noetarch.modules.evidence.router import router as evidence_router
from noetarch.modules.guided_review.router import router as guided_review_router
from noetarch.modules.history.router import router as history_router
from noetarch.modules.live_run.router import router as live_run_router
from noetarch.modules.models_policy.router import router as models_policy_router
from noetarch.modules.recipes.router import router as recipes_router
from noetarch.modules.today.router import router as today_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, prefix="/health")
api_router.include_router(evidence_router, prefix="/evidence")
api_router.include_router(today_router, prefix="/today")
api_router.include_router(live_run_router, prefix="/live-run")
api_router.include_router(decisions_router, prefix="/decisions")
api_router.include_router(guided_review_router, prefix="/guided-review")
api_router.include_router(recipes_router, prefix="/recipes")
api_router.include_router(history_router, prefix="/history")
api_router.include_router(models_policy_router, prefix="/models-policy")
