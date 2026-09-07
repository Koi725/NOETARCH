"""Evidence service — orchestration between router and repository."""
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import EvidenceListResponse, EvidenceRecord


class EvidenceService:
    def __init__(self, repo: EvidenceRepository) -> None:
        self._repo = repo

    def list_records(self, record_ids: list[str] | None = None) -> EvidenceListResponse:
        records = (
            self._repo.list_by_ids(record_ids)
            if record_ids is not None
            else self._repo.list_all()
        )
        return EvidenceListResponse(project=self._repo.project_name(), records=records)

    def get_record(self, record_id: str) -> EvidenceRecord | None:
        return self._repo.get_by_id(record_id)
