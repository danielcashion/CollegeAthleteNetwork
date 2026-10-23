from __future__ import annotations

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

RETRY_STATUSES = (429, 500, 502, 503, 504)
MAX_RETRY_AFTER_S = 30.0


class CappedRetry(Retry):
    """Honors Retry-After, but never sleeps longer than MAX_RETRY_AFTER_S."""

    def get_retry_after(self, response):  # type: ignore[no-untyped-def]
        value = super().get_retry_after(response)
        return None if value is None else min(value, MAX_RETRY_AFTER_S)


def build_retry() -> Retry:
    return CappedRetry(
        total=3,
        connect=3,
        read=2,
        status=3,
        backoff_factor=1.0,
        status_forcelist=RETRY_STATUSES,
        allowed_methods=frozenset({"GET"}),
        respect_retry_after_header=True,
        raise_on_status=False,
    )


def build_session(user_agent: str = "CollegeAthleteNetwork-RenidlyUrn/1.0") -> requests.Session:
    session = requests.Session()
    adapter = HTTPAdapter(max_retries=build_retry(), pool_connections=2, pool_maxsize=2)
    session.mount("https://", adapter)
    session.headers.update({"Accept": "application/json", "User-Agent": user_agent})
    return session
