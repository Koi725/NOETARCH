"""Runs router — POST /api/v1/runs (start a linear run) and GET /api/v1/runs/{id}.

Security controls:
  - Body accepts only a query STRING + numeric bounds (no URLs/hosts) — no egress-steering
    surface. All outbound I/O flows through the guarded egress client.
  - Real runs are gated: external sources must be enabled AND a provider key configured;
    otherwise a 409 with a clear message (the app still serves everything else).
  - No model output drives any action; screening results are stored as pending claims.
"""
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from noetarch.core.database import get_session
from noetarch.runs.models import RunORM
from noetarch.runs.runner import RunUnavailableError, build_executor
from noetarch.runs.schemas import RunRequest, RunResult

router = APIRouter(tags=["runs"])

_RUN_ID_PATTERN = r"^[a-z0-9][a-z0-9_-]{0,127}$"


@router.post("", response_model=RunResult)
def start_run(body: RunRequest, session: Session = Depends(get_session)) -> RunResult:
    try:
        executor = build_executor(session)
    except RunUnavailableError as exc:
        raise HTTPException(status_code=409, detail=exc.message) from exc
    return executor.execute(body)


@router.get("/{run_id}", response_model=RunResult)
def get_run(
    run_id: str = Path(..., min_length=1, max_length=128, pattern=_RUN_ID_PATTERN),
    session: Session = Depends(get_session),
) -> RunResult:
    row = session.get(RunORM, run_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
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
        error=row.error,
    )
