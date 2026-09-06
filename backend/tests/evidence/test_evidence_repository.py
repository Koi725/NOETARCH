"""Unit tests for EvidenceRepository (in-process seed, no I/O)."""
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.seed import SEED_PROJECT, SEED_RECORDS


def test_list_all_returns_all_seed_records() -> None:
    repo = EvidenceRepository()
    records = repo.list_all()
    assert len(records) == len(SEED_RECORDS)


def test_list_all_returns_copy_not_reference() -> None:
    repo = EvidenceRepository()
    first = repo.list_all()
    second = repo.list_all()
    assert first is not second


def test_get_by_id_returns_correct_record() -> None:
    repo = EvidenceRepository()
    record = repo.get_by_id("rec-1")
    assert record is not None
    assert record.id == "rec-1"
    assert record.status == "checked"
    assert len(record.sources) > 0
    assert len(record.provenance) > 0


def test_get_by_id_returns_none_for_unknown() -> None:
    repo = EvidenceRepository()
    assert repo.get_by_id("rec-does-not-exist") is None


def test_get_by_id_returns_none_for_empty_string() -> None:
    repo = EvidenceRepository()
    assert repo.get_by_id("") is None


def test_project_name_matches_seed() -> None:
    repo = EvidenceRepository()
    assert repo.project_name() == SEED_PROJECT


def test_all_records_have_required_fields() -> None:
    repo = EvidenceRepository()
    for record in repo.list_all():
        assert record.id
        assert record.title
        assert record.authors
        assert record.year > 0
        assert record.journal
        assert record.status in ("checked", "conflicting", "cannot-check")
        assert isinstance(record.sources, list)
        assert isinstance(record.provenance, list)
        assert record.agreementCount >= 0
        assert record.totalSources >= 0
