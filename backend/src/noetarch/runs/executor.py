"""Linear run executor: question → plan → retrieve → freeze → criteria → screen → synthesise.

Design:
  - Dependencies are injected (``provider``, ``retriever``) so tests run with a mocked
    provider and mocked sources — NO real network in tests.
  - Single budget guard: one running USD cost spans EVERY model call (query planning,
    criteria derivation, per-abstract screening, and synthesis). When it reaches the cap the
    run halts cleanly with status ``halted_budget`` instead of failing, and later model
    stages are skipped.
  - Prompt-injection hardening lives in the model layers (planning/criteria/screening/
    synthesis); here we only ever STORE model output as provenance-tagged data — a pending
    Decision claim, or the run's criteria/synthesis columns. Nothing the model emits drives a
    tool call or any side effect.
  - Synthesis grounding is enforced in :mod:`synthesis` against the frozen included DOIs.
  - Idempotent + replayable: a run is keyed by ``run_id``. If the run row already exists the
    result is reconstructed from stored state — no provider call, no network, no new cost —
    so counters + criteria + synthesis reproduce exactly.
"""
import json
import time
import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.decisions.infrastructure.models import DecisionORM
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.evidence.dedup import RetrievedPaper
from noetarch.modules.evidence.freeze_service import EvidenceFreezeService
from noetarch.modules.evidence.query_planning import QueryPlan, fallback_plan, plan_queries
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.retriever import Retriever
from noetarch.modules.providers.anthropic_provider import cost_usd
from noetarch.modules.providers.base import CompletionProvider
from noetarch.modules.providers.criteria import Criteria, derive_criteria
from noetarch.modules.providers.screening import screen_abstract
from noetarch.modules.providers.synthesis import IncludedPaper, Synthesis, synthesize
from noetarch.runs.models import RunORM
from noetarch.runs.schemas import (
    RunCriteria,
    RunRequest,
    RunResult,
    RunStatus,
    RunSynthesis,
    RunSynthesisFinding,
)

ENTITY_TYPE = "run"
DEFAULT_ACTOR = "local-user"


class _Counters:
    def __init__(self) -> None:
        self.screened = 0
        self.included = 0
        self.excluded = 0
        self.uncertain = 0
        self.off_schema = 0
        self.input_tokens = 0
        self.output_tokens = 0
        self.cost_usd = 0.0

    def record_decision(self, decision: str, off_schema: bool) -> None:
        self.screened += 1
        if decision == "include":
            self.included += 1
        elif decision == "exclude":
            self.excluded += 1
        else:
            self.uncertain += 1
        if off_schema:
            self.off_schema += 1

    def record_model_call(self, model: str, in_tokens: int, out_tokens: int) -> float:
        self.input_tokens += in_tokens
        self.output_tokens += out_tokens
        call_cost = cost_usd(model, in_tokens, out_tokens)
        self.cost_usd += call_cost
        return call_cost


