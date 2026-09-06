"""FastAPI dependencies for the Evidence external-source path (M9).

Kept small and overridable so tests can (a) flip the feature flag and (b) substitute a
fake provider — guaranteeing no real network in CI.
"""
from typing import Protocol

from noetarch.core.config import get_settings
from noetarch.core.egress import EgressClient
from noetarch.modules.evidence.infrastructure.openalex import OpenAlexProvider
from noetarch.modules.evidence.schemas import EvidenceRecord


class EvidenceProvider(Protocol):
    def search(self, query: str) -> list[EvidenceRecord]: ...


def external_sources_enabled() -> bool:
    return get_settings().external_sources_enabled


def get_evidence_provider() -> EvidenceProvider:
    settings = get_settings()
    egress = EgressClient(contact_email=settings.egress_contact_email)
    return OpenAlexProvider(egress, contact_email=settings.egress_contact_email)
