"""Repository for encrypted provider credentials. All queries are parameterized (ORM)."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from noetarch.modules.credentials.infrastructure.models import ProviderCredentialORM


class CredentialRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get(self, provider: str) -> ProviderCredentialORM | None:
        return self._session.get(ProviderCredentialORM, provider)

    def list_all(self) -> list[ProviderCredentialORM]:
        return list(
            self._session.execute(
                select(ProviderCredentialORM).order_by(ProviderCredentialORM.provider)
            )
            .scalars()
            .all()
        )

    def delete(self, provider: str) -> bool:
        row = self._session.get(ProviderCredentialORM, provider)
        if row is None:
            return False
        self._session.delete(row)
        return True
