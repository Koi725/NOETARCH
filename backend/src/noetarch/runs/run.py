"""CLI entry point for the linear run executor.

Usage:
    uv run python -m noetarch.runs.run "<question>" --years 2021-2024 --max 50 --budget 2

Requires NOETARCH_EXTERNAL_SOURCES_ENABLED=true and an enabled BYOK provider key. With no
key the command prints a clear message and exits non-zero — it never crashes the app.
"""
import argparse
import sys

from sqlalchemy.orm import Session

from noetarch.core.database import Base, get_engine
from noetarch.database import registry
from noetarch.runs.runner import RunUnavailableError, build_executor
from noetarch.runs.schemas import RunRequest


def _parse_years(value: str | None) -> tuple[int | None, int | None]:
    if not value:
        return None, None
    if "-" in value:
        lo, _, hi = value.partition("-")
        return (int(lo) if lo else None, int(hi) if hi else None)
    year = int(value)
    return year, year


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="noetarch.runs.run", description="Run a linear review.")
    parser.add_argument("question", help="The research question (a string).")
    parser.add_argument("--years", default=None, help="Year range, e.g. 2021-2024 or 2023.")
    parser.add_argument("--max", dest="max_results", type=int, default=50, help="Max papers.")
    parser.add_argument("--budget", type=float, default=None, help="USD budget cap.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    year_from, year_to = _parse_years(args.years)
    request = RunRequest(
        question=args.question,
        year_from=year_from,
        year_to=year_to,
        max_results=args.max_results,
        budget_usd=args.budget,
    )

    registry.import_all_models()
    engine = get_engine()
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        try:
            executor = build_executor(session)
        except RunUnavailableError as exc:
            print(f"NOETARCH: run unavailable ({exc.status}): {exc.message}", file=sys.stderr)
            return 2
        result = executor.execute(request)

    screened_line = (
        f"  screened : {result.screened} (include={result.included} "
        f"exclude={result.excluded} uncertain={result.uncertain} off-schema={result.offSchema})"
    )
    print(
        f"NOETARCH run {result.id}: {result.status}\n"
        f"  question : {result.question}\n"
        f"  provider : {result.provider} / {result.model}\n"
        f"  evidence : frozen={result.frozen} deduped={result.deduplicated}\n"
        f"{screened_line}\n"
        f"  tokens   : in={result.inputTokens} out={result.outputTokens} "
        f" cost=${result.costUsd:.4f}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
