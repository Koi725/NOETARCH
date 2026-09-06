"""In-process Today repository. No database, no network, no file I/O."""
from noetarch.modules.today.schemas import TodayData
from noetarch.modules.today.seed import SEED_TODAY


class TodayRepository:
    def get(self) -> TodayData:
        return SEED_TODAY
