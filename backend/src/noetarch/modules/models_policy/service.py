"""ModelsPolicy service — orchestration between router and repository."""
from noetarch.modules.models_policy.repository import ModelsPolicyRepository
from noetarch.modules.models_policy.schemas import PolicyProvider


class ModelsPolicyService:
    def __init__(self, repo: ModelsPolicyRepository) -> None:
        self._repo = repo

    def list_providers(self) -> list[PolicyProvider]:
        return self._repo.list_all()

    def get_provider(self, provider_id: str) -> PolicyProvider | None:
        return self._repo.get_by_id(provider_id)
