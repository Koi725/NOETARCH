"""In-process evidence repository.

Reads from the static seed; no database, no network, no file I/O.
"""
from noetarch.modules.evidence.schemas import EvidenceRecord
from noetarch.modules.evidence.seed import SEED_PROJECT, SEED_RECORDS


class EvidenceRepository:
    def list_all(self) -> list[EvidenceRecord]:
        return list(SEED_RECORDS)

    def get_by_id(self, record_id: str) -> EvidenceRecord | None:
        return next((r for r in SEED_RECORDS if r.id == record_id), None)

    def project_name(self) -> str:
        return SEED_PROJECT