class RunExecutor:
    def __init__(
        self,
        session: Session,
        *,
        provider: CompletionProvider,
        retriever: Retriever,
        actor: str = DEFAULT_ACTOR,
    ) -> None:
        self._session = session
        self._provider = provider
        self._retriever = retriever
        self._actor = actor
        self._decisions = DecisionRepository(session)

    def execute(self, request: RunRequest, *, run_id: str | None = None) -> RunResult:
        run_id = run_id or uuid.uuid4().hex

        # Replay: a run keyed by an existing id is reconstructed from stored state — zero
        # provider calls, zero network, zero new cost. Guarantees reproducibility.
        existing_row = self._session.get(RunORM, run_id)
        if existing_row is not None:
            return result_from_row(existing_row)

        created_at = datetime.now(tz=UTC).isoformat()
        started = time.monotonic()
        budget = request.budget_usd
        counters = _Counters()

        def over_budget() -> bool:
            return budget is not None and counters.cost_usd >= budget

        # 1. Query planning (model) — budget-gated; degrade to the raw question if skipped.
        if over_budget():
            plan: QueryPlan = fallback_plan(request.question)
        else:
            plan = plan_queries(self._provider, request.question)
            counters.record_model_call(self._provider.model, plan.input_tokens, plan.output_tokens)

        # 2. Retrieval (no model): both sources → merge/dedup → rank → top-N.
        papers, deduplicated = self._retriever.retrieve(
            plan,
            question=request.question,
            year_from=request.year_from,
            year_to=request.year_to,
            max_papers=request.max_results,
        )

        # 3. Freeze the evidence with provenance (atomic with its fetch-audit row).
        freeze = EvidenceFreezeService(
            self._session, EvidenceRepository(self._session), AuditRepository(self._session)
        )
        freeze_result = freeze.freeze(
            [p.record for p in papers],
            query=request.question,
            source="retriever",
            actor=self._actor,
        )

        # 4. Derive screening criteria (model) — budget-gated.
        criteria: Criteria | None = None
        if not over_budget():
            criteria = derive_criteria(self._provider, request.question)
            counters.record_model_call(
                self._provider.model, criteria.input_tokens, criteria.output_tokens
            )
        criteria_block = criteria.as_prompt_block() if criteria else ""

        # 5. Screen each paper against the criteria (model per paper) — budget-gated.
        status: RunStatus = "completed"
        included: list[RetrievedPaper] = []
        for paper in papers:
            if over_budget():
                status = "halted_budget"
                break
            decision = self._screen_one(
                run_id, request.question, paper, criteria_block, counters, created_at
            )
            if decision == "include":
                included.append(paper)

        # 6. Grounded synthesis over the included set (model) — budget-gated.
        synthesis: Synthesis | None = None
        if included and not over_budget():
            synthesis = synthesize(
                self._provider,
                request.question,
                [
                    (
                        IncludedPaper(
                            paper_id=p.record.id, title=p.record.title, doi=p.record.doi
                        ),
                        p.abstract,
                    )
                    for p in included
                ],
            )
            counters.record_model_call(
                self._provider.model, synthesis.input_tokens, synthesis.output_tokens
            )

        elapsed_ms = int((time.monotonic() - started) * 1000)
        return self._persist_run(
            run_id=run_id,
            request=request,
            status=status,
            frozen=len(freeze_result.frozen),
            deduplicated=deduplicated + freeze_result.deduplicated,
            counters=counters,
            created_at=created_at,
            elapsed_ms=elapsed_ms,
            plan=plan,
            criteria=criteria,
            synthesis=synthesis,
        )

    # ── internals ───────────────────────────────────────────────────────────────

    def _screen_one(
        self,
        run_id: str,
        question: str,
        paper: RetrievedPaper,
        criteria_block: str,
        counters: _Counters,
        created_at: str,
    ) -> str:
        record = paper.record
        decision_id = f"run-{run_id}-{record.id}"
        existing = self._session.get(DecisionORM, decision_id)
        if existing is not None:
            return self._replay_existing(existing, counters)

        title_only = not paper.abstract.strip()
        content = paper.abstract if not title_only else (
            f"Title: {record.title}\nAuthors: {record.authors}\n"
            f"Journal: {record.journal}\nYear: {record.year}"
        )
        result = screen_abstract(
            self._provider, question, content, criteria=criteria_block, title_only=title_only
        )
        call_cost = counters.record_model_call(
            self._provider.model, result.input_tokens, result.output_tokens
        )
        counters.record_decision(result.decision, result.off_schema)

        # Store the model output as a provenance-tagged PENDING claim — never executed.
        claim = {
            "run_id": run_id,
            "paper_id": record.id,
            "decision": result.decision,
            "reason": result.reason,
            "relevance": result.relevance,
            "title_only": result.title_only,
            "off_schema": result.off_schema,
            "source": "model",
            "provider": self._provider.model,
        }
        row = DecisionORM(
            id=decision_id,
            sort_order=self._decisions.next_sort_order(),
            title=f"Screen: {record.title[:80]}",
            type="workflow-change",
            risk="low",
            payload=json.dumps(claim),
            cost=f"${call_cost:.4f}",
            time=created_at,
            reversible=True,
            detail=result.reason or "(no reason provided)",
            alternatives=[],
            status="pending",
        )
        self._decisions.add(row)
        AuditRepository(self._session).append(
            entity_type=ENTITY_TYPE,
            entity_id=run_id,
            action="screen",
            actor=f"{self._provider.model}",
            from_status=None,
            to_status=("off-schema" if result.off_schema else result.decision),
            request_id=None,
            payload_hash=_screen_hash(run_id, record.id, result.decision),
        )
        # Atomic: the decision claim and its audit row commit together, or neither.
        self._session.commit()
        return result.decision

    @staticmethod
    def _replay_existing(existing: DecisionORM, counters: _Counters) -> str:
        decision = "uncertain"
        off_schema = False
        if existing.payload:
            try:
                claim = json.loads(existing.payload)
                if isinstance(claim, dict):
                    decision = str(claim.get("decision", "uncertain"))
                    off_schema = bool(claim.get("off_schema", False))
            except (json.JSONDecodeError, ValueError):
                pass
        counters.record_decision(decision, off_schema)
        return decision

    def _persist_run(
        self,
        *,
        run_id: str,
        request: RunRequest,
        status: RunStatus,
        frozen: int,
        deduplicated: int,
        counters: _Counters,
        created_at: str,
        elapsed_ms: int,
        plan: QueryPlan,
        criteria: Criteria | None,
        synthesis: Synthesis | None,
    ) -> RunResult:
        finished_at = datetime.now(tz=UTC).isoformat()
        row = self._session.get(RunORM, run_id)
        if row is None:
            row = RunORM(id=run_id, question=request.question, created_at=created_at)
            self._session.add(row)
        row.question = request.question
        row.year_from = request.year_from
        row.year_to = request.year_to
        row.max_results = request.max_results
        row.budget_usd = request.budget_usd
        row.provider = "anthropic"
        row.model = self._provider.model
        row.status = status
        row.frozen = frozen
        row.deduplicated = deduplicated
        row.screened = counters.screened
        row.included = counters.included
        row.excluded = counters.excluded
        row.uncertain = counters.uncertain
        row.off_schema = counters.off_schema
        row.input_tokens = counters.input_tokens
        row.output_tokens = counters.output_tokens
        row.cost_usd = counters.cost_usd
        row.finished_at = finished_at
        row.elapsed_ms = elapsed_ms
        row.planned_queries = json.dumps(plan.queries)
        row.criteria = json.dumps(_criteria_payload(criteria)) if criteria else None
        row.synthesis = json.dumps(_synthesis_payload(synthesis)) if synthesis else None
        self._session.commit()
        return result_from_row(row)


