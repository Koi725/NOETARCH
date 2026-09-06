"""The single guarded egress client — the ONLY place external network I/O may occur.

SSRF is the core threat. Mitigations enforced here (no other module may call
httpx/requests directly):

  - **Hardcoded host allowlist.** Callers pass a ``host`` that must be one of
    ``ALLOWED_HOSTS``. The app never fetches a URL supplied by a user, by request
    input, or by retrieved content — only a query *string* flows in, as a query param.
  - **HTTPS only.** The scheme is fixed to https; it is never taken from input.
  - **Private/loopback/link-local/reserved IPs are refused.** The host is resolved and
    rejected if any resolved address is non-public (defends against an allowlisted name
    pointing at internal infrastructure).
  - **No cross-host redirects.** Redirects are not auto-followed; a redirect to any host
    other than the original allowlisted host (or a non-https target) is refused.
  - **Hard timeouts, response-size cap, connection cap.** Bounded connect/read timeouts,
    a byte cap enforced while streaming, and a small connection-pool limit.
  - **Polite User-Agent** with an optional contact email (OpenAlex polite pool).
  - **Backoff on 429.**

Residual (documented in the Evidence THREAT.md): a TOCTOU gap exists between our DNS
pre-check and httpx's own resolution on connect. Pinning the validated IP for the
connection is a future hardening; the allowlist + https + no-redirect + timeouts + size
cap are the layered mitigation for this milestone.
"""
import ipaddress
import json
import socket
import time
from collections.abc import Callable, Mapping
from typing import Any

import httpx

# Hardcoded provider allowlist — NOT user-configurable, NOT read from input.
ALLOWED_HOSTS: frozenset[str] = frozenset({"api.openalex.org", "api.crossref.org"})

MAX_RESPONSE_BYTES = 5 * 1024 * 1024  # 5 MiB
CONNECT_TIMEOUT = 5.0
READ_TIMEOUT = 10.0
WRITE_TIMEOUT = 5.0
POOL_TIMEOUT = 5.0
MAX_CONNECTIONS = 4
MAX_REDIRECTS = 3
MAX_RETRIES_429 = 2
BACKOFF_BASE_SECONDS = 0.5


class EgressError(Exception):
    """Base class for all guarded-egress failures."""


class DisallowedHostError(EgressError):
    """The requested host is not on the hardcoded allowlist."""


class PrivateAddressError(EgressError):
    """The host resolves to a private/loopback/link-local/reserved address."""


class CrossHostRedirectError(EgressError):
    """The response attempted to redirect off the allowlisted host (or off https)."""


class ResponseTooLargeError(EgressError):
    """The response body exceeded the size cap."""


def _default_resolver(host: str) -> list[str]:
    infos = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    return [str(info[4][0]) for info in infos]


def _is_disallowed_ip(ip_text: str) -> bool:
    addr = ipaddress.ip_address(ip_text)
    return (
        addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_reserved
        or addr.is_multicast
        or addr.is_unspecified
    )


