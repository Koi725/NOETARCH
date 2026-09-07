"""Anthropic adapter + the guarded POST path it relies on. No real network (MockTransport)."""
from collections.abc import Callable

import httpx
import pytest

from noetarch.core.egress import ALLOWED_HOSTS, DisallowedHostError, EgressClient
from noetarch.modules.providers.anthropic_provider import AnthropicProvider, cost_usd

PUBLIC_IP = "93.184.216.34"


def _egress(handler: Callable[[httpx.Request], httpx.Response]) -> EgressClient:
    return EgressClient(
        transport=httpx.MockTransport(handler),
        resolver=lambda _h: [PUBLIC_IP],
        sleeper=lambda _s: None,
    )


def test_anthropic_host_is_allowlisted() -> None:
    assert "api.anthropic.com" in ALLOWED_HOSTS


def test_post_json_refuses_non_allowlisted_host() -> None:
    def handler(_r: httpx.Request) -> httpx.Response:  # pragma: no cover
        raise AssertionError("transport must not be reached")

    with pytest.raises(DisallowedHostError):
        _egress(handler).post_json(
            host="evil.example.com", path="/v1/messages", headers={}, json_body={}
        )


def test_complete_sends_key_header_and_parses_usage() -> None:
    captured: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["host"] = request.url.host
        captured["scheme"] = request.url.scheme
        captured["x-api-key"] = request.headers.get("x-api-key", "")
        captured["version"] = request.headers.get("anthropic-version", "")
        captured["method"] = request.method
        return httpx.Response(
            200,
            json={
                "content": [{"type": "text", "text": '{"decision":"include","reason":"ok"}'}],
                "stop_reason": "end_turn",
                "usage": {"input_tokens": 42, "output_tokens": 9},
            },
        )

    provider = AnthropicProvider(
        _egress(handler), api_key="sk-ant-secret-key-1234", model="claude-haiku-4-5"
    )
    result = provider.complete(system="sys", user="usr", max_tokens=64)

    assert captured["method"] == "POST"
    assert captured["host"] == "api.anthropic.com"
    assert captured["scheme"] == "https"
    assert captured["x-api-key"] == "sk-ant-secret-key-1234"
    assert captured["version"] == "2023-06-01"
    assert result.input_tokens == 42
    assert result.output_tokens == 9
    assert '"decision":"include"' in result.text


def test_refusal_or_empty_content_parses_to_empty_text() -> None:
    def handler(_r: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"content": [], "stop_reason": "refusal", "usage": {}})

    provider = AnthropicProvider(_egress(handler), api_key="sk-x", model="claude-haiku-4-5")
    result = provider.complete(system="s", user="u", max_tokens=8)
    assert result.text == ""


def test_cost_usd_uses_model_pricing() -> None:
    # Haiku: $1 in / $5 out per MTok.
    assert cost_usd("claude-haiku-4-5", 1_000_000, 0) == pytest.approx(1.0)
    assert cost_usd("claude-haiku-4-5", 0, 1_000_000) == pytest.approx(5.0)
