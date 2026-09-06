"""LiveRun service — orchestration between router and repository."""
from noetarch.modules.live_run.repository import LiveRunRepository
from noetarch.modules.live_run.schemas import LiveRunData


class LiveRunService:
    def __init__(self, repo: LiveRunRepository) -> None:
        self._repo = repo

    def get_active_run(self) -> LiveRunData:
        return self._repo.get_active()
