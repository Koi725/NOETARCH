"""In-process ModelsPolicy repository. No database, no network, no file I/O."""
from noetarch.modules.models_policy.schemas import PolicyProvider
from noetarch.modules.models_policy.seed import SEED_PROVIDERS


class ModelsPolicyRepository:
    def list_all(self) -> list[PolicyProvider]:
        return list(SEED_PROVIDERS)

    def get_by_id(self, provider_id: str) -> PolicyProvider | None:
        return next((p for p in SEED_PROVIDERS if p.id == provider_id), None)
