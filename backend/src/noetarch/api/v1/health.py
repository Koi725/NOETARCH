"""Liveness and readiness endpoints (kept separate on purpose)."""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/live")
def liveness() -> dict[str, str]:
    """Process is up. No dependency checks."""
    return {"status": "alive"}


@router.get("/ready")
def readiness() -> dict[str, str]:
    """Dependencies reachable. Stub until a domain (e.g. DB) is added."""
    return {"status": "ready"}
