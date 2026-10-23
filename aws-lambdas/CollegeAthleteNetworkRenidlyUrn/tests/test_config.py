from __future__ import annotations

import pytest

from urn_enrich.config import DEFAULT_RENIDLY_BASE_URL, ConfigError, load_config, parse_universities


def test_defaults(env: dict[str, str]) -> None:
    config = load_config(env)
    assert config.db_port == 3306
    assert config.universities == ("Yale", "Harvard")
    assert config.renidly_base_url == DEFAULT_RENIDLY_BASE_URL
    assert config.batch_size == 20
    assert config.safety_margin_ms == 60_000


def test_missing_required_vars_are_all_reported() -> None:
    with pytest.raises(ConfigError) as info:
        load_config({})
    message = str(info.value)
    for name in ("DB_HOST", "DB_NAME", "DB_SECRET_ARN", "API_SECRET_ARN", "UNIVERSITY_LIST"):
        assert f"{name} is required" in message


@pytest.mark.parametrize(
    ("name", "value", "fragment"),
    [
        ("DB_PORT", "abc", "DB_PORT must be an integer"),
        ("DB_PORT", "70000", "DB_PORT must be between"),
        ("BATCH_SIZE", "0", "BATCH_SIZE must be between"),
        ("SAFETY_MARGIN_MS", "-1", "SAFETY_MARGIN_MS must be between"),
        ("HTTP_READ_TIMEOUT_S", "x", "HTTP_READ_TIMEOUT_S must be a number"),
        ("RENIDLY_BASE_URL", "http://renidly.com", "must start with https://"),
        ("DB_SECRET_ARN", "my-secret", "DB_SECRET_ARN must be a Secrets Manager ARN"),
        ("LOG_LEVEL", "LOUD", "LOG_LEVEL must be"),
    ],
)
def test_invalid_values(env: dict[str, str], name: str, value: str, fragment: str) -> None:
    env[name] = value
    with pytest.raises(ConfigError, match=fragment):
        load_config(env)


def test_universities_json_array_keeps_commas() -> None:
    assert parse_universities('["University of California, Berkeley", "Yale"]') == (
        "University of California, Berkeley",
        "Yale",
    )


def test_universities_trims_and_dedupes() -> None:
    assert parse_universities(" Yale , ,Harvard,Yale ") == ("Yale", "Harvard")


@pytest.mark.parametrize("raw", [" , ", "[]", '["ok", 3]', "[not json"])
def test_universities_rejects_bad_input(raw: str) -> None:
    with pytest.raises(ConfigError):
        parse_universities(raw)
