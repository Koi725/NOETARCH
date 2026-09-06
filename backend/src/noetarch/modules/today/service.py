"""Today service — orchestration between router and repository."""
from noetarch.modules.today.repository import TodayRepository
from noetarch.modules.today.schemas import TodayData


class TodayService:
    def __init__(self, repo: TodayRepository) -> None:
        self._repo = repo

    def get_today(self) -> TodayData:
        return self._repo.get()
