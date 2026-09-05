"""API v1 aggregate router."""
from fastapi import APIRouter

from noetarch.api.v1 import health

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, prefix="/health")
