"""Build an LLM provider from the configured BYOK credential, or None if unavailable.

This is the single extension point for new providers. To add OpenAI (or a local model):
  1. Implement a class with a ``complete(*, system, user, max_tokens) -> CompletionResult``
     method that calls the provider's REST API **through core/egress.py** (add its host to
     ``ALLOWED_HOSTS`` first — never open sockets outside the guard).
  2. Add a branch below keyed on ``settings.llm_provider``.
The screening layer is provider-neutral, so nothing else needs to change.
"""
from sqlalchemy.orm import Session

from noetarch.core.config import get_settings
from noetarch.core.egress import EgressClient
from noetarch.modules.audit.repository import AuditRepository
from noetarch.modules.credentials.repository import CredentialRepository
from noetarch.modules.credentials.service import CredentialService
from noetarch.modules.providers.anthropic_provider import AnthropicProvider
from noetarch.modules.providers.base import CompletionProvider


def build_provider(session: Session) -> CompletionProvider | None:
    """Return a ready provider if a key is configured + enabled for the active provider.

    Returns None when no key is configured (the app then runs normally in demo/local mode —
    only real runs require a provider).
    """
    settings = get_settings()
    name = settings.llm_provider
    creds = CredentialService(session, CredentialRepository(session), AuditRepository(session))
    api_key = creds.get_plaintext(name)
    if api_key is None:
        return None
    if name == "anthropic":
        egress = EgressClient(contact_email=settings.egress_contact_email)
        return AnthropicProvider(egress, api_key=api_key, model=settings.llm_model)
    # Unknown/unsupported provider name → treat as not configured (documented stub above).
    return None
