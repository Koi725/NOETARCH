"""API v1 aggregate router."""
from fastapi import APIRouter

from noetarch.api.v1 import health
from noetarch.modules.evidence.router import router as evidence_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, prefix="/health")
api_router.include_router(evidence_router, prefix="/evidence")
