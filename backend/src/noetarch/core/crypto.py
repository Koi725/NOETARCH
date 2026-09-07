"""Encryption at rest for BYOK provider keys (Fernet / ``cryptography``).

The master key comes from ``NOETARCH_SECRET_KEY`` when set; otherwise a key is generated
once and persisted to ``secret_key_path`` with 0600 permissions and reused on later boots.

Security notes:
  - The master key is never logged, returned by any endpoint, or written to the audit log.
  - Losing the master key makes every stored provider key permanently unreadable. The
    key-in-volume posture is a documented pre-deploy caveat (PRE_DEPLOY_GATES.md): a hosted
    deployment should mount the key from a secrets manager, not bake it into the image.
  - Ciphertext (the Fernet token) is safe to store in the DB; plaintext keys live only in
    process memory for the duration of an outbound provider call.
"""
import os
from functools import lru_cache
from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken

from noetarch.core.config import get_settings


class MasterKeyError(RuntimeError):
    """Raised when the master key cannot be loaded or generated."""


class SecretDecryptError(RuntimeError):
    """Raised when a stored ciphertext cannot be decrypted (wrong/rotated master key)."""


def _load_or_create_master_key(env_key: str, key_path: str) -> bytes:
    """Return the Fernet master key bytes, generating + persisting one if needed."""
    if env_key:
        key = env_key.encode("utf-8")
        _validate_fernet_key(key)
        return key
    path = Path(key_path)
    if path.exists():
        key = path.read_bytes().strip()
        _validate_fernet_key(key)
        return key
    # Generate once and persist with owner-only permissions (0600). O_EXCL avoids a race.
    key = Fernet.generate_key()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        fd = os.open(str(path), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        try:
            os.write(fd, key)
        finally:
            os.close(fd)
    except FileExistsError:
        # A concurrent process created it first — read that one back.
        key = path.read_bytes().strip()
        _validate_fernet_key(key)
    except OSError as exc:  # pragma: no cover - environment-specific
        raise MasterKeyError("Could not create the master key file.") from exc
    return key


def _validate_fernet_key(key: bytes) -> None:
    try:
        Fernet(key)
    except (ValueError, TypeError) as exc:
        raise MasterKeyError("Configured master key is not a valid Fernet key.") from exc


class SecretBox:
    """Symmetric encrypt/decrypt for short secrets (provider API keys)."""

    def __init__(self, master_key: bytes) -> None:
        self._fernet = Fernet(master_key)

    def encrypt(self, plaintext: str) -> str:
        return self._fernet.encrypt(plaintext.encode("utf-8")).decode("ascii")

    def decrypt(self, token: str) -> str:
        try:
            return self._fernet.decrypt(token.encode("ascii")).decode("utf-8")
        except (InvalidToken, ValueError) as exc:
            # Never include the token or key in the message.
            raise SecretDecryptError("Stored secret could not be decrypted.") from exc


@lru_cache
def get_secret_box() -> SecretBox:
    """Process-wide SecretBox built from settings (master key from env or key file)."""
    settings = get_settings()
    master_key = _load_or_create_master_key(settings.secret_key, settings.secret_key_path)
    return SecretBox(master_key)
