from __future__ import annotations

from unittest.mock import MagicMock

import pytest
import requests

from urn_enrich import renidly
from urn_enrich.models import ApiResponse, Outcome

URN = "ACoAAAAcDrEBmaPHwHOMev6kG0zKdyT6tJmaJGs"


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("danielcashion", "danielcashion"),
        ("https://www.linkedin.com/in/danielcashion", "danielcashion"),
        ("https://www.linkedin.com/in/danielcashion/", "danielcashion"),
        ("www.linkedin.com/in/danielcashion?trk=x", "danielcashion"),
        ("linkedin.com/in/cole-cashion-12ab", "cole-cashion-12ab"),
        ("https://uk.linkedin.com/in/jane_doe", "jane_doe"),
        ("http://www.linkedin.com:443/in/jane", "jane"),
        ("https://evil.com/in/jane", None),
        ("https://www.linkedin.com.evil.com/in/jane", None),
        ("https://user:pw@www.linkedin.com/in/jane", None),
        ("https://www.linkedin.com:8080/in/jane", None),
        ("https://www.linkedin.com/company/acme", None),
        ("jane doe", None),
        ("a", None),
        ("", None),
        (None, None),
        ("caf%C3%A9", None),
    ],
)
def test_extract_handle(raw: str | None, expected: str | None) -> None:
    assert renidly.extract_handle(raw) == expected


def test_build_request_sets_param_and_key_header() -> None:
    request = renidly.build_request("https://renidly.com/api/v2/person/resolve-handle", "jane", "k3y")
    assert request.params == {"handle": "jane"}
    assert request.headers == {renidly.API_KEY_HEADER: "k3y"}


def ok_body(entity_id: object = URN) -> dict:
    return {"success": True, "statusCode": 200, "data": {"entityId": entity_id, "handle": "jane"}}


@pytest.mark.parametrize(
    ("response", "outcome", "urn", "auth"),
    [
        (ApiResponse(200, ok_body(), 10), Outcome.SUCCEEDED, URN, False),
        (ApiResponse(200, ok_body(None), 10), Outcome.NOT_FOUND, None, False),
        (ApiResponse(200, ok_body("not valid!"), 10), Outcome.NOT_FOUND, None, False),
        (ApiResponse(200, {"success": False, "statusCode": 404, "data": None}, 10), Outcome.NOT_FOUND, None, False),
        (ApiResponse(404, None, 10), Outcome.NOT_FOUND, None, False),
        (ApiResponse(400, {"statusCode": 400}, 10), Outcome.FAILED, None, False),
        (ApiResponse(422, None, 10), Outcome.FAILED, None, False),
        (ApiResponse(429, None, 10), Outcome.RETRY, None, False),
        (ApiResponse(503, {"statusCode": 200}, 10), Outcome.RETRY, None, False),
        (ApiResponse(None, None, 10, error="ReadTimeout"), Outcome.RETRY, None, False),
        (ApiResponse(401, None, 10), Outcome.FAILED, None, True),
        (ApiResponse(200, {"statusCode": "403"}, 10), Outcome.FAILED, None, True),
    ],
)
def test_map_response(response: ApiResponse, outcome: Outcome, urn: str | None, auth: bool) -> None:
    mapped = renidly.map_response(response)
    assert mapped.outcome is outcome
    assert mapped.urn == urn
    assert mapped.auth_error is auth


def test_call_api_parses_json_and_measures_latency() -> None:
    session = MagicMock(spec=requests.Session)
    session.get.return_value.status_code = 200
    session.get.return_value.json.return_value = ok_body()
    request = renidly.build_request("https://example.test/resolve", "jane", "k")
    response = renidly.call_api(session, request, timeout=(1, 2))
    assert response.status == 200
    assert response.body == ok_body()
    assert response.latency_ms >= 0
    session.get.assert_called_once_with(
        "https://example.test/resolve", params={"handle": "jane"}, headers=request.headers, timeout=(1, 2)
    )


def test_call_api_non_json_body() -> None:
    session = MagicMock(spec=requests.Session)
    session.get.return_value.status_code = 502
    session.get.return_value.json.side_effect = ValueError("not json")
    response = renidly.call_api(session, renidly.build_request("https://x.test", "jane", "k"), timeout=(1, 2))
    assert response.status == 502
    assert response.body is None


def test_call_api_transport_error() -> None:
    session = MagicMock(spec=requests.Session)
    session.get.side_effect = requests.ConnectionError("boom")
    response = renidly.call_api(session, renidly.build_request("https://x.test", "jane", "k"), timeout=(1, 2))
    assert response.status is None
    assert response.error == "ConnectionError"
    assert renidly.map_response(response).outcome is Outcome.RETRY
