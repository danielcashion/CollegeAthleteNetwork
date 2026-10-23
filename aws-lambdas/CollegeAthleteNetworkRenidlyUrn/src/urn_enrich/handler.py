from __future__ import annotations

import os
import time
import uuid
from dataclasses import dataclass
from typing import Any, Protocol

import pymysql
import requests

from . import db, renidly, secret_store
from .config import Config, load_config
from .http_client import build_session
from .models import ClaimedRow, EnrichResult, Outcome, RunSummary
from .observability import configure_logging, emit_emf, get_logger, mask_handle


class LambdaContext(Protocol):
    aws_request_id: str
    function_name: str

    def get_remaining_time_in_millis(self) -> int: ...


class RenidlyAuthError(RuntimeError):
    """The API key was rejected; stop instead of filing an issue for every athlete."""


@dataclass(frozen=True)
class Runtime:
    config: Config
    session: requests.Session
    api_key: str
    db_credentials: secret_store.DbCredentials


_runtime: Runtime | None = None


def get_runtime() -> Runtime:
    """Cold-start setup, cached for the life of the container."""
    global _runtime
    if _runtime is None:
        config = load_config(os.environ)
        configure_logging(config.log_level)
        _runtime = Runtime(
            config=config,
            session=build_session(),
            api_key=secret_store.get_api_key(config.api_secret_arn),
            db_credentials=secret_store.get_db_credentials(config.db_secret_arn),
        )
    return _runtime


def reset_runtime() -> None:
    global _runtime
    _runtime = None


def worst_call_ms(config: Config) -> int:
    """Rough upper bound for one API call including a retry, used to avoid starting calls we can't finish."""
    return int((config.http_connect_timeout_s + config.http_read_timeout_s) * 2000) + 10_000


def enrich_row(runtime: Runtime, row: ClaimedRow) -> tuple[EnrichResult, float | None, bool]:
    """Returns the result, the API latency (None if no call was made), and whether auth failed."""
    handle = renidly.extract_handle(row.bus_url_1)
    if handle is None:
        return EnrichResult(row.athlete_id, Outcome.FAILED, reason="invalid_handle"), None, False
    config = runtime.config
    request = renidly.build_request(config.renidly_base_url, handle, runtime.api_key)
    response = renidly.call_api(
        runtime.session, request, timeout=(config.http_connect_timeout_s, config.http_read_timeout_s)
    )
    mapped = renidly.map_response(response)
    if mapped.outcome is not Outcome.SUCCEEDED:
        get_logger().info(
            "Record not enriched",
            extra={
                "athlete_id": row.athlete_id,
                "handle": mask_handle(handle),
                "outcome": mapped.outcome.value,
                "reason": mapped.reason,
            },
        )
    result = EnrichResult(row.athlete_id, mapped.outcome, urn=mapped.urn, reason=mapped.reason)
    return result, response.latency_ms, mapped.auth_error


def handler(event: dict[str, Any] | None, context: LambdaContext) -> dict[str, int | str]:
    started = time.monotonic()
    runtime = get_runtime()
    config = runtime.config
    log = get_logger()
    run_id = getattr(context, "aws_request_id", None) or str(uuid.uuid4())
    function_name = getattr(context, "function_name", None) or "CollegeAthleteNetworkRenidlyUrn"

    max_records = config.max_records_per_run
    requested = (event or {}).get("max_records")
    if isinstance(requested, int) and not isinstance(requested, bool) and 0 < requested < max_records:
        max_records = requested

    summary = RunSummary()
    call_reserve_ms = config.safety_margin_ms + worst_call_ms(config)
    last_call = 0.0
    auth_failed = False

    log.info(
        "Run started",
        extra={"run_id": run_id, "universities": len(config.universities), "max_records": max_records},
    )

    conn = db.get_connection(config, runtime.db_credentials)
    try:
        while True:
            if context.get_remaining_time_in_millis() <= config.safety_margin_ms:
                summary.stopped_reason = "time_budget"
                break
            limit = min(config.batch_size, max_records - summary.claimed)
            if limit <= 0:
                summary.stopped_reason = "max_records"
                break

            batch_started = time.monotonic()
            rows = db.claim_batch(conn, config.universities, limit)
            if not rows:
                db.rollback(conn)
                summary.stopped_reason = "drained"
                break

            summary.batches += 1
            summary.claimed += len(rows)
            results: list[EnrichResult] = []
            latencies: list[float] = []
            for row in rows:
                if context.get_remaining_time_in_millis() <= call_reserve_ms:
                    summary.stopped_reason = "time_budget"
                    break
                wait_s = config.min_request_interval_ms / 1000 - (time.monotonic() - last_call)
                if wait_s > 0:
                    time.sleep(wait_s)
                result, latency, auth_error = enrich_row(runtime, row)
                if latency is not None:
                    last_call = time.monotonic()
                    latencies.append(latency)
                if auth_error:
                    auth_failed = True
                    break
                results.append(result)

            written = db.write_results(conn, results)

            counts = {outcome.value: 0 for outcome in Outcome}
            for result in results:
                counts[result.outcome.value] += 1
                summary.add(result.outcome)
            # Claimed rows we never got to are released at commit and picked up next run.
            unprocessed = len(rows) - len(results)
            counts[Outcome.RETRY.value] += unprocessed
            summary.retry += unprocessed
            summary.api_latencies_ms.extend(latencies)

            log.info(
                "Batch complete",
                extra={
                    "run_id": run_id,
                    "batch": summary.batches,
                    "claimed": len(rows),
                    **counts,
                    **written,
                    "duration_ms": int((time.monotonic() - batch_started) * 1000),
                },
            )
            emit_emf(
                config.metrics_namespace,
                counts,
                latencies,
                {"FunctionName": function_name},
                {"run_id": run_id, "batch": summary.batches},
            )

            if auth_failed:
                summary.stopped_reason = "auth_error"
                break
            if summary.stopped_reason == "time_budget":
                break
    except Exception as exc:
        db.rollback(conn)
        if isinstance(exc, (pymysql.err.OperationalError, pymysql.err.InterfaceError)):
            db.reset_connection()
        log.exception("Run failed", extra={"run_id": run_id, **summary.as_dict()})
        raise
    finally:
        summary.elapsed_ms = int((time.monotonic() - started) * 1000)

    log.info("Run complete", extra={"run_id": run_id, **summary.as_dict()})
    if auth_failed:
        raise RenidlyAuthError("Renidly rejected the API key (401/403); check the API secret")
    return summary.as_dict()


if os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    # Fail the cold start with a clear message instead of on the first invocation.
    get_runtime()
