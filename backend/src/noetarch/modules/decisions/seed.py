"""In-process seed for the Decisions surface.

Ported exactly from frontend/src/data/DecisionCenter/DecisionCenter-data.ts.
No network, no file I/O. Approve/reject stays local/simulated in the UI; no
mutation endpoints exist in this milestone.
"""
from noetarch.modules.decisions.schemas import Decision

SEED_DECISIONS: list[Decision] = [
    Decision(
        id="dec-001",
        title="Send 38 abstracts to Anthropic for screening",
        type="cloud-egress",
        risk="high",
        payload="38 paper abstracts · ~4 KB",
        cost="$0.62 estimated",
        time="~40 seconds",
        reversible=False,
        detail=(
            "These 38 abstracts will leave your device and be processed by Anthropic's"
            " Claude API. Anthropic's API does not retain data beyond the request lifecycle"
            " under standard terms, but data leaves your local network."
        ),
        alternatives=[
            "Screen locally with on-device model (free, ~8 minutes, lower accuracy)",
        ],
        status="pending",
    ),
    Decision(
        id="dec-002",
        title="Save 190 paper records to evidence.candidates.csv",
        type="local-file",
        risk="low",
        payload="190 rows · 47 KB",
        cost="$0.00",
        time="< 1 second",
        reversible=True,
        detail=(
            "This file will be written to ~/NOETARCH/i5-0-review/evidence.candidates.csv."
            " The file will be overwritten if it already exists. This action stays entirely"
            " on your device."
        ),
        alternatives=[],
        status="pending",
    ),
    Decision(
        id="dec-003",
        title="Skip Semantic Scholar and continue without it",
        type="workflow-change",
        risk="medium",
        cost="$0.00",
        time="immediate",
        reversible=False,
        detail=(
            "Skipping Semantic Scholar means 118 papers found there won't be included."
            " The gap will be noted in your export."
        ),
        alternatives=[],
        status="rejected",
        rejectedAt="14:08",
    ),
]
