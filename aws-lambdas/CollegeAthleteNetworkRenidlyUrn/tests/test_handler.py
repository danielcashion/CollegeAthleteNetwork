from __future__ import annotations

import json
from collections.abc import Iterator
from unittest.mock import MagicMock, patch

import pymysql
import pytest

from urn_enrich import handler
from urn_enrich.config import load_config
from urn_enrich.models import ApiResponse, ClaimedRow, Outcome
from urn_enrich.secret_store import DbCredentials

from .conftest import FakeContext

URN = "ACoAAAAcDrEBmaPHwHOMev6kG0zKdyT6tJmaJGs"


def ok(entity_id: str = URN) -> ApiResponse:
    return ApiResponse(200, {"statusCode": 200, "data": {"entityId": entity_id}}, 42.0)


@pytest.fixture
def runtime(env: dict[str, str]) -> handler.Runtime:
    env.update({"BATCH_SIZE": "2", "MIN_REQUEST_INTERVAL_MS": "0", "SAFETY_MARGIN_MS": "60000"})
    rt = handler.Runtime(
        config=load_config(env),
        session=MagicMock(),
        api_key="test-key",
        db_credentials=DbCredentials("app", "pw"),
    )
    handler._runtime = rt
    return rt


@pytest.fixture
def fake_db() -> Iterator[dict[str, MagicMock]]:
    conn = MagicMock()
    with (
        patch("urn_enrich.db.get_connection", return_value=conn) as get_connection,
        patch("urn_enrich.db.claim_batch") as claim_batch,
        patch("urn_enrich.db.write_results", return_value={"urns_written": 0, "issues_written": 0}) as write_results,
        patch("urn_enrich.db.reset_connection") as reset_connection,
    ):
        yield {
            "conn": conn,
            "get_connection": get_connection,
            "claim_batch": claim_batch,
            "write_results": write_results,
            "reset_connection": reset_connection,
        }


def rows(*ids: int) -> list[ClaimedRow]:
    return [ClaimedRow(athlete_id=i, bus_url_1=f"https://www.linkedin.com/in/athlete{i}") for i in ids]


def written_outcomes(write_results: MagicMock) -> list[list[tuple[int, Outcome]]]:
    return [[(r.athlete_id, r.outcome) for r in call.args[1]] for call in write_results.call_args_list]


def test_full_run_summary(runtime: handler.Runtime, fake_db: dict[str, MagicMock], capsys: pytest.CaptureFixture[str]) -> None:
    fake_db["claim_batch"].side_effect = [rows(1, 2), rows(3, 4), rows(5), []]
    responses = [ok(), ApiResponse(404, None, 30.0), ApiResponse(429, None, 30.0), ApiResponse(400, None, 30.0), ok()]
    with patch("urn_enrich.renidly.call_api", side_effect=responses) as call_api:
        summary = handler.handler({}, FakeContext())

    assert summary == {
        "claimed": 5,
        "succeeded": 2,
        "not_found": 1,
        "retry": 1,
        "failed": 1,
        "batches": 3,
        "elapsed_ms": summary["elapsed_ms"],
        "stopped_reason": "drained",
    }
    assert call_api.call_args_list[0].args[1].headers == {"X-renidly-apikey": "test-key"}
    assert call_api.call_args_list[0].args[1].params == {"handle": "athlete1"}
    assert written_outcomes(fake_db["write_results"]) == [
        [(1, Outcome.SUCCEEDED), (2, Outcome.NOT_FOUND)],
        [(3, Outcome.RETRY), (4, Outcome.FAILED)],
        [(5, Outcome.SUCCEEDED)],
    ]
    lines = [json.loads(line) for line in capsys.readouterr().out.splitlines()]
    emf = [line for line in lines if "_aws" in line]
    assert len(emf) == 3
    first = emf[0]
    names = {metric["Name"] for metric in first["_aws"]["CloudWatchMetrics"][0]["Metrics"]}
    assert {"succeeded", "failed", "api_latency"} <= names
    assert first["succeeded"] == 1 and first["api_latency"] == [42.0, 30.0]
    assert first["FunctionName"] == "TestFn"
    assert all("test-key" not in json.dumps(line) for line in lines)
    assert all("athlete1" not in json.dumps(line) for line in lines)


