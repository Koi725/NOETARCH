"""Unit tests for EvidenceService."""
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import EvidenceListResponse
from noetarch.modules.evidence.seed import SEED_PROJECT, SEED_RECORDS
from noetarch.modules.evidence.service import EvidenceService


def _make_service() -> EvidenceService:
    return EvidenceService(EvidenceRepository())


def test_list_records_returns_evidence_list_response() -> None:
    service = _make_service()
    result = service.list_records()
    assert isinstance(result, EvidenceListResponse)


def test_list_records_project_matches_seed() -> None:
    service = _make_service()
    result = service.list_records()
    assert result.project == SEED_PROJECT


def test_list_records_count_matches_seed() -> None:
    service = _make_service()
    result = service.list_records()
    assert len(result.records) == len(SEED_RECORDS)


def test_get_record_returns_known_record() -> None:
    service = _make_service()
    record = service.get_record("rec-2")
    assert record is not None
    assert record.id == "rec-2"
    assert record.status == "conflicting"
    assert record.conflictNote is not None


def test_get_record_returns_none_for_unknown() -> None:
    service = _make_service()
    assert service.get_record("rec-not-a-real-id") is None


def test_get_record_for_missing_doi_record() -> None:
    service = _make_service()
    record = service.get_record("rec-3")
    assert record is not None
    assert record.doi is None
    assert record.missingDoi is True
    assert record.sources == []
