"""In-process seed for the LiveRun surface.

Ported exactly from frontend/src/data/LiveRun/LiveRun-data.ts.
No network, no file I/O.
"""
from noetarch.modules.live_run.schemas import (
    LiveRunData,
    LiveRunDecision,
    LiveRunEvidenceCard,
    RunEvent,
    RunKPI,
    RunMeta,
    StepInspector,
    WorkflowStep,
)

SEED_LIVE_RUN = LiveRunData(
    meta=RunMeta(
        runId="0f3a·91",
        title="Human-Centric Industry 5.0 Evidence Review",
        started="14:02",
        elapsed="8 min 12 s",
    ),
    steps=[
        WorkflowStep(index=1, label="Search planning", state="done"),
        WorkflowStep(index=2, label="OpenAlex query", state="done"),
        WorkflowStep(index=3, label="Crossref enrichment", state="done"),
        WorkflowStep(
            index=4,
            label="Deduplication",
            state="partial",
            note="118 of 214 processed before Semantic Scholar failed",
        ),
        WorkflowStep(index=5, label="Semantic Scholar query", state="running"),
        WorkflowStep(index=6, label="Abstract screening", state="waiting"),
        WorkflowStep(index=7, label="Full-text retrieval", state="queued"),
        WorkflowStep(index=8, label="Evidence scoring", state="queued"),
        WorkflowStep(index=9, label="Export", state="queued"),
    ],
    stepInspector=StepInspector(
        stepIndex=5,
        label="Semantic Scholar query",
        method="Semantic Scholar API",
        locality="cloud · external",
        status="3rd attempt · timeout 12 s",
        input="214 paper DOIs",
        outputSoFar="0 of 214 enriched",
    ),
    kpis=[
        RunKPI(label="Papers", value="214"),
        RunKPI(label="Comparisons", value="47"),
        RunKPI(label="Spent", value="$0.41"),
        RunKPI(label="Retries", value="3", tone="warn"),
    ],
    events=[
        RunEvent(id="evt-1", time="14:10:12", message="Step 5 retry 3 started", kind="system"),
        RunEvent(
            id="evt-2",
            time="14:09:58",
            message=(
                "Semantic Scholar often throttles batch DOI requests over 200 items"
                " — consider splitting"
            ),
            kind="model",
        ),
        RunEvent(
            id="evt-3",
            time="14:09:45",
            message="Step 5 retry 2 timed out after 12 s",
            kind="system",
        ),
        RunEvent(
            id="evt-4",
            time="14:09:30",
            message="Step 5 retry 1 timed out after 12 s",
            kind="system",
        ),
        RunEvent(
            id="evt-5",
            time="14:09:15",
            message="Step 4 complete: 24 duplicates removed, 190 unique papers",
            kind="system",
        ),
        RunEvent(
            id="evt-6",
            time="14:08:42",
            message=(
                "Duplicate rate 11.2% is within normal range for multi-source literature search"
            ),
            kind="model",
        ),
        RunEvent(
            id="evt-7",
            time="14:08:00",
            message="Step 3 complete: 96 of 100 papers enriched via Crossref",
            kind="system",
        ),
        RunEvent(
            id="evt-8",
            time="14:07:30",
            message="Step 2 complete: 214 papers found via OpenAlex",
            kind="system",
        ),
    ],
    decisions=[
        LiveRunDecision(
            id="dec-1",
            description=(
                "Send 190 unique DOIs to Semantic Scholar — cloud, $0.00 estimated, reversible"
            ),
            kind="pending",
        ),
    ],
    evidenceCards=[
        LiveRunEvidenceCard(
            id="ev-1",
            title="Worker well-being in Industry 5.0: A systematic review",
            doi="10.1016/j.techsoc.2023.102089",
            source="OpenAlex",
            verifiedBy="OpenAlex",
        ),
        LiveRunEvidenceCard(
            id="ev-2",
            title="Human-robot collaboration and job satisfaction",
            doi="10.3390/su14031234",
            source="Crossref",
            verifiedBy="Crossref",
        ),
    ],
)
