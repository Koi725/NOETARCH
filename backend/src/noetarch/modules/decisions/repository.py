"""In-process Decisions repository. No database, no network, no file I/O."""
from noetarch.modules.decisions.schemas import Decision
from noetarch.modules.decisions.seed import SEED_DECISIONS


class DecisionRepository:
    def list_all(self) -> list[Decision]:
        return list(SEED_DECISIONS)

    def get_by_id(self, decision_id: str) -> Decision | None:
        return next((d for d in SEED_DECISIONS if d.id == decision_id), None)
