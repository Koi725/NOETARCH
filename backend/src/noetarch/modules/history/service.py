"""History service — orchestration between router and repository."""
from noetarch.modules.history.repository import HistoryRepository
from noetarch.modules.history.schemas import HistoryRun


class HistoryService:
    def __init__(self, repo: HistoryRepository) -> None:
        self._repo = repo

    def list_runs(self) -> list[HistoryRun]:
        return self._repo.list_all()
