"""SQLAlchemy ORM model + seed-row builder for the ModelsPolicy surface.

No credential/secret columns exist here — only policy metadata.
"""
from sqlalchemy import JSON, Boolean, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base
from noetarch.modules.models_policy.seed import SEED_PROVIDERS


class PolicyProviderORM(Base):
    __tablename__ = "policy_providers"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    status_note: Mapped[str | None] = mapped_column(String, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean)
    daily_cost_limit: Mapped[float | None] = mapped_column(Float, nullable=True)
    data_retention: Mapped[str] = mapped_column(String)
    egress_policy: Mapped[str] = mapped_column(String)
    capabilities: Mapped[list[str]] = mapped_column(JSON)
    routing_preference: Mapped[str] = mapped_column(String)
    requires_approval: Mapped[bool] = mapped_column(Boolean)


def build_seed_rows() -> list[PolicyProviderORM]:
    return [
        PolicyProviderORM(
            id=p.id,
            sort_order=i,
            name=p.name,
            type=p.type,
            status=p.status,
            status_note=p.statusNote,
            enabled=p.enabled,
            daily_cost_limit=p.dailyCostLimit,
            data_retention=p.dataRetention,
            egress_policy=p.egressPolicy,
            capabilities=list(p.capabilities),
            routing_preference=p.routingPreference,
            requires_approval=p.requiresApproval,
        )
        for i, p in enumerate(SEED_PROVIDERS)
    ]
