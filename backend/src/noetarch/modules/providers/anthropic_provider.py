"""Anthropic adapter — calls the Messages REST API through the single guarded egress client.

No Anthropic SDK is used (it would open its own sockets); every byte goes through
``core/egress.py`` so all egress stays behind the one SSRF guard. The API key is passed as
the ``x-api-key`` header and is never logged (egress does not read/log headers or bodies).
"""
from typing import Any

from noetarch.core.egress import EgressClient
from noetarch.modules.providers.base import CompletionResult, ScreeningResult
from noetarch.modules.providers.screening import screen_abstract

ANTHROPIC_HOST = "api.anthropic.com"
ANTHROPIC_PATH = "/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

# Per-1M-token list prices (USD), for the LOCAL budget guard only — not billing. Source:
# the claude-api model table (verify against the pricing page before relying on exact $).
PRICING_USD_PER_MTOK: dict[str, tuple[float, float]] = {
    "claude-haiku-4-5": (1.0, 5.0),
    "claude-sonnet-4-6": (3.0, 15.0),
    "claude-opus-4-8": (5.0, 25.0),
}
_DEFAULT_PRICE = (1.0, 5.0)  # fall back to Haiku-tier if an unknown model id is configured


def cost_usd(model: str, input_tokens: int, output_tokens: int) -> float:
    in_price, out_price = PRICING_USD_PER_MTOK.get(model, _DEFAULT_PRICE)
    return (input_tokens * in_price + output_tokens * out_price) / 1_000_000


class AnthropicProvider:
    """LLM provider backed by the Anthropic Messages API (via guarded egress)."""

    def __init__(self, egress: EgressClient, *, api_key: str, model: str) -> None:
        self._egress = egress
        self._api_key = api_key
        self.model = model

    def complete(self, *, system: str, user: str, max_tokens: int) -> CompletionResult:
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        }
        body: dict[str, Any] = {
            "model": self.model,
            "max_tokens": max_tokens,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }
        raw = self._egress.post_json(
            host=ANTHROPIC_HOST, path=ANTHROPIC_PATH, headers=headers, json_body=body
        )
        return self._parse(raw)

    def screen_abstract(self, question: str, abstract: str) -> ScreeningResult:
        """Convenience: screen one abstract over this provider's ``complete()``."""
        return screen_abstract(self, question, abstract)

    @staticmethod
    def _parse(raw: Any) -> CompletionResult:
        text = ""
        if isinstance(raw, dict):
            # A safety refusal yields stop_reason="refusal" with empty/partial content;
            # treat it as empty text so the strict parser flags it off-schema → uncertain.
            content = raw.get("content")
            if isinstance(content, list):
                parts = [
                    block.get("text", "")
                    for block in content
                    if isinstance(block, dict) and block.get("type") == "text"
                ]
                text = "".join(p for p in parts if isinstance(p, str))
            usage_obj = raw.get("usage")
            usage = usage_obj if isinstance(usage_obj, dict) else {}
            input_tokens = int(usage.get("input_tokens", 0) or 0)
            output_tokens = int(usage.get("output_tokens", 0) or 0)
            return CompletionResult(
                text=text, input_tokens=input_tokens, output_tokens=output_tokens
            )
        return CompletionResult(text="", input_tokens=0, output_tokens=0)
