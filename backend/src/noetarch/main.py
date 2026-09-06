"""FastAPI application factory for the NOETARCH backend."""
import uuid
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from noetarch.api.errors import http_exception_handler
from noetarch.api.router import api_router
from noetarch.core.config import get_settings
from noetarch.core.logging import configure_logging

_MAX_REQUEST_BODY_BYTES = 1 * 1024 * 1024  # 1 MiB


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.0.1")

    # Deny-by-default CORS: only explicitly allowlisted origins.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def limit_request_body(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        content_length_raw = request.headers.get("content-length")
        if content_length_raw is not None:
            try:
                if int(content_length_raw) > _MAX_REQUEST_BODY_BYTES:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "error": {
                                "code": 413,
                                "message": "Request entity too large.",
                                "request_id": None,
                            }
                        },
                    )
            except ValueError:
                pass
        return await call_next(request)

    @app.middleware("http")
    async def add_request_id(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = request.headers.get("x-request-id") or uuid.uuid4().hex
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response

    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.include_router(api_router)
    return app


app = create_app()
