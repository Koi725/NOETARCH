"""Liveness and readiness endpoints (kept separate on purpose)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from noetarch.core.database import check_connection, get_session

router = APIRouter(tags=["health"])


@router.get("/live")
def liveness() -> dict[str, str]:
    """Process is up. No dependency checks."""
    return {"status": "alive"}


@router.get("/ready")
def readiness(session: Session = Depends(get_session)) -> dict[str, str]:
    """Dependencies reachable — verifies database connectivity.

    On failure, returns a generic 503; the connection string is never surfaced.
    """
    try:
        check_connection(session)
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database not ready") from exc
    return {"status": "ready"}
