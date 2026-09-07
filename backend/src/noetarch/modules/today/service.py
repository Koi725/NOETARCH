"""Today service — orchestration between router and repository.

Composes the workspace snapshot with the newest real run's grounded synthesis (WS3), so the
Today screen shows the latest evidence summary. Falls back cleanly to the snapshot alone when
no real run exists yet.
"""
from noetarch.modules.today.repository import TodayRepository
from noetarch.modules.today.schemas import TodayData, TodayLatestRun
from noetarch.runs.executor import result_from_row


class TodayService:
    def __init__(self, repo: TodayRepository) -> None:
        self._repo = repo

    def get_today(self) -> TodayData:
        data = self._repo.get()
        row = self._repo.latest_run()
        if row is None:
            return data
        result = result_from_row(row)
        latest = TodayLatestRun(
            id=result.id,
            question=result.question,
            status=result.status,
            frozen=result.frozen,
            screened=result.screened,
            included=result.included,
            costUsd=result.costUsd,
            synthesis=result.synthesis,
        )
        return data.model_copy(update={"latestRun": latest})
