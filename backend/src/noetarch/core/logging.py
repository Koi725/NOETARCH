"""Minimal structured logging setup. Secrets/PII must never be logged.

A defensive redaction filter scrubs anything that looks like a provider API key from
every log record as a second line of defence — the first being that we never pass key
material to the logger at all.
"""
import logging
import re
import sys

# Matches common provider key shapes, e.g. "sk-ant-api03-...." or "sk-....". Conservative:
# requires the sk- prefix plus a reasonably long tail so ordinary text is untouched.
_KEY_PATTERN = re.compile(r"sk-[A-Za-z0-9._-]{12,}")
_REDACTED = "sk-***REDACTED***"


def _scrub(value: str) -> str:
    return _KEY_PATTERN.sub(_REDACTED, value)


class RedactSecretsFilter(logging.Filter):
    """Redact API-key-like substrings from the log message and its args."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = _scrub(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {
                    k: _scrub(v) if isinstance(v, str) else v
                    for k, v in record.args.items()
                }
            else:
                record.args = tuple(
                    _scrub(a) if isinstance(a, str) else a for a in record.args
                )
        return True


def configure_logging(level: int = logging.INFO) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    )
    handler.addFilter(RedactSecretsFilter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level)
