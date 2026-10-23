from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Outcome(str, Enum):
    SUCCEEDED = "succeeded"
    NOT_FOUND = "not_found"
    RETRY = "retry"
    FAILED = "failed"


@dataclass(frozen=True)
class ClaimedRow:
    athlete_id: int
    bus_url_1: str


@dataclass(frozen=True)
class ApiResponse:
    status: int | None
    body: dict | None
    latency_ms: float
    error: str | None = None


@dataclass(frozen=True)
class Mapped:
    outcome: Outcome
    urn: str | None = None
    reason: str = ""
    auth_error: bool = False


@dataclass(frozen=True)
class EnrichResult:
    athlete_id: int
    outcome: Outcome
    urn: str | None = None
    reason: str = ""


@dataclass
class RunSummary:
    claimed: int = 0
    succeeded: int = 0
    not_found: int = 0
    retry: int = 0
    failed: int = 0
    batches: int = 0
    elapsed_ms: int = 0
    stopped_reason: str = "drained"
    api_latencies_ms: list[float] = field(default_factory=list)

    def add(self, outcome: Outcome) -> None:
        setattr(self, outcome.value, getattr(self, outcome.value) + 1)

    def as_dict(self) -> dict[str, int | str]:
        return {
            "claimed": self.claimed,
            "succeeded": self.succeeded,
            "not_found": self.not_found,
            "retry": self.retry,
            "failed": self.failed,
            "batches": self.batches,
            "elapsed_ms": self.elapsed_ms,
            "stopped_reason": self.stopped_reason,
        }
