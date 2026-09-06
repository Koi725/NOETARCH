"""Imports every domain ORM module so ``Base.metadata`` is fully populated.

Import side effects register the tables. Call :func:`import_all_models` (or simply
import this module) before ``create_all`` / Alembic autogenerate / migrations.
"""
from noetarch.modules.audit.infrastructure import models as audit_models
from noetarch.modules.decisions.infrastructure import models as decisions_models
from noetarch.modules.evidence.infrastructure import models as evidence_models
from noetarch.modules.guided_review.infrastructure import models as guided_review_models
from noetarch.modules.history.infrastructure import models as history_models
from noetarch.modules.live_run.infrastructure import models as live_run_models
from noetarch.modules.models_policy.infrastructure import models as models_policy_models
from noetarch.modules.recipes.infrastructure import models as recipes_models
from noetarch.modules.today.infrastructure import models as today_models

_ALL_MODEL_MODULES = (
    evidence_models,
    today_models,
    live_run_models,
    decisions_models,
    guided_review_models,
    recipes_models,
    history_models,
    models_policy_models,
    audit_models,
)


def import_all_models() -> None:
    """No-op entry point; importing this module already registered all tables."""
    return None
