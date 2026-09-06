"""In-process seed for the Today surface.

Ported exactly from frontend/src/data/TodayOverview/TodayOverview-data.ts.
No network, no file I/O.
"""
from noetarch.modules.today.schemas import (
    TodayData,
    TodayFailure,
    TodayRun,
    TodayWaiting,
)

SEED_TODAY = TodayData(
    project="Human-Centric Industry 5.0 Evidence Review",
    question=(
        "How do human-centric Industry 5.0 practices affect employee well-being,"
        " job satisfaction, and performance?"
    ),
    waiting=TodayWaiting(
        title="Send 38 abstracts to Anthropic for screening",
        detail="Step 6 of 9 · this leaves your device · about $0.62 · 40 seconds · undoable",
        next="save 24 records to evidence.xlsx",
    ),
    run=TodayRun(
        title="Finding and verifying the literature",
        meta="run 0f3a·91 · started 14:02 · 8 min 12 s elapsed",
        current="Step 5 of 9 · removing duplicate papers",
        progress=54,
        kpis=[
            ("Papers", "214", ""),
            ("Duplicates", "24", ""),
            ("Spent", "$0.41", ""),
            ("Retries", "2", "warn"),
        ],
    ),
    failure=TodayFailure(
        title="Semantic Scholar didn't answer",
        body=(
            "We tried three times. The 118 papers already collected were kept, and the run"
            " carried on without that source — the gap is written into your export."
        ),
    ),
    finished=[
        ("Search plan drafted", "13:58 · on-device model", "$0.00"),
        ("Crossref details filled in", "13:41 · 96 found, 4 not found", "$0.00"),
        ("Trial screening of 20 papers", "12:20 · you stopped it at step 3", "$0.11"),
    ],
    sources=[
        ("OpenAlex", "fast", "ok"),
        ("Crossref", "fast", "ok"),
        ("Semantic Scholar", "down", "bad"),
        ("Anthropic", "allowed", "ok"),
        ("On-device model", "ready", "accent"),
    ],
    files=[
        ("evidence.candidates.csv", "183 rows · 14:05", False),
        ("search-strategy.md", "3 source queries · 13:58", False),
        ("review.bib", "waiting for your decision at step 8", True),
    ],
)
