from __future__ import annotations

import ssl
from unittest.mock import MagicMock, patch

import pytest

from urn_enrich import db
from urn_enrich.config import CREATED_BY, ISSUE_TEXT, load_config
from urn_enrich.models import EnrichResult, Outcome
from urn_enrich.secret_store import DbCredentials


def fake_conn(rows: list[dict] | None = None) -> tuple[MagicMock, MagicMock]:
    conn = MagicMock()
    cursor = MagicMock()
    cursor.fetchall.return_value = rows or []
    cursor.rowcount = 0
    conn.cursor.return_value.__enter__.return_value = cursor
    return conn, cursor


def test_claim_sql_is_fully_parameterized() -> None:
    sql = db.claim_sql(3)
    assert "IN (%s, %s, %s)" in sql
    assert "i.issue = %s" in sql
    assert "LIMIT %s" in sql
    assert sql.endswith("FOR UPDATE OF ua SKIP LOCKED")
    assert "Yale" not in sql and ISSUE_TEXT not in sql


def test_claim_sql_requires_universities() -> None:
    with pytest.raises(ValueError):
        db.claim_sql(0)


def test_claim_batch_passes_values_as_params() -> None:
    conn, cursor = fake_conn([{"athlete_id": 7, "bus_url_1": "jane"}, {"athlete_id": 9, "bus_url_1": "joe"}])
    rows = db.claim_batch(conn, ("Yale", "O'Brien College"), 20)
    sql, params = cursor.execute.call_args.args
    assert "O'Brien" not in sql
    assert params == ("Yale", "O'Brien College", ISSUE_TEXT, 20)
    assert [(row.athlete_id, row.bus_url_1) for row in rows] == [(7, "jane"), (9, "joe")]


def test_write_results_updates_inserts_and_commits() -> None:
    conn, cursor = fake_conn()
    cursor.rowcount = 1
    written = db.write_results(
        conn,
        [
            EnrichResult(1, Outcome.SUCCEEDED, urn="ACoAAAAcDrEB"),
            EnrichResult(2, Outcome.NOT_FOUND),
            EnrichResult(3, Outcome.FAILED, reason="http_400"),
            EnrichResult(4, Outcome.RETRY),
        ],
    )
    calls = cursor.executemany.call_args_list
    assert calls[0].args == (db.UPDATE_URN_SQL, [("ACoAAAAcDrEB", 1)])
    assert calls[1].args == (db.INSERT_ISSUE_SQL, [(2, ISSUE_TEXT, CREATED_BY), (3, ISSUE_TEXT, CREATED_BY)])
    assert "AND urn IS NULL" in db.UPDATE_URN_SQL
    conn.commit.assert_called_once()
    assert written == {"urns_written": 1, "issues_written": 2}


def test_write_results_with_only_retries_still_commits_to_release_locks() -> None:
    conn, cursor = fake_conn()
    db.write_results(conn, [EnrichResult(4, Outcome.RETRY)])
    cursor.executemany.assert_not_called()
    conn.commit.assert_called_once()


def test_created_by_fits_column() -> None:
    assert len(CREATED_BY) <= 20
    assert len(ISSUE_TEXT) <= 200


def test_tls_context_uses_rds_bundle_or_system_store() -> None:
    assert db.RDS_CA_BUNDLE.exists()
    with patch("urn_enrich.db.ssl.create_default_context", wraps=ssl.create_default_context) as factory:
        direct = db.tls_context("mydb.abc123.us-east-1.rds.amazonaws.com")
        assert factory.call_args.kwargs == {"cafile": str(db.RDS_CA_BUNDLE)}
        proxy = db.tls_context("myproxy.proxy-abc123.us-east-1.rds.amazonaws.com")
        assert factory.call_args.kwargs == {}
        alias = db.tls_context("dbprod.example.org")
        cluster = db.tls_context("mydb.cluster-abc123.us-east-1.rds.amazonaws.com")
    assert direct.check_hostname is True
    assert proxy.check_hostname is True
    assert alias.check_hostname is False
    assert cluster.check_hostname is False
    for context in (direct, proxy, alias, cluster):
        assert context.verify_mode == ssl.CERT_REQUIRED


def test_get_connection_reuses_and_pings(env: dict[str, str]) -> None:
    config = load_config(env)
    creds = DbCredentials("app", "pw")
    with patch("urn_enrich.db.pymysql.connect") as connect:
        first = db.get_connection(config, creds)
        second = db.get_connection(config, creds)
    assert first is second
    connect.assert_called_once()
    kwargs = connect.call_args.kwargs
    assert kwargs["charset"] == "utf8mb4"
    assert kwargs["autocommit"] is False
    assert kwargs["cursorclass"] is db.DictCursor
    assert isinstance(kwargs["ssl"], ssl.SSLContext)
    assert "READ COMMITTED" in kwargs["init_command"]
    first.ping.assert_called_once_with(reconnect=True)
