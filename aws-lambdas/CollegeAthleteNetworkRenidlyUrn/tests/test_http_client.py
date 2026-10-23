from __future__ import annotations

from unittest.mock import MagicMock

from urn_enrich.http_client import MAX_RETRY_AFTER_S, RETRY_STATUSES, build_retry, build_session


def test_retry_policy() -> None:
    retry = build_retry()
    assert retry.total == 3
    assert retry.backoff_factor == 1.0
    assert set(retry.status_forcelist) == set(RETRY_STATUSES)
    assert retry.allowed_methods == frozenset({"GET"})
    assert retry.respect_retry_after_header is True
    assert retry.raise_on_status is False


def test_retry_after_is_capped() -> None:
    response = MagicMock()
    response.headers = {"Retry-After": "3600"}
    response.getheader = lambda name, default=None: response.headers.get(name, default)
    assert build_retry().get_retry_after(response) == MAX_RETRY_AFTER_S


def test_session_mounts_retrying_adapter() -> None:
    session = build_session()
    adapter = session.get_adapter("https://renidly.com/api")
    assert adapter.max_retries.total == 3
    assert session.headers["Accept"] == "application/json"
