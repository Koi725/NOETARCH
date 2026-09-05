"""Structured error responses that never leak internals."""
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response


async def http_exception_handler(request: Request, exc: Exception) -> Response:
    status_code = exc.status_code if isinstance(exc, StarletteHTTPException) else 500
    message = exc.detail if isinstance(exc, StarletteHTTPException) else "Internal Server Error"
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {"code": status_code, "message": message, "request_id": request_id}
        },
    )
