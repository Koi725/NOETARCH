"""PICO criteria derivation: strict parsing + safe degrade (no network)."""
from noetarch.modules.providers.base import CompletionResult
from noetarch.modules.providers.criteria import (
    build_criteria_prompt,
    derive_criteria,
    parse_criteria_output,
)


class _ScriptedProvider:
    model = "fake-model"

    def __init__(self, text: str) -> None:
        self._text = text

    def complete(self, *, system: str, user: str, max_tokens: int) -> CompletionResult:
        return CompletionResult(text=self._text, input_tokens=3, output_tokens=4)


def test_valid_criteria_parse_and_render() -> None:
    crit = parse_criteria_output(
        '{"population": "adults with T2D", "intervention": "fasting", "comparator": "usual", '
        '"outcome": "HbA1c", "include": ["RCT"], "exclude": ["case report"]}',
        input_tokens=1, output_tokens=1,
    )
    assert crit.off_schema is False and not crit.is_empty()
    block = crit.as_prompt_block()
    assert "Population: adults with T2D" in block
    assert "Include if: RCT" in block and "Exclude if: case report" in block


def test_off_schema_degrades_to_empty_flagged() -> None:
    crit = parse_criteria_output("garbage", input_tokens=1, output_tokens=1)
    assert crit.off_schema is True and crit.is_empty()


def test_question_is_fenced() -> None:
    system, user = build_criteria_prompt("does X reduce Y?")
    assert "untrusted" in system.lower()
    assert "<<<QUESTION " in user


def test_provider_failure_degrades() -> None:
    class _Boom:
        model = "fake"

        def complete(self, *, system: str, user: str, max_tokens: int) -> CompletionResult:
            raise RuntimeError("down")

    crit = derive_criteria(_Boom(), "q")
    assert crit.off_schema is True and crit.is_empty()
