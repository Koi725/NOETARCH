"""Linear run executor: question → search → freeze → screen → write evidence+decision+audit.

Design:
  - Dependencies are injected (``provider``, ``search_fn``) so tests run with a mocked
    provider and mocked search — NO real network in tests.
  - Budget guard: a running USD cost is tracked; when it reaches the cap the run halts
    cleanly with status ``halted_budget`` (the budget-exhausted state) instead of failing.
  - Prompt-injection hardening lives in the screening layer; here we only ever STORE the
    model's output as a provenance-tagged pending Decision (a claim). Nothing the model
    emits drives a tool call or any side effect.
  - Idempotent + replayable: decision ids are deterministic (``run-{run_id}-{paper_id}``).
    On replay, already-written decisions are recomputed from their stored claim — no
    provider call, no new cost — so the counters reproduce exactly.
"""
import json
import uuid
from collections.abc import Callable
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.decisions.infrastructure.models import DecisionORM
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.evidence.freeze_service import EvidenceFreezeService
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import EvidenceRecord
from noetarch.modules.providers.anthropic_provider import cost_usd
from noetarch.modules.providers.base import CompletionProvider
from noetarch.modules.providers.screening import screen_abstract
from noetarch.runs.models import RunORM
from noetarch.runs.schemas import RunRequest, RunResult, RunStatus

SearchFn = Callable[[str], list[tuple[EvidenceRecord, str]]]

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


class RunExecutor:
    def __init__(
        self,
        session: Session,
        *,
        provider: CompletionProvider,
        search_fn: SearchFn,
        actor: str = DEFAULT_ACTOR,
    ) -> None:
        self._session = session
        self._provider = provider
        self._search_fn = search_fn
        self._actor = actor
        self._decisions = DecisionRepository(session)

    def execute(self, request: RunRequest, *, run_id: str | None = None) -> RunResult:
        run_id = run_id or uuid.uuid4().hex
        created_at = datetime.now(tz=UTC).isoformat()

        pairs = self._search_fn(request.question)
        pairs = self._apply_year_filter(pairs, request.year_from, request.year_to)
        pairs = pairs[: request.max_results]

        freeze = EvidenceFreezeService(
            self._session, EvidenceRepository(self._session), AuditRepository(self._session)
        )
        freeze_result = freeze.freeze(
            [record for record, _ in pairs],
            query=request.question,
            source="openalex",
            actor=self._actor,
        )

        counters = _Counters()
        status: RunStatus = "completed"
        for record, abstract in pairs:
            if request.budget_usd is not None and counters.cost_usd >= request.budget_usd:
                status = "halted_budget"
                break
            self._screen_one(run_id, request.question, record, abstract, counters)

        result = self._persist_run(
            run_id=run_id,
            request=request,
            status=status,
            frozen=len(freeze_result.frozen),
            deduplicated=freeze_result.deduplicated,
            counters=counters,
            created_at=created_at,
        )
        return result

    # ── internals ───────────────────────────────────────────────────────────────

    @staticmethod
    def _apply_year_filter(
        pairs: list[tuple[EvidenceRecord, str]], year_from: int | None, year_to: int | None
    ) -> list[tuple[EvidenceRecord, str]]:
        if year_from is None and year_to is None:
            return pairs
        kept: list[tuple[EvidenceRecord, str]] = []
        for record, abstract in pairs:
            year = record.year
            if year <= 0:  # unknown year — excluded when a bound is set
                continue
            if year_from is not None and year < year_from:
                continue
            if year_to is not None and year > year_to:
                continue
            kept.append((record, abstract))
        return kept

    def _screen_one(
        self,
        run_id: str,
        question: str,
        record: EvidenceRecord,
        abstract: str,
        counters: _Counters,
    ) -> None:
        decision_id = f"run-{run_id}-{record.id}"
        existing = self._session.get(DecisionORM, decision_id)
        if existing is not None:
            # Replay: recompute counters from the stored claim — no provider call/cost.
            self._replay_existing(existing, counters)
            return

        result = screen_abstract(self._provider, question, abstract)
        call_cost = cost_usd(self._provider.model, result.input_tokens, result.output_tokens)
        counters.input_tokens += result.input_tokens
        counters.output_tokens += result.output_tokens
        counters.cost_usd += call_cost
        counters.record_decision(result.decision, result.off_schema)

        # Store the model output as a provenance-tagged PENDING claim — never executed.
        claim = {
            "run_id": run_id,
            "paper_id": record.id,
            "decision": result.decision,
            "reason": result.reason,
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
            time="",
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

    @staticmethod
    def _replay_existing(existing: DecisionORM, counters: _Counters) -> None:
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
        self._session.commit()
        return RunResult(
            id=run_id,
            status=status,
            question=request.question,
            provider="anthropic",
            model=self._provider.model,
            frozen=frozen,
            deduplicated=deduplicated,
            screened=counters.screened,
            included=counters.included,
            excluded=counters.excluded,
            uncertain=counters.uncertain,
            offSchema=counters.off_schema,
            inputTokens=counters.input_tokens,
            outputTokens=counters.output_tokens,
            costUsd=counters.cost_usd,
            createdAt=created_at,
            finishedAt=finished_at,
        )


def _screen_hash(run_id: str, paper_id: str, decision: str) -> str:
    import hashlib

    return hashlib.sha256(f"{run_id}|{paper_id}|{decision}".encode()).hexdigest()
