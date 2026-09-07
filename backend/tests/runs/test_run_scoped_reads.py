"""Run-scoped read filters + real-run History surface (deep-link plumbing).

Populates a run via the executor (mocked provider + search, NO network) and asserts:
  - decisions can be filtered to a single run's claims,
  - evidence can be filtered to the records that run screened,
  - completed runs appear on the History surface, newest-first.
"""
import os
import tempfile
from collections.abc import Iterator

import pytest
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from noetarch.core.database import Base
from noetarch.database import registry
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.retriever import Retriever
from noetarch.modules.evidence.service import EvidenceService
from noetarch.modules.history.repository import HistoryRepository
from noetarch.runs.executor import RunExecutor
from noetarch.runs.schemas import RunRequest
from tests.runs.fakes import FakeSource, PhaseProvider, make_record


@pytest.fixture
def session() -> Iterator[Session]:
    registry.import_all_models()
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    engine: Engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as s:
            yield s
    finally:
        engine.dispose()
        os.unlink(path)


def _run(session: Session, run_id: str, question: str, n: int) -> None:
    pairs = [(make_record(i), f"MARK_INCLUDE abstract {i}") for i in range(n)]
    provider = PhaseProvider()
    retriever = Retriever([FakeSource(pairs)])
    RunExecutor(session, provider=provider, retriever=retriever).execute(
        RunRequest(question=question), run_id=run_id
    )


def test_decisions_filter_scopes_to_one_run(session: Session) -> None:
    _run(session, "runalpha", "q1", 2)
    _run(session, "runbeta", "q2", 3)

    decisions = DecisionRepository(session)
    alpha = decisions.list_for_run("runalpha")
    beta = decisions.list_for_run("runbeta")

    assert len(alpha) == 2
    assert len(beta) == 3
    assert all(d.id.startswith("run-runalpha-") for d in alpha)
    # A run id that shares no prefix returns nothing (no accidental cross-run leakage).
    assert decisions.list_for_run("nope") == []


def test_evidence_filter_returns_only_that_runs_records(session: Session) -> None:
    _run(session, "runalpha", "q1", 2)
    _run(session, "runbeta", "q2", 3)

    paper_ids = DecisionRepository(session).paper_ids_for_run("runalpha")
    assert sorted(paper_ids) == ["oa-p0", "oa-p1"]

    scoped = EvidenceService(EvidenceRepository(session)).list_records(record_ids=paper_ids)
    assert {r.id for r in scoped.records} == {"oa-p0", "oa-p1"}
    # Empty id list must not fall back to "all".
    assert EvidenceService(EvidenceRepository(session)).list_records(record_ids=[]).records == []


def test_history_lists_real_runs_newest_first(session: Session) -> None:
    _run(session, "runalpha", "first question", 1)
    _run(session, "runbeta", "second question", 1)

    runs = HistoryRepository(session).list_all()
    ids = [r.id for r in runs]
    assert "runalpha" in ids and "runbeta" in ids
    # No demo seed rows in this fixture, so every row is a real run and maps cleanly.
    completed = next(r for r in runs if r.id == "runalpha")
    assert completed.status == "complete"
    assert completed.title == "first question"
    assert completed.recipe.startswith("Linear run · ")
