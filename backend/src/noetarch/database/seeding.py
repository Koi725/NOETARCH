"""Load the canonical seed data (the per-module ``seed.py`` values) into the database.

The seed values remain the single source of truth; here they are mapped to ORM rows
and inserted. This is read-path data only — no user writes.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.decisions.infrastructure import models as decisions_models
from noetarch.modules.evidence.infrastructure import models as evidence_models
from noetarch.modules.evidence.infrastructure.models import EvidenceRecordORM
from noetarch.modules.guided_review.infrastructure import models as guided_review_models
from noetarch.modules.history.infrastructure import models as history_models
from noetarch.modules.live_run.infrastructure import models as live_run_models
from noetarch.modules.models_policy.infrastructure import models as models_policy_models
from noetarch.modules.recipes.infrastructure import models as recipes_models
from noetarch.modules.today.infrastructure import models as today_models


def is_seeded(session: Session) -> bool:
    """True if seed data appears already present (checks one representative table)."""
    return session.execute(select(EvidenceRecordORM.id).limit(1)).first() is not None


def seed_all(session: Session, *, force: bool = False) -> None:
    """Insert all domain seed rows. Idempotent unless ``force`` is set."""
    if not force and is_seeded(session):
        return
    session.add_all(evidence_models.build_seed_rows())
    session.add_all(today_models.build_seed_rows())
    session.add_all(live_run_models.build_seed_rows())
    session.add_all(decisions_models.build_seed_rows())
    session.add_all(guided_review_models.build_seed_rows())
    session.add_all(recipes_models.build_seed_rows())
    session.add_all(history_models.build_seed_rows())
    session.add_all(models_policy_models.build_seed_rows())
    session.commit()
