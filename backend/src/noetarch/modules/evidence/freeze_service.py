"""Fetch-and-freeze: persist externally-fetched Evidence records with provenance.

The freeze is the reproducibility guarantee: fetched records are written to the DB with
their ``source`` and ``retrievedAt``, deduplicated by DOI, and a fetch audit entry is
written **in the same transaction** (atomic — a freeze can never exist without its audit
record). All writes are parameterized via the ORM.
"""
import hashlib

from sqlalchemy.orm import Session

from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.evidence.repository import EvidenceRepository
from noetarch.modules.evidence.schemas import EvidenceRecord

ENTITY_TYPE = "evidence"
DEFAULT_ACTOR = "local-user"


class FreezeResult:
    def __init__(self, frozen: list[EvidenceRecord], deduplicated: int) -> None:
        self.frozen = frozen
        self.deduplicated = deduplicated


class EvidenceFreezeService:
    def __init__(
        self, session: Session, evidence: EvidenceRepository, audit: AuditRepository
    ) -> None:
        self._session = session
        self._evidence = evidence
        self._audit = audit

    def freeze(
        self,
        records: list[EvidenceRecord],
        *,
        query: str,
        source: str,
        actor: str = DEFAULT_ACTOR,
        request_id: str | None = None,
    ) -> FreezeResult:
        seen_dois = self._evidence.existing_dois()
        seen_ids: set[str] = set()
        frozen: list[EvidenceRecord] = []
        deduplicated = 0
        next_sort = self._evidence.next_sort_order()

        for record in records:
            doi_key = record.doi.lower() if record.doi else None
            if doi_key is not None and doi_key in seen_dois:
                deduplicated += 1
                continue
            if record.id in seen_ids or self._evidence.id_exists(record.id):
                deduplicated += 1
                continue
            self._evidence.add_record(record, sort_order=next_sort)
            next_sort += 1
            seen_ids.add(record.id)
            if doi_key is not None:
                seen_dois.add(doi_key)
            frozen.append(record)

        # Audit the fetch in the SAME transaction as the inserts (atomic).
        self._audit.append(
            entity_type=ENTITY_TYPE,
            entity_id=f"search:{source}",
            action="fetch",
            actor=actor,
            from_status=None,
            to_status=f"frozen={len(frozen)};deduped={deduplicated}",
            request_id=request_id,
            payload_hash=hashlib.sha256(f"{source}|{query}".encode()).hexdigest(),
        )
        self._session.commit()
        return FreezeResult(frozen=frozen, deduplicated=deduplicated)
