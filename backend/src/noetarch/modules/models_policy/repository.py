"""ModelsPolicy repository — DB-backed (SQLAlchemy), maps ORM rows to Pydantic schemas."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.models_policy.infrastructure.models import PolicyProviderORM
from noetarch.modules.models_policy.schemas import PolicyProvider


class ModelsPolicyRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[PolicyProvider]:
        rows = (
            self._session.execute(
                select(PolicyProviderORM).order_by(PolicyProviderORM.sort_order)
            )
            .scalars()
            .all()
        )
        return [self._to_schema(r) for r in rows]

    def get_by_id(self, provider_id: str) -> PolicyProvider | None:
        row = self._session.get(PolicyProviderORM, provider_id)
        return self._to_schema(row) if row is not None else None

    @staticmethod
    def _to_schema(row: PolicyProviderORM) -> PolicyProvider:
        return PolicyProvider.model_validate(
            {
                "id": row.id,
                "name": row.name,
                "type": row.type,
                "status": row.status,
                "statusNote": row.status_note,
                "enabled": row.enabled,
                "dailyCostLimit": row.daily_cost_limit,
                "dataRetention": row.data_retention,
                "egressPolicy": row.egress_policy,
                "capabilities": row.capabilities,
                "routingPreference": row.routing_preference,
                "requiresApproval": row.requires_approval,
            }
        )
