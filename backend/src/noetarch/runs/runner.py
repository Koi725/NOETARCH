"""Wire real dependencies for a run and enforce the deny-by-default gates.

A real run needs BOTH:
  - external sources enabled (``NOETARCH_EXTERNAL_SOURCES_ENABLED=true``) — all outbound
    egress (OpenAlex + Anthropic) stays behind that single flag; and
  - an enabled BYOK provider key.

If either is missing the run is unavailable — the app still runs normally, only real runs
are blocked. This keeps the "app runs with no key" invariant intact.
"""
from sqlalchemy.orm import Session

from noetarch.core.config import get_settings
from noetarch.core.egress import EgressClient
from noetarch.modules.evidence.infrastructure.crossref import CrossrefProvider
from noetarch.modules.evidence.infrastructure.openalex import OpenAlexProvider
from noetarch.modules.evidence.retriever import Retriever
from noetarch.modules.providers.factory import build_provider
from noetarch.runs.executor import RunExecutor
from noetarch.runs.schemas import RunStatus


class RunUnavailableError(Exception):
    """Raised when a gate blocks a real run. Carries a machine-readable status."""

    def __init__(self, status: RunStatus, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.message = message


def build_executor(session: Session) -> RunExecutor:
    settings = get_settings()
    if not settings.external_sources_enabled:
        raise RunUnavailableError(
            "external_sources_disabled",
            "External sources are disabled. Set NOETARCH_EXTERNAL_SOURCES_ENABLED=true to run.",
        )
    provider = build_provider(session)
    if provider is None:
        raise RunUnavailableError(
            "no_provider",
            "No enabled provider key is configured. Add one under Models & Policy first.",
        )
    egress = EgressClient(contact_email=settings.egress_contact_email)
    openalex = OpenAlexProvider(egress, contact_email=settings.egress_contact_email)
    crossref = CrossrefProvider(egress, contact_email=settings.egress_contact_email)
    retriever = Retriever([openalex, crossref])
    return RunExecutor(session, provider=provider, retriever=retriever)
