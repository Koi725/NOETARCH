"""In-process History repository. No database, no network, no file I/O."""
from noetarch.modules.history.schemas import HistoryRun
from noetarch.modules.history.seed import SEED_RUNS


class HistoryRepository:
    def list_all(self) -> list[HistoryRun]:
        return list(SEED_RUNS)
