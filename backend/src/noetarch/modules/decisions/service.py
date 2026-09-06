"""Decisions service — orchestration between router and repository."""
from noetarch.modules.decisions.repository import DecisionRepository
from noetarch.modules.decisions.schemas import Decision


class DecisionService:
    def __init__(self, repo: DecisionRepository) -> None:
        self._repo = repo

    def list_decisions(self) -> list[Decision]:
        return self._repo.list_all()

    def get_decision(self, decision_id: str) -> Decision | None:
        return self._repo.get_by_id(decision_id)
