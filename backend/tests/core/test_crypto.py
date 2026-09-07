"""Master-key handling + Fernet round-trip for the BYOK vault."""
import stat
from pathlib import Path

import pytest
from cryptography.fernet import Fernet

from noetarch.core.crypto import MasterKeyError, SecretBox, _load_or_create_master_key


def test_roundtrip_encrypt_decrypt() -> None:
    box = SecretBox(Fernet.generate_key())
    secret = "sk-ant-test-abcdef1234567890"  # noqa: S105 - test fixture, not a real key
    token = box.encrypt(secret)
    assert token != secret  # ciphertext is not the plaintext
    assert box.decrypt(token) == secret


def test_env_key_is_used_when_set() -> None:
    key = Fernet.generate_key().decode()
    loaded = _load_or_create_master_key(key, "/nonexistent/should-not-be-used")
    assert loaded == key.encode()


def test_key_file_generated_with_0600(tmp_path: Path) -> None:
    key_path = tmp_path / "sub" / "secret.key"
    first = _load_or_create_master_key("", str(key_path))
    assert key_path.exists()
    mode = stat.S_IMODE(key_path.stat().st_mode)
    assert mode == 0o600, oct(mode)
    # Reused (not regenerated) on the next load.
    second = _load_or_create_master_key("", str(key_path))
    assert first == second


def test_invalid_env_key_raises() -> None:
    with pytest.raises(MasterKeyError):
        _load_or_create_master_key("not-a-valid-fernet-key", "/unused")
