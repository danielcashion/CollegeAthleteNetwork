from __future__ import annotations

from collections.abc import Iterator

import pytest

from urn_enrich import db, handler, secret_store

BASE_ENV = {
    "DB_HOST": "db.example.us-east-1.rds.amazonaws.com",
    "DB_NAME": "can",
    "DB_SECRET_ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:db-AbCdEf",
    "API_SECRET_ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:renidly-AbCdEf",
    "UNIVERSITY_LIST": "Yale,Harvard",
}


@pytest.fixture
def env() -> dict[str, str]:
    return dict(BASE_ENV)


@pytest.fixture(autouse=True)
def _isolate() -> Iterator[None]:
    secret_store.clear_cache()
    handler.reset_runtime()
    db._connection = None
    yield
    secret_store.clear_cache()
    handler.reset_runtime()
    db._connection = None


class FakeContext:
    def __init__(self, remaining_ms: int = 900_000, step_ms: int = 0) -> None:
        self.remaining_ms = remaining_ms
        self.step_ms = step_ms
        self.aws_request_id = "req-123"
        self.function_name = "TestFn"

    def get_remaining_time_in_millis(self) -> int:
        value = self.remaining_ms
        self.remaining_ms -= self.step_ms
        return value
