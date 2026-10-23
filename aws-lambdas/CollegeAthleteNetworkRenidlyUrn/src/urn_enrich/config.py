from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass

DEFAULT_RENIDLY_BASE_URL = "https://renidly.com/api/v2/person/resolve-handle"
DEFAULT_METRICS_NAMESPACE = "CollegeAthleteNetwork/RenidlyUrn"
ISSUE_TEXT = "Renidly; no URN for bus_url_1"
CREATED_BY = "RenidlyUrnLambda"


class ConfigError(ValueError):
    """Raised at cold start when the environment is incomplete or invalid."""


@dataclass(frozen=True)
class Config:
    db_host: str
    db_port: int
    db_name: str
    db_secret_arn: str
    api_secret_arn: str
    universities: tuple[str, ...]
    renidly_base_url: str
    batch_size: int
    max_records_per_run: int
    safety_margin_ms: int
    min_request_interval_ms: int
    http_connect_timeout_s: float
    http_read_timeout_s: float
    metrics_namespace: str
    log_level: str


def parse_universities(raw: str) -> tuple[str, ...]:
    """Accepts a JSON array (for names containing commas) or a comma-separated list."""
    value = raw.strip()
    if value.startswith("["):
        try:
            items = json.loads(value)
        except json.JSONDecodeError as exc:
            raise ConfigError(f"UNIVERSITY_LIST is not valid JSON: {exc.msg}") from None
        if not isinstance(items, list) or not all(isinstance(item, str) for item in items):
            raise ConfigError("UNIVERSITY_LIST JSON must be an array of strings")
    else:
        items = value.split(",")
    names: list[str] = []
    for item in items:
        name = item.strip()
        if name and name not in names:
            names.append(name)
    if not names:
        raise ConfigError("UNIVERSITY_LIST must name at least one university")
    too_long = [name for name in names if len(name) > 200]
    if too_long:
        raise ConfigError(f"UNIVERSITY_LIST entries must be 200 characters or fewer: {too_long[0][:40]}...")
    return tuple(names)


def _int(env: Mapping[str, str], name: str, default: int, low: int, high: int, errors: list[str]) -> int:
    raw = env.get(name, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        errors.append(f"{name} must be an integer (got {raw!r})")
        return default
    if not low <= value <= high:
        errors.append(f"{name} must be between {low} and {high} (got {value})")
    return value


def _float(env: Mapping[str, str], name: str, default: float, low: float, high: float, errors: list[str]) -> float:
    raw = env.get(name, "").strip()
    if not raw:
        return default
    try:
        value = float(raw)
    except ValueError:
        errors.append(f"{name} must be a number (got {raw!r})")
        return default
    if not low <= value <= high:
        errors.append(f"{name} must be between {low} and {high} (got {value})")
    return value


def load_config(env: Mapping[str, str]) -> Config:
    errors: list[str] = []

    def required(name: str) -> str:
        value = env.get(name, "").strip()
        if not value:
            errors.append(f"{name} is required")
        return value

    db_host = required("DB_HOST")
    db_name = required("DB_NAME")
    db_secret_arn = required("DB_SECRET_ARN")
    api_secret_arn = required("API_SECRET_ARN")
    raw_universities = required("UNIVERSITY_LIST")

    universities: tuple[str, ...] = ()
    if raw_universities:
        try:
            universities = parse_universities(raw_universities)
        except ConfigError as exc:
            errors.append(str(exc))

    base_url = env.get("RENIDLY_BASE_URL", "").strip() or DEFAULT_RENIDLY_BASE_URL
    if not base_url.startswith("https://"):
        errors.append("RENIDLY_BASE_URL must start with https://")

    for name in ("DB_SECRET_ARN", "API_SECRET_ARN"):
        value = env.get(name, "").strip()
        if value and not value.startswith("arn:"):
            errors.append(f"{name} must be a Secrets Manager ARN")

    log_level = (env.get("LOG_LEVEL", "").strip() or "INFO").upper()
    if log_level not in {"DEBUG", "INFO", "WARNING", "ERROR"}:
        errors.append("LOG_LEVEL must be DEBUG, INFO, WARNING, or ERROR")

    config = Config(
        db_host=db_host,
        db_port=_int(env, "DB_PORT", 3306, 1, 65535, errors),
        db_name=db_name,
        db_secret_arn=db_secret_arn,
        api_secret_arn=api_secret_arn,
        universities=universities,
        renidly_base_url=base_url,
        batch_size=_int(env, "BATCH_SIZE", 20, 1, 200, errors),
        max_records_per_run=_int(env, "MAX_RECORDS_PER_RUN", 500, 1, 100_000, errors),
        safety_margin_ms=_int(env, "SAFETY_MARGIN_MS", 60_000, 0, 600_000, errors),
        min_request_interval_ms=_int(env, "MIN_REQUEST_INTERVAL_MS", 250, 0, 60_000, errors),
        http_connect_timeout_s=_float(env, "HTTP_CONNECT_TIMEOUT_S", 5.0, 0.5, 60.0, errors),
        http_read_timeout_s=_float(env, "HTTP_READ_TIMEOUT_S", 20.0, 1.0, 120.0, errors),
        metrics_namespace=env.get("METRICS_NAMESPACE", "").strip() or DEFAULT_METRICS_NAMESPACE,
        log_level=log_level,
    )
    if errors:
        raise ConfigError("Invalid configuration: " + "; ".join(errors))
    return config