class EgressClient:
    """Guarded HTTPS client. Construct once; call :meth:`get_json` for external reads."""

    def __init__(
        self,
        *,
        contact_email: str = "",
        transport: httpx.BaseTransport | None = None,
        resolver: Callable[[str], list[str]] | None = None,
        sleeper: Callable[[float], None] = time.sleep,
        max_response_bytes: int = MAX_RESPONSE_BYTES,
    ) -> None:
        self._contact_email = contact_email
        self._transport = transport
        self._resolver = resolver or _default_resolver
        self._sleeper = sleeper
        self._max_response_bytes = max_response_bytes

    # ── public API ────────────────────────────────────────────────────────────

    def get_json(self, *, host: str, path: str, params: Mapping[str, str]) -> Any:
        """GET an allowlisted host+path with query params; return parsed JSON.

        ``host`` is validated against the allowlist and DNS-checked; ``path`` and
        ``params`` are provided by trusted adapter code (the query value travels as a
        param and is url-encoded — never concatenated into host or path).
        """
        self._validate_host(host)
        try:
            with self._build_client() as client:
                url = httpx.URL(scheme="https", host=host, path=path)
                return self._request_with_policy(client, url=url, params=params, origin_host=host)
        except httpx.HTTPError as exc:  # timeouts, connect errors, protocol errors
            raise EgressError(f"External request failed: {type(exc).__name__}") from exc

    # ── internals ─────────────────────────────────────────────────────────────

    def _user_agent(self) -> str:
        if self._contact_email:
            return f"NOETARCH/0.1 (mailto:{self._contact_email})"
        return "NOETARCH/0.1 (+https://noetarch.local)"

    def _build_client(self) -> httpx.Client:
        kwargs: dict[str, Any] = {
            "timeout": httpx.Timeout(
                connect=CONNECT_TIMEOUT,
                read=READ_TIMEOUT,
                write=WRITE_TIMEOUT,
                pool=POOL_TIMEOUT,
            ),
            "limits": httpx.Limits(max_connections=MAX_CONNECTIONS, max_keepalive_connections=2),
            "follow_redirects": False,
            "headers": {"User-Agent": self._user_agent(), "Accept": "application/json"},
        }
        if self._transport is not None:
            kwargs["transport"] = self._transport
        return httpx.Client(**kwargs)

    def _validate_host(self, host: str) -> None:
        if host not in ALLOWED_HOSTS:
            raise DisallowedHostError(f"Host not allowlisted: {host}")
        for ip_text in self._resolver(host):
            if _is_disallowed_ip(ip_text):
                raise PrivateAddressError("Host resolves to a non-public address.")

    def _request_with_policy(
        self,
        client: httpx.Client,
        *,
        url: httpx.URL,
        params: Mapping[str, str],
        origin_host: str,
    ) -> Any:
        current = url
        current_params: Mapping[str, str] | None = params
        redirects = 0
        retries = 0
        while True:
            request = client.build_request("GET", current, params=current_params)
            response = client.send(request, stream=True)
            try:
                if response.status_code == 429:
                    if retries >= MAX_RETRIES_429:
                        raise EgressError("Rate limited (429) after retries.")
                    retries += 1
                    self._sleeper(BACKOFF_BASE_SECONDS * (2 ** (retries - 1)))
                    continue
                if response.is_redirect:
                    if redirects >= MAX_REDIRECTS:
                        raise CrossHostRedirectError("Too many redirects.")
                    current = self._validated_redirect_target(response, origin_host, current)
                    current_params = None  # the target URL already carries its own query
                    redirects += 1
                    continue
                response.raise_for_status()
                return self._read_capped(response)
            finally:
                response.close()

    def _validated_redirect_target(
        self, response: httpx.Response, origin_host: str, current: httpx.URL
    ) -> httpx.URL:
        location = response.headers.get("location")
        if not location:
            raise CrossHostRedirectError("Redirect response had no Location.")
        target = httpx.URL(location)
        if not target.is_absolute_url:
            target = current.join(location)
        if target.scheme != "https":
            raise CrossHostRedirectError("Refusing non-https redirect.")
        if target.host != origin_host or target.host not in ALLOWED_HOSTS:
            raise CrossHostRedirectError(f"Refusing cross-host redirect to {target.host!r}.")
        self._validate_host(target.host)
        return target

    def _read_capped(self, response: httpx.Response) -> Any:
        declared = response.headers.get("content-length")
        if declared is not None and declared.isdigit() and int(declared) > self._max_response_bytes:
            raise ResponseTooLargeError("Response Content-Length exceeds cap.")
        buffer = bytearray()
        for chunk in response.iter_bytes():
            buffer.extend(chunk)
            if len(buffer) > self._max_response_bytes:
                raise ResponseTooLargeError("Response body exceeded size cap while reading.")
        return json.loads(bytes(buffer))
