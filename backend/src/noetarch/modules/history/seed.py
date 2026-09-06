"""In-process seed for the History surface.

Ported exactly from frontend/src/data/RunHistory/RunHistory-data.ts.
No network, no file I/O. Replay stays local/simulated in the UI; no mutation
endpoints exist in this milestone.
"""
from noetarch.modules.history.schemas import HistoryRun

SEED_RUNS: list[HistoryRun] = [
    HistoryRun(
        id="0f3a·91",
        status="running",
        title="Human-Centric Industry 5.0 Evidence Review",
        recipe="Full systematic review",
        started="today 14:02",
        duration="in progress",
        cost="$0.41 so far",
        papers=214,
        providers=["OpenAlex", "Crossref", "On-device model"],
    ),
    HistoryRun(
        id="8b2c·44",
        status="complete",
        title="Human-Centric Industry 5.0 Evidence Review",
        recipe="Quick literature scan",
        started="today 12:15",
        duration="6 min 32s",
        cost="$0.00",
        papers=183,
        providers=["OpenAlex", "Crossref", "On-device model"],
        notes="Completed successfully. 183 candidates exported to evidence.candidates.csv.",
    ),
    HistoryRun(
        id="7a1d·22",
        status="interrupted",
        title="Human-Centric Industry 5.0 Evidence Review",
        recipe="Full systematic review",
        started="today 12:20",
        stoppedAt="today 12:22",
        duration="1 min 48s",
        cost="$0.11",
        papers=20,
        stopReason="Stopped by user at step 3 (abstract screening trial)",
        providers=["OpenAlex", "Crossref", "Anthropic"],
    ),
    HistoryRun(
        id="4d9f·88",
        status="failed",
        title="Climate adaptation systematic review",
        recipe="Full systematic review",
        started="yesterday 16:45",
        duration="2 min 05s",
        cost="$0.00",
        papers=0,
        failureReason=(
            "Search query returned 0 results. Check your research question and date range."
        ),
        providers=["OpenAlex", "Crossref"],
    ),
    HistoryRun(
        id="2e6b·17",
        status="partial",
        title="Remote work well-being review",
        recipe="Quick literature scan",
        started="yesterday 09:30",
        duration="4 min 12s",
        cost="$0.00",
        papers=118,
        notes=(
            "Semantic Scholar unavailable — 118 papers found via OpenAlex and Crossref only."
            " Gap noted in export."
        ),
        providers=["OpenAlex", "Crossref"],
    ),
]
