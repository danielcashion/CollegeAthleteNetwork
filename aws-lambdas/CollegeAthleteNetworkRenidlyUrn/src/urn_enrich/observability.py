from __future__ import annotations

import json
import logging
import sys
import time
from collections.abc import Mapping, Sequence
from typing import Any, TextIO

LOGGER_NAME = "urn_enrich"
EMF_MAX_VALUES = 100

_RESERVED = set(vars(logging.LogRecord("", 0, "", 0, "", (), None))) | {"message", "asctime"}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "timestamp": int(record.created * 1000),
        }
        for key, value in vars(record).items():
            if key not in _RESERVED and not key.startswith("_"):
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(level: str = "INFO", stream: TextIO | None = None) -> logging.Logger:
    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(level)
    logger.propagate = False
    if not any(getattr(handler, "_urn_enrich", False) for handler in logger.handlers):
        handler = logging.StreamHandler(stream or sys.stdout)
        handler.setFormatter(JsonFormatter())
        handler._urn_enrich = True  # type: ignore[attr-defined]
        logger.addHandler(handler)
    return logger


def get_logger() -> logging.Logger:
    return logging.getLogger(LOGGER_NAME)


def mask_handle(handle: str | None) -> str:
    """Enough to correlate in logs without writing out a person's LinkedIn handle."""
    if not handle:
        return ""
    return f"{handle[:2]}***({len(handle)})"


def emf_documents(
    namespace: str,
    counts: Mapping[str, int],
    latencies_ms: Sequence[float],
    dimensions: Mapping[str, str],
    properties: Mapping[str, Any] | None = None,
    timestamp_ms: int | None = None,
) -> list[dict[str, Any]]:
    """EMF caps a metric at 100 values per document, so latency arrays are chunked."""
    chunks: list[list[float]] = [
        [round(value, 1) for value in latencies_ms[index : index + EMF_MAX_VALUES]]
        for index in range(0, len(latencies_ms), EMF_MAX_VALUES)
    ] or [[]]
    documents: list[dict[str, Any]] = []
    for position, chunk in enumerate(chunks):
        metric_defs = [{"Name": name, "Unit": "Count"} for name in counts] if position == 0 else []
        if chunk:
            metric_defs.append({"Name": "api_latency", "Unit": "Milliseconds"})
        if not metric_defs:
            continue
        document: dict[str, Any] = {
            "_aws": {
                "Timestamp": timestamp_ms or int(time.time() * 1000),
                "CloudWatchMetrics": [
                    {"Namespace": namespace, "Dimensions": [list(dimensions)], "Metrics": metric_defs}
                ],
            },
            **dimensions,
            **(properties or {}),
        }
        if position == 0:
            document.update(counts)
        if chunk:
            document["api_latency"] = chunk
        documents.append(document)
    return documents


def emit_emf(
    namespace: str,
    counts: Mapping[str, int],
    latencies_ms: Sequence[float],
    dimensions: Mapping[str, str],
    properties: Mapping[str, Any] | None = None,
    stream: TextIO | None = None,
) -> None:
    out = stream or sys.stdout
    for document in emf_documents(namespace, counts, latencies_ms, dimensions, properties):
        out.write(json.dumps(document) + "\n")
    out.flush()
