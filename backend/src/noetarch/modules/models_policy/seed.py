"""In-process seed for the ModelsPolicy surface.

Ported exactly from frontend/src/data/ModelsPolicy/ModelsPolicy-data.ts.
No network, no file I/O. Toggling providers / cost / routing stays local/simulated
in the UI; no mutation endpoints exist in this milestone.
"""
from noetarch.modules.models_policy.schemas import PolicyProvider

SEED_PROVIDERS: list[PolicyProvider] = [
    PolicyProvider(
        id="anthropic",
        name="Anthropic Claude",
        type="cloud",
        status="available",
        enabled=True,
        dailyCostLimit=2.0,
        dataRetention="Zero retention (API ToS § 3.1 — data not used for training)",
        egressPolicy="explicit-approval",
        capabilities=["abstract-screening", "evidence-synthesis", "query-generation"],
        routingPreference="prefer-local-fallback",
        requiresApproval=True,
    ),
    PolicyProvider(
        id="openai",
        name="OpenAI GPT",
        type="cloud",
        status="available",
        enabled=False,
        dailyCostLimit=1.0,
        dataRetention="30 days (default) — opt-out available",
        egressPolicy="explicit-approval",
        capabilities=["abstract-screening", "query-generation"],
        routingPreference="disabled",
        requiresApproval=True,
    ),
    PolicyProvider(
        id="on-device",
        name="On-device model",
        type="local",
        status="available",
        enabled=True,
        dailyCostLimit=None,
        dataRetention="Not applicable — all processing stays on device",
        egressPolicy="none",
        capabilities=["query-generation", "deduplication", "clustering"],
        routingPreference="prefer",
        requiresApproval=False,
    ),
    PolicyProvider(
        id="ollama",
        name="Ollama (local LLM)",
        type="local",
        status="down",
        statusNote="Ollama not running — start with: ollama serve",
        enabled=True,
        dailyCostLimit=None,
        dataRetention="Not applicable — all processing stays on device",
        egressPolicy="none",
        capabilities=["abstract-screening", "query-generation"],
        routingPreference="prefer",
        requiresApproval=False,
    ),
]
