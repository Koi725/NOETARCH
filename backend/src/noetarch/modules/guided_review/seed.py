"""In-process seed for the GuidedReview surface.

Ported exactly from frontend/src/data/GuidedReview/GuidedReview-data.ts.
No network, no file I/O. Include/exclude decisions stay local/simulated in the UI;
no mutation endpoints exist in this milestone.
"""
from noetarch.modules.guided_review.schemas import (
    ExcludeReason,
    GuidedReviewData,
    ReviewHistoryEntry,
    ReviewPaper,
    ReviewProgress,
)

_CURRENT_PAPER = ReviewPaper(
    id="paper-23",
    index=23,
    title=(
        "The impact of automation on worker autonomy in smart manufacturing environments:"
        " A longitudinal study of 847 production workers"
    ),
    authors="Schmidt A, Kovács B, Okafor N, Williams R",
    year=2023,
    journal="Journal of Manufacturing Systems",
    doi="10.1016/j.jmansys.2023.04.012",
    abstract=(
        "This longitudinal study examines how increasing automation in smart manufacturing"
        " affects worker autonomy, skill utilization, and job satisfaction. Using survey data"
        " from 847 production workers across 12 German and Hungarian factories over 18 months,"
        " we find that higher automation correlates with reduced task variety but increased"
        " perceived control when workers received structured autonomy training. Well-being"
        " outcomes varied significantly by factory and supervisory style, suggesting contextual"
        " moderators are critical. Results challenge simple deterministic accounts of"
        " automation's effects on work quality."
    ),
    initialStatus="needs-human-review",
    initialStatusNote="Unusually long title and unclear scope match — marked for human review",
)

_NEXT_PAPERS = [
    ReviewPaper(
        id="paper-24",
        index=24,
        title="Ergonomics and well-being in Industry 5.0 assembly lines",
        authors="Torres M, Singh P",
        year=2023,
        journal="Applied Ergonomics",
        doi="10.1016/j.apergo.2023.103994",
        abstract=(
            "This study investigates ergonomic interventions and their effects on worker"
            " well-being in Industry 5.0 contexts. A mixed-methods approach combining"
            " biomechanical assessments and self-report measures was applied in four European"
            " assembly plants. Findings suggest that participatory ergonomics and human-centred"
            " automation significantly improve both physical and psychological outcomes."
        ),
        initialStatus=None,
        initialStatusNote=None,
    ),
    ReviewPaper(
        id="paper-25",
        index=25,
        title="Artificial intelligence policy frameworks for workplace well-being",
        authors="Nakamura T, Blumenthal J",
        year=2022,
        journal="AI & Society",
        doi="10.1007/s00146-022-01456-x",
        abstract=(
            "We review international AI governance documents and their treatment of worker"
            " well-being in the context of increasingly automated workplaces. Our analysis"
            " reveals that few frameworks address individual worker experience, with most"
            " focusing on macroeconomic indicators. We propose a well-being-centred AI policy"
            " template."
        ),
        initialStatus=None,
        initialStatusNote=None,
    ),
]

_EXCLUDE_REASONS = [
    ExcludeReason(id="er-1", label="Wrong population — not about knowledge workers"),
    ExcludeReason(id="er-2", label="Wrong outcome — doesn't measure well-being or satisfaction"),
    ExcludeReason(id="er-3", label="Wrong setting — manufacturing only, not Industry 5.0"),
    ExcludeReason(id="er-4", label="Insufficient methodology"),
    ExcludeReason(id="er-5", label="Language — not in English"),
    ExcludeReason(id="er-6", label="Full text not available"),
]

_PREVIOUS_DECISIONS = [
    ReviewHistoryEntry(
        id="hist-22",
        paperTitle="Human-centered design in smart factories",
        decision="include",
        reasons=[],
    ),
    ReviewHistoryEntry(
        id="hist-21",
        paperTitle="Legacy systems in Industry 4.0",
        decision="exclude",
        reasons=["Wrong setting — manufacturing only, not Industry 5.0"],
    ),
    ReviewHistoryEntry(
        id="hist-20",
        paperTitle="Employee training for collaborative robots",
        decision="include",
        reasons=[],
    ),
]

SEED_GUIDED_REVIEW = GuidedReviewData(
    project="Human-Centric Industry 5.0 Evidence Review",
    progress=ReviewProgress(reviewed=22, total=50, remaining=28),
    currentPaper=_CURRENT_PAPER,
    nextPapers=_NEXT_PAPERS,
    excludeReasons=_EXCLUDE_REASONS,
    previousDecisions=_PREVIOUS_DECISIONS,
)
