"""Everything specific to Renidly lives here: input normalization, request shape, and response mapping."""

from __future__ import annotations

import re
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import unquote, urlsplit

import requests

from .models import ApiResponse, Mapped, Outcome

API_KEY_HEADER = "X-renidly-apikey"

_HANDLE = re.compile(r"^[A-Za-z0-9\-_%]{2,100}$")
_PROFILE_PATH = re.compile(r"^/in/([A-Za-z0-9\-_%]{2,100})/?$", re.IGNORECASE)
_LINKEDIN_HOST = re.compile(r"(^|\.)linkedin\.com$", re.IGNORECASE)
# urn is varchar(80); LinkedIn entity ids are URL-safe base64-ish tokens.
_ENTITY_ID = re.compile(r"^[A-Za-z0-9_\-]{10,80}$")


@dataclass(frozen=True)
class ApiRequest:
    url: str
    params: dict[str, str]
    headers: dict[str, str]


def _decoded_handle(slug: str) -> str | None:
    try:
        decoded = unquote(slug, errors="strict")
    except UnicodeDecodeError:
        return None
    return decoded if _HANDLE.match(decoded) else None


def extract_handle(raw: str | None) -> str | None:
    """Accepts a bare handle or a linkedin.com/in/ URL, with or without scheme. Mirrors the Node enrich Lambda."""
    value = (raw or "").strip()
    if not value or len(value) > 300 or re.search(r"[\s<>]", value):
        return None
    if _HANDLE.match(value):
        return _decoded_handle(value)

    with_scheme = value if re.match(r"^https?://", value, re.IGNORECASE) else f"https://{value}"
    try:
        parts = urlsplit(with_scheme)
        port = parts.port
    except ValueError:
        return None
    if parts.scheme.lower() not in ("http", "https"):
        return None
    if parts.username or parts.password:
        return None
    if port not in (None, 80, 443):
        return None
    host = parts.hostname or ""
    if not _LINKEDIN_HOST.search(host):
        return None
    match = _PROFILE_PATH.match(parts.path)
    return _decoded_handle(match.group(1)) if match else None


def build_request(base_url: str, handle: str, api_key: str) -> ApiRequest:
    return ApiRequest(url=base_url, params={"handle": handle}, headers={API_KEY_HEADER: api_key})


def call_api(session: requests.Session, request: ApiRequest, timeout: tuple[float, float]) -> ApiResponse:
    started = time.perf_counter()
    try:
        response = session.get(request.url, params=request.params, headers=request.headers, timeout=timeout)
    except requests.RequestException as exc:
        return ApiResponse(
            status=None,
            body=None,
            latency_ms=(time.perf_counter() - started) * 1000,
            error=type(exc).__name__,
        )
    latency_ms = (time.perf_counter() - started) * 1000
    body: dict[str, Any] | None
    try:
        parsed = response.json()
        body = parsed if isinstance(parsed, dict) else None
    except ValueError:
        body = None
    return ApiResponse(status=response.status_code, body=body, latency_ms=latency_ms)


def effective_status(response: ApiResponse) -> int | None:
    """A non-2xx HTTP status wins; otherwise Renidly's body statusCode is authoritative when present."""
    http = response.status
    if http is not None and not 200 <= http < 300:
        return http
    body_status = (response.body or {}).get("statusCode")
    if isinstance(body_status, int) and not isinstance(body_status, bool):
        return body_status
    if isinstance(body_status, str) and body_status.isdigit():
        return int(body_status)
    return http


def map_response(response: ApiResponse) -> Mapped:
    if response.error:
        return Mapped(Outcome.RETRY, reason=f"transport:{response.error}")
    status = effective_status(response)
    if status is None:
        return Mapped(Outcome.RETRY, reason="no_status")
    if status in (401, 403):
        return Mapped(Outcome.FAILED, reason=f"http_{status}", auth_error=True)
    if status == 429 or status >= 500:
        return Mapped(Outcome.RETRY, reason=f"http_{status}")
    if 200 <= status < 300:
        data = (response.body or {}).get("data")
        entity_id = data.get("entityId") if isinstance(data, dict) else None
        if isinstance(entity_id, str) and _ENTITY_ID.match(entity_id.strip()):
            return Mapped(Outcome.SUCCEEDED, urn=entity_id.strip(), reason="ok")
        return Mapped(Outcome.NOT_FOUND, reason="no_entity_id")
    if status == 404:
        return Mapped(Outcome.NOT_FOUND, reason="http_404")
    return Mapped(Outcome.FAILED, reason=f"http_{status}")
