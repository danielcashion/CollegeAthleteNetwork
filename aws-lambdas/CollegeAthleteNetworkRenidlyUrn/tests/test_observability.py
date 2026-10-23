from __future__ import annotations

import io
import json
import logging

from urn_enrich.observability import EMF_MAX_VALUES, JsonFormatter, emf_documents, mask_handle


def test_emf_document_shape() -> None:
    [doc] = emf_documents("NS", {"succeeded": 2, "failed": 1}, [10.04, 20.0], {"FunctionName": "Fn"}, {"run_id": "r"}, 1)
    directive = doc["_aws"]["CloudWatchMetrics"][0]
    assert doc["_aws"]["Timestamp"] == 1
    assert directive["Namespace"] == "NS"
    assert directive["Dimensions"] == [["FunctionName"]]
    assert {m["Name"]: m["Unit"] for m in directive["Metrics"]} == {
        "succeeded": "Count",
        "failed": "Count",
        "api_latency": "Milliseconds",
    }
    assert doc["succeeded"] == 2 and doc["failed"] == 1
    assert doc["api_latency"] == [10.0, 20.0]
    assert doc["run_id"] == "r"


def test_emf_chunks_latency_at_100_values() -> None:
    docs = emf_documents("NS", {"succeeded": 1}, [1.0] * 250, {"FunctionName": "Fn"})
    assert [len(doc["api_latency"]) for doc in docs] == [EMF_MAX_VALUES, EMF_MAX_VALUES, 50]
    assert "succeeded" in docs[0] and "succeeded" not in docs[1]


def test_emf_without_latency() -> None:
    [doc] = emf_documents("NS", {"succeeded": 0}, [], {"FunctionName": "Fn"})
    assert "api_latency" not in doc


def test_mask_handle() -> None:
    assert mask_handle("danielcashion") == "da***(13)"
    assert mask_handle(None) == ""


def test_json_formatter_includes_extras() -> None:
    stream = io.StringIO()
    logger = logging.getLogger("test_json_formatter")
    handler = logging.StreamHandler(stream)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.propagate = False
    logger.warning("Batch complete", extra={"run_id": "abc", "batch": 3})
    payload = json.loads(stream.getvalue())
    assert payload["message"] == "Batch complete"
    assert payload["run_id"] == "abc"
    assert payload["batch"] == 3
    assert payload["level"] == "WARNING"