def _screen_hash(run_id: str, paper_id: str, decision: str) -> str:
    import hashlib

    return hashlib.sha256(f"{run_id}|{paper_id}|{decision}".encode()).hexdigest()


def _criteria_payload(criteria: Criteria) -> dict[str, object]:
    return {
        "population": criteria.population,
        "intervention": criteria.intervention,
        "comparator": criteria.comparator,
        "outcome": criteria.outcome,
        "include": criteria.include,
        "exclude": criteria.exclude,
        "offSchema": criteria.off_schema,
    }


def _synthesis_payload(synthesis: Synthesis) -> dict[str, object]:
    return {
        "summary": synthesis.summary,
        "findings": [
            {"doi": f.doi, "title": f.title, "finding": f.finding}
            for f in synthesis.findings
        ],
        "grounded": synthesis.grounded,
        "droppedFindings": synthesis.dropped_findings,
        "redactedCitations": synthesis.redacted_citations,
        "offSchema": synthesis.off_schema,
    }


def result_from_row(row: RunORM) -> RunResult:
    """Build the API result from a persisted run row (used by the executor + the router)."""
    criteria = None
    if row.criteria:
        try:
            criteria = RunCriteria.model_validate(json.loads(row.criteria))
        except (json.JSONDecodeError, ValueError):
            criteria = None
    synthesis = None
    if row.synthesis:
        try:
            data = json.loads(row.synthesis)
            findings = [RunSynthesisFinding.model_validate(f) for f in data.get("findings", [])]
            synthesis = RunSynthesis(
                summary=data.get("summary", ""),
                findings=findings,
                grounded=bool(data.get("grounded", True)),
                droppedFindings=int(data.get("droppedFindings", 0)),
                redactedCitations=int(data.get("redactedCitations", 0)),
                offSchema=bool(data.get("offSchema", False)),
            )
        except (json.JSONDecodeError, ValueError):
            synthesis = None
    planned: list[str] = []
    if row.planned_queries:
        try:
            loaded = json.loads(row.planned_queries)
            if isinstance(loaded, list):
                planned = [str(q) for q in loaded]
        except (json.JSONDecodeError, ValueError):
            planned = []

    return RunResult(
        id=row.id,
        status=row.status,  # type: ignore[arg-type]
        question=row.question,
        provider=row.provider,
        model=row.model,
        frozen=row.frozen,
        deduplicated=row.deduplicated,
        screened=row.screened,
        included=row.included,
        excluded=row.excluded,
        uncertain=row.uncertain,
        offSchema=row.off_schema,
        inputTokens=row.input_tokens,
        outputTokens=row.output_tokens,
        costUsd=row.cost_usd,
        createdAt=row.created_at,
        finishedAt=row.finished_at,
        elapsedMs=row.elapsed_ms,
        error=row.error,
        plannedQueries=planned,
        criteria=criteria,
        synthesis=synthesis,
    )
