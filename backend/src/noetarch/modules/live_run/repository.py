"""In-process LiveRun repository. No database, no network, no file I/O."""
from noetarch.modules.live_run.schemas import LiveRunData
from noetarch.modules.live_run.seed import SEED_LIVE_RUN


class LiveRunRepository:
    def get_active(self) -> LiveRunData:
        return SEED_LIVE_RUN
