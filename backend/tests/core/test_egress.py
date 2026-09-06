"""Tests for the guarded egress client — proving each SSRF mitigation. No real network:
every test uses an httpx MockTransport and an injected resolver."""
import httpx
import pytest

from noetarch.core.egress import (
    CrossHostRedirectError,
    DisallowedHostError,
    EgressClient,
    EgressError,
    PrivateAddressError,
    ResponseTooLargeError,
)

PUBLIC_IP = "93.184.216.34"


def _public_resolver(host: str) -> list[str]:
    return [PUBLIC_IP]


def _client(handler: object, *, resolver: object = None, **kw: object) -> EgressClient:
    transport = httpx.MockTransport(handler)  # type: ignore[arg-type]
    return EgressClient(
        contact_email="research@example.org",
        transport=transport,
        resolver=resolver or _public_resolver,  # type: ignore[arg-type]
        sleeper=lambda _s: None,
        **kw,  # type: ignore[arg-type]
    )


def test_happy_path_returns_json_and_sends_polite_user_agent() -> None:
    seen: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["ua"] = request.headers.get("user-agent", "")
        seen["host"] = request.url.host
        seen["scheme"] = request.url.scheme
        return httpx.Response(200, json={"results": []})

    client = _client(handler)
    data = client.get_json(host="api.openalex.org", path="/works", params={"search": "x"})
    assert data == {"results": []}
    assert seen["host"] == "api.openalex.org"
    assert seen["scheme"] == "https"
    assert "mailto:research@example.org" in seen["ua"]


# ── SSRF-negative ─────────────────────────────────────────────────────────────

def test_refuses_non_allowlisted_host() -> None:
    called = {"resolver": False}

    def resolver(host: str) -> list[str]:
        called["resolver"] = True
        return [PUBLIC_IP]

    def handler(_request: httpx.Request) -> httpx.Response:  # pragma: no cover
        raise AssertionError("transport must not be reached for a disallowed host")

    client = _client(handler, resolver=resolver)
    with pytest.raises(DisallowedHostError):
        client.get_json(host="evil.example.com", path="/x", params={})
    assert called["resolver"] is False  # rejected before any DNS/network


def test_refuses_private_ip_for_allowlisted_host() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:  # pragma: no cover
        raise AssertionError("transport must not be reached when host resolves privately")

    client = _client(handler, resolver=lambda _h: ["127.0.0.1"])
    with pytest.raises(PrivateAddressError):
        client.get_json(host="api.openalex.org", path="/works", params={})


def test_refuses_link_local_and_reserved_ips() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:  # pragma: no cover
        raise AssertionError("unreachable")

    for bad_ip in ["169.254.1.1", "10.0.0.5", "192.168.1.1"]:
        client = _client(handler, resolver=lambda _h, ip=bad_ip: [ip])
        with pytest.raises(PrivateAddressError):
            client.get_json(host="api.openalex.org", path="/works", params={})


def test_refuses_cross_host_redirect() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(302, headers={"location": "https://evil.example.com/steal"})

    client = _client(handler)
    with pytest.raises(CrossHostRedirectError):
        client.get_json(host="api.openalex.org", path="/works", params={"search": "x"})


def test_refuses_non_https_redirect() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(302, headers={"location": "http://api.openalex.org/works"})

    client = _client(handler)
    with pytest.raises(CrossHostRedirectError):
        client.get_json(host="api.openalex.org", path="/works", params={"search": "x"})


def test_follows_same_host_https_redirect() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if "page2" not in str(request.url):
            return httpx.Response(
                302, headers={"location": "https://api.openalex.org/works?page2=1"}
            )
        return httpx.Response(200, json={"ok": True})

    client = _client(handler)
    data = client.get_json(host="api.openalex.org", path="/works", params={"search": "x"})
    assert data == {"ok": True}


# ── timeouts + size cap ───────────────────────────────────────────────────────

def test_timeout_is_wrapped_as_egress_error() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("slow", request=request)

    client = _client(handler)
    with pytest.raises(EgressError):
        client.get_json(host="api.openalex.org", path="/works", params={})


def test_size_cap_enforced_while_streaming() -> None:
    big = b"x" * 5000

    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=big)  # no content-length trickery needed

    client = _client(handler, max_response_bytes=1000)
    with pytest.raises(ResponseTooLargeError):
        client.get_json(host="api.openalex.org", path="/works", params={})


def test_size_cap_enforced_via_content_length_precheck() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, headers={"content-length": "9999999"}, content=b"{}")

    client = _client(handler, max_response_bytes=1000)
    with pytest.raises(ResponseTooLargeError):
        client.get_json(host="api.openalex.org", path="/works", params={})


# ── 429 backoff ───────────────────────────────────────────────────────────────

def test_backoff_retries_on_429_then_succeeds() -> None:
    calls = {"n": 0}
    slept: list[float] = []

    def handler(_request: httpx.Request) -> httpx.Response:
        calls["n"] += 1
        if calls["n"] <= 2:
            return httpx.Response(429)
        return httpx.Response(200, json={"ok": True})

    transport = httpx.MockTransport(handler)
    client = EgressClient(
        transport=transport, resolver=_public_resolver, sleeper=lambda s: slept.append(s)
    )
    data = client.get_json(host="api.openalex.org", path="/works", params={})
    assert data == {"ok": True}
    assert calls["n"] == 3
    assert len(slept) == 2  # backed off twice
