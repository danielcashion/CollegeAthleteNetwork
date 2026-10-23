from __future__ import annotations

import ssl
from collections.abc import Sequence
from pathlib import Path
from typing import Any

import pymysql
from pymysql.cursors import DictCursor

from .config import CREATED_BY, ISSUE_TEXT, Config
from .models import ClaimedRow, EnrichResult, Outcome
from .secret_store import DbCredentials

RDS_CA_BUNDLE = Path(__file__).parent / "certs" / "global-bundle.pem"

_connection: pymysql.connections.Connection | None = None


def tls_context(host: str) -> ssl.SSLContext:
    """RDS endpoints chain to the RDS CA bundle; RDS Proxy endpoints use ACM certs trusted by the system store.

    The certificate names the DB instance endpoint. A CNAME such as dbprod.clublacrosse.org, and the Aurora
    cluster endpoint, present that same certificate, so hostname matching is limited to the instance endpoint.
    """
    if ".proxy-" in host:
        context = ssl.create_default_context()
        context.check_hostname = True
    else:
        context = ssl.create_default_context(cafile=str(RDS_CA_BUNDLE))
        instance_endpoint = host.endswith(".rds.amazonaws.com") and ".cluster-" not in host
        context.check_hostname = instance_endpoint
    context.verify_mode = ssl.CERT_REQUIRED
    return context


def connect(config: Config, credentials: DbCredentials) -> pymysql.connections.Connection:
    return pymysql.connect(
        host=config.db_host,
        port=config.db_port,
        user=credentials.username,
        password=credentials.password,
        database=config.db_name,
        charset="utf8mb4",
        autocommit=False,
        cursorclass=DictCursor,
        ssl=tls_context(config.db_host),
        connect_timeout=10,
        read_timeout=60,
        write_timeout=60,
        # Re-applied by PyMySQL on every reconnect, so ping(reconnect=True) keeps the isolation level.
        init_command="SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED",
    )


def get_connection(config: Config, credentials: DbCredentials) -> pymysql.connections.Connection:
    """Reuses the container's connection across warm invocations."""
    global _connection
    if _connection is None:
        _connection = connect(config, credentials)
    else:
        _connection.ping(reconnect=True)
    return _connection


def reset_connection() -> None:
    global _connection
    if _connection is not None:
        try:
            _connection.close()
        except Exception:
            pass
    _connection = None


def claim_sql(university_count: int) -> str:
    if university_count < 1:
        raise ValueError("At least one university is required")
    placeholders = ", ".join(["%s"] * university_count)
    return (
        "SELECT ua.athlete_id, ua.bus_url_1 "
        "FROM university_athletes ua "
        "WHERE ua.bus_url_1 IS NOT NULL "
        "AND ua.bus_url_1_verified = 1 "
        "AND ua.urn IS NULL "
        f"AND ua.university_name IN ({placeholders}) "
        "AND NOT EXISTS ("
        "SELECT 1 FROM university_athletes_issues i "
        "WHERE i.athlete_id = ua.athlete_id AND i.issue = %s AND i.is_active_YN = 1"
        ") "
        "ORDER BY ua.athlete_id "
        "LIMIT %s "
        "FOR UPDATE OF ua SKIP LOCKED"
    )


def claim_batch(conn: Any, universities: Sequence[str], limit: int) -> list[ClaimedRow]:
    """Locks up to `limit` rows for this transaction; concurrent runs skip them."""
    params: tuple[Any, ...] = (*universities, ISSUE_TEXT, limit)
    with conn.cursor() as cursor:
        cursor.execute(claim_sql(len(universities)), params)
        rows = cursor.fetchall()
    return [ClaimedRow(athlete_id=int(row["athlete_id"]), bus_url_1=str(row["bus_url_1"])) for row in rows]


UPDATE_URN_SQL = "UPDATE university_athletes SET urn = %s WHERE athlete_id = %s AND urn IS NULL"

INSERT_ISSUE_SQL = (
    "INSERT INTO university_athletes_issues "
    "(athlete_id, issue, is_active_YN, created_by, created_datetime) "
    "VALUES (%s, %s, 1, %s, NOW())"
)


def write_results(conn: Any, results: Sequence[EnrichResult]) -> dict[str, int]:
    """Writes the batch and commits. Retry outcomes are left untouched so the next run picks them up."""
    updates = [(result.urn, result.athlete_id) for result in results if result.outcome is Outcome.SUCCEEDED and result.urn]
    issues = [
        (result.athlete_id, ISSUE_TEXT, CREATED_BY)
        for result in results
        if result.outcome in (Outcome.NOT_FOUND, Outcome.FAILED)
    ]
    updated = 0
    with conn.cursor() as cursor:
        if updates:
            cursor.executemany(UPDATE_URN_SQL, updates)
            updated = cursor.rowcount
        if issues:
            cursor.executemany(INSERT_ISSUE_SQL, issues)
    conn.commit()
    return {"urns_written": max(updated, 0), "issues_written": len(issues)}


def rollback(conn: Any) -> None:
    try:
        conn.rollback()
    except Exception:
        pass
