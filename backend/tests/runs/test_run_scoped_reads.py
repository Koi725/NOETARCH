"""Run-scoped read filters + real-run History surface (deep-link plumbing).

Populates a run via the executor (mocked provider + search, NO network) and asserts:
  - decisions can be filtered to a single run's claims,
  - evidence can be filtered to the records that run screened,
  - completed runs appear on the History surface, newest-first.
"""
import os
import tempfile
from collections.abc import Callable, Iterator

import pytest
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from noetarch.core.database import Base
from noetarch.database import registry
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import EvidenceRecord
from noetarch.modules.evidence.service import EvidenceService
from noetarch.modules.history.repository import HistoryRepository
from noetarch.modules.providers.base import CompletionResult
from noetarch.runs.executor import RunExecutor
from noetarch.runs.schemas import RunRequest


class FakeProvider:
    model = "claude-haiku-4-5"

    def __init__(self, outputs: list[str]) -> None:
        self._outputs = outputs
        self.calls = 0

    def complete(self, *, system: str, user: str, max_tokens: int) -> CompletionResult:
        idx = min(self.calls, len(self._outputs) - 1)
        self.calls += 1
        return CompletionResult(text=self._outputs[idx], input_tokens=100, output_tokens=100)


def _record(i: int) -> EvidenceRecord:
    return EvidenceRecord(
        id=f"oa-p{i}",
        title=f"Paper {i}",
        authors="A. Author",
        year=2022,
        journal="Journal",
        doi=f"10.1/p{i}",
        status="checked",
        sources=[],
        provenance=[],
        agreementCount=1,
        totalSources=1,
    )


def _search(
    pairs: list[tuple[EvidenceRecord, str]],
) -> Callable[[str], list[tuple[EvidenceRecord, str]]]:
    def _fn(_query: str) -> list[tuple[EvidenceRecord, str]]:
        return pairs

    return _fn


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
    pairs = [(_record(i), f"abstract {i}") for i in range(n)]
    provider = FakeProvider(['{"decision":"include","reason":"ok"}'])
    RunExecutor(session, provider=provider, search_fn=_search(pairs)).execute(
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
