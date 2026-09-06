"""Tests for fetch-and-freeze: DOI dedupe, provenance stamping, atomic audit."""
from sqlalchemy.orm import Session

from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.evidence.freeze_service import EvidenceFreezeService
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import EvidenceRecord, EvidenceSource


def _record(rec_id: str, doi: str | None) -> EvidenceRecord:
    return EvidenceRecord(
        id=rec_id,
        title="Fetched paper",
        authors="A B",
        year=2024,
        journal="J",
        doi=doi,
        status="checked" if doi else "cannot-check",
        sources=[EvidenceSource(name="OpenAlex", found=True, note="Retrieved from OpenAlex")],
        provenance=["Retrieved from OpenAlex on 2026-09-06T00:00:00+00:00"],
        agreementCount=1 if doi else 0,
        totalSources=1,
        missingDoi=doi is None,
        source="openalex",
        retrievedAt="2026-09-06T00:00:00+00:00",
    )


def _service(session: Session) -> EvidenceFreezeService:
    return EvidenceFreezeService(session, EvidenceRepository(session), AuditRepository(session))


def test_freeze_persists_records_with_source_and_retrieved_at(fresh_db_session: Session) -> None:
    result = _service(fresh_db_session).freeze(
        [_record("oa-new1", "10.9999/new.1")], query="q", source="openalex"
    )
    assert len(result.frozen) == 1
    stored = EvidenceRepository(fresh_db_session).get_by_id("oa-new1")
    assert stored is not None
    assert stored.source == "openalex"
    assert stored.retrievedAt == "2026-09-06T00:00:00+00:00"


def test_freeze_dedupes_against_existing_seed_doi(fresh_db_session: Session) -> None:
    # rec-1 seed DOI already present.
    result = _service(fresh_db_session).freeze(
        [_record("oa-dup", "10.1016/j.techsoc.2023.102089")], query="q", source="openalex"
    )
    assert result.frozen == []
    assert result.deduplicated == 1
    assert EvidenceRepository(fresh_db_session).get_by_id("oa-dup") is None


def test_freeze_dedupes_within_and_across_calls(fresh_db_session: Session) -> None:
    svc = _service(fresh_db_session)
    first = svc.freeze([_record("oa-a", "10.9999/a")], query="q", source="openalex")
    assert len(first.frozen) == 1
    # Same DOI again → deduped.
    second = svc.freeze([_record("oa-a2", "10.9999/a")], query="q", source="openalex")
    assert second.frozen == []
    assert second.deduplicated == 1


def test_freeze_writes_audit_entry_atomically(fresh_db_session: Session) -> None:
    _service(fresh_db_session).freeze(
        [_record("oa-x", "10.9999/x")], query="worker well-being", source="openalex"
    )
    trail = AuditRepository(fresh_db_session).list_for_entity("evidence", "search:openalex")
    assert len(trail) == 1
    assert trail[0].action == "fetch"
    assert trail[0].to_status is not None and "frozen=1" in trail[0].to_status
    assert trail[0].payload_hash  # query fingerprint recorded