def test_invalid_handle_fails_without_api_call(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    fake_db["claim_batch"].side_effect = [[ClaimedRow(8, "https://google.com")], []]
    with patch("urn_enrich.renidly.call_api") as call_api:
        summary = handler.handler({}, FakeContext())
    call_api.assert_not_called()
    assert summary["failed"] == 1
    assert written_outcomes(fake_db["write_results"]) == [[(8, Outcome.FAILED)]]


def test_stops_before_batch_when_time_is_short(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    summary = handler.handler({}, FakeContext(remaining_ms=59_000))
    fake_db["claim_batch"].assert_not_called()
    assert summary["stopped_reason"] == "time_budget"
    assert summary["batches"] == 0


def test_stops_mid_batch_and_releases_unprocessed_rows(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    reserve = runtime.config.safety_margin_ms + handler.worst_call_ms(runtime.config)
    # Enough time to claim and make one call, then the clock runs down past the reserve.
    context = FakeContext(remaining_ms=reserve + 10_000, step_ms=6_000)
    fake_db["claim_batch"].side_effect = [rows(1, 2)]
    with patch("urn_enrich.renidly.call_api", return_value=ok()):
        summary = handler.handler({}, context)
    assert summary["stopped_reason"] == "time_budget"
    assert summary["succeeded"] == 1
    assert summary["retry"] == 1
    assert summary["claimed"] == 2
    assert written_outcomes(fake_db["write_results"]) == [[(1, Outcome.SUCCEEDED)]]


def test_max_records_caps_claims(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    fake_db["claim_batch"].side_effect = [rows(1, 2), rows(3)]
    with patch("urn_enrich.renidly.call_api", return_value=ok()):
        summary = handler.handler({"max_records": 3}, FakeContext())
    limits = [call.args[2] for call in fake_db["claim_batch"].call_args_list]
    assert limits == [2, 1]
    assert summary["claimed"] == 3
    assert summary["stopped_reason"] == "max_records"


def test_event_cannot_raise_cap_above_config(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    fake_db["claim_batch"].return_value = []
    handler.handler({"max_records": 10_000_000}, FakeContext())
    assert fake_db["claim_batch"].call_args.args[2] == 2


def test_auth_error_commits_prior_rows_then_raises(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    fake_db["claim_batch"].side_effect = [rows(1, 2)]
    with patch("urn_enrich.renidly.call_api", side_effect=[ok(), ApiResponse(401, None, 5.0)]):
        with pytest.raises(handler.RenidlyAuthError):
            handler.handler({}, FakeContext())
    assert written_outcomes(fake_db["write_results"]) == [[(1, Outcome.SUCCEEDED)]]
    assert fake_db["claim_batch"].call_count == 1


def test_db_error_rolls_back_and_resets_connection(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    fake_db["claim_batch"].side_effect = pymysql.err.OperationalError(2013, "Lost connection")
    with pytest.raises(pymysql.err.OperationalError):
        handler.handler({}, FakeContext())
    fake_db["conn"].rollback.assert_called()
    fake_db["reset_connection"].assert_called_once()


def test_write_failure_rolls_back(runtime: handler.Runtime, fake_db: dict[str, MagicMock]) -> None:
    fake_db["claim_batch"].side_effect = [rows(1)]
    fake_db["write_results"].side_effect = pymysql.err.IntegrityError(1062, "dup")
    with patch("urn_enrich.renidly.call_api", return_value=ok()):
        with pytest.raises(pymysql.err.IntegrityError):
            handler.handler({}, FakeContext())
    fake_db["conn"].rollback.assert_called()
    fake_db["reset_connection"].assert_not_called()


def test_throttle_spaces_calls(env: dict[str, str], fake_db: dict[str, MagicMock]) -> None:
    env.update({"BATCH_SIZE": "3", "MIN_REQUEST_INTERVAL_MS": "1000"})
    handler._runtime = handler.Runtime(load_config(env), MagicMock(), "k", DbCredentials("a", "b"))
    fake_db["claim_batch"].side_effect = [rows(1, 2, 3), []]
    with (
        patch("urn_enrich.renidly.call_api", return_value=ok()),
        patch("urn_enrich.handler.time.sleep") as sleep,
    ):
        handler.handler({}, FakeContext())
    assert sleep.call_count == 2
    assert all(0 < call.args[0] <= 1.0 for call in sleep.call_args_list)


def test_cold_start_config_error_is_clear(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("DB_HOST", "DB_NAME", "DB_SECRET_ARN", "API_SECRET_ARN", "UNIVERSITY_LIST"):
        monkeypatch.delenv(name, raising=False)
    with pytest.raises(Exception, match="DB_HOST is required"):
        handler.get_runtime()
