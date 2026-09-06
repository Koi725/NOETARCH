"""DB-backed unit tests for EvidenceRepository (seeded test database)."""
from sqlalchemy.orm import Session

from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.seed import SEED_PROJECT, SEED_RECORDS


def test_list_all_returns_all_seed_records(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
    assert len(repo.list_all()) == len(SEED_RECORDS)


def test_list_all_preserves_seed_order(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
    ids = [r.id for r in repo.list_all()]
    assert ids == [r.id for r in SEED_RECORDS]


def test_list_all_returns_fresh_lists(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
    assert repo.list_all() is not repo.list_all()


def test_get_by_id_returns_correct_record(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
    record = repo.get_by_id("rec-1")
    assert record is not None
    assert record.id == "rec-1"
    assert record.status == "checked"
    assert len(record.sources) > 0
    assert len(record.provenance) > 0


def test_get_by_id_returns_none_for_unknown(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
    assert repo.get_by_id("rec-does-not-exist") is None


def test_get_by_id_returns_none_for_empty_string(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
    assert repo.get_by_id("") is None


def test_project_name_matches_seed(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
    assert repo.project_name() == SEED_PROJECT


def test_all_records_have_required_fields(db_session: Session) -> None:
    repo = EvidenceRepository(db_session)
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
