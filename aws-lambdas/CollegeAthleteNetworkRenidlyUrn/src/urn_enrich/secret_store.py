from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import boto3


class SecretError(RuntimeError):
    """Raised when a secret is missing or has an unexpected shape. Never includes the secret value."""


@dataclass(frozen=True)
class DbCredentials:
    username: str
    password: str

    def __repr__(self) -> str:
        return f"DbCredentials(username={self.username!r}, password='***')"


@lru_cache(maxsize=1)
def _client() -> Any:
    return boto3.client("secretsmanager")


@lru_cache(maxsize=8)
def _secret_string(arn: str) -> str:
    response = _client().get_secret_value(SecretId=arn)
    value = response.get("SecretString")
    if not value:
        raise SecretError(f"Secret {arn} has no SecretString")
    return value


def get_db_credentials(arn: str) -> DbCredentials:
    try:
        payload = json.loads(_secret_string(arn))
    except json.JSONDecodeError:
        raise SecretError(f"Secret {arn} must be JSON with username and password") from None
    username = payload.get("username") if isinstance(payload, dict) else None
    password = payload.get("password") if isinstance(payload, dict) else None
    if not isinstance(username, str) or not isinstance(password, str) or not username or not password:
        raise SecretError(f"Secret {arn} must contain non-empty username and password")
    return DbCredentials(username=username, password=password)


def get_api_key(arn: str) -> str:
    """Accepts a plain-string secret or JSON with an api_key field."""
    raw = _secret_string(arn).strip()
    if raw.startswith("{"):
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            raise SecretError(f"Secret {arn} looks like JSON but does not parse") from None
        key = payload.get("api_key") if isinstance(payload, dict) else None
        if not isinstance(key, str) or not key.strip():
            raise SecretError(f"Secret {arn} must contain a non-empty api_key")
        return key.strip()
    if not raw:
        raise SecretError(f"Secret {arn} is empty")
    return raw


def clear_cache() -> None:
    _secret_string.cache_clear()
    _client.cache_clear()
