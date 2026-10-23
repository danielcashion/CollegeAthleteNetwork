from __future__ import annotations

import json
from collections.abc import Iterator

import boto3
import pytest
from moto import mock_aws

from urn_enrich import secret_store
from urn_enrich.secret_store import SecretError


@pytest.fixture
def sm(monkeypatch: pytest.MonkeyPatch) -> Iterator[object]:
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    with mock_aws():
        yield boto3.client("secretsmanager", region_name="us-east-1")


def create(sm: object, name: str, value: str) -> str:
    return sm.create_secret(Name=name, SecretString=value)["ARN"]  # type: ignore[attr-defined]


def test_db_credentials(sm: object) -> None:
    arn = create(sm, "db", json.dumps({"username": "app", "password": "s3cret", "engine": "mysql"}))
    creds = secret_store.get_db_credentials(arn)
    assert creds.username == "app"
    assert creds.password == "s3cret"
    assert "s3cret" not in repr(creds)


def test_db_credentials_missing_fields(sm: object) -> None:
    arn = create(sm, "db", json.dumps({"username": "app"}))
    with pytest.raises(SecretError, match="username and password"):
        secret_store.get_db_credentials(arn)


def test_api_key_plain_and_json(sm: object) -> None:
    plain = create(sm, "plain", "  plain-key  ")
    wrapped = create(sm, "wrapped", json.dumps({"api_key": "json-key"}))
    assert secret_store.get_api_key(plain) == "plain-key"
    assert secret_store.get_api_key(wrapped) == "json-key"


def test_api_key_json_without_field(sm: object) -> None:
    arn = create(sm, "bad", json.dumps({"key": "x"}))
    with pytest.raises(SecretError, match="api_key"):
        secret_store.get_api_key(arn)


def test_secret_is_fetched_once_per_container(sm: object) -> None:
    arn = create(sm, "plain", "first")
    assert secret_store.get_api_key(arn) == "first"
    sm.put_secret_value(SecretId=arn, SecretString="second")  # type: ignore[attr-defined]
    assert secret_store.get_api_key(arn) == "first"
    secret_store.clear_cache()
    assert secret_store.get_api_key(arn) == "second"


def test_error_messages_never_include_values(sm: object) -> None:
    arn = create(sm, "db", "not-json-but-very-secret")
    with pytest.raises(SecretError) as info:
        secret_store.get_db_credentials(arn)
    assert "very-secret" not in str(info.value)
