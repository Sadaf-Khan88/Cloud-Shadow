"""
Cloud Shadow AI - Root Cause Evidence Scoring

Combines independent signals into an evidence score.
The score indicates how strongly the available evidence supports
a candidate root cause; it does NOT prove causality.
"""

from __future__ import annotations

from typing import Any


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    """Keep a numeric value inside the requested range."""
    return max(minimum, min(maximum, value))


def normalize_anomaly_score(anomaly_score: float) -> float:
    """Normalize an anomaly score into the [0, 1] range."""
    return clamp(float(anomaly_score))


def calculate_temporal_correlation(
    anomaly_timestamp: Any,
    event_timestamp: Any | None = None,
) -> float:
    """
    Score temporal proximity between an anomaly and an event.

    1.0  -> same timestamp
    0.75 -> within 1 hour
    0.50 -> within 3 hours
    0.25 -> within 6 hours
    0.00 -> farther apart / unavailable
    """
    if event_timestamp is None:
        return 0.0

    try:
        delta_hours = abs(
            (
                anomaly_timestamp - event_timestamp
            ).total_seconds()
        ) / 3600.0
    except (AttributeError, TypeError):
        return 0.0

    if delta_hours == 0:
        return 1.0
    if delta_hours <= 1:
        return 0.75
    if delta_hours <= 3:
        return 0.50
    if delta_hours <= 6:
        return 0.25

    return 0.0


def calculate_dependency_evidence(
    source_service: str,
    candidate_service: str,
    dependencies: list[dict[str, Any]],
) -> float:
    """
    Score whether candidate_service has a dependency relationship
    with source_service.

    Direct dependency -> 1.0
    No direct dependency -> 0.0
    """
    if source_service == candidate_service:
        return 1.0

    for dependency in dependencies:
        source = dependency.get("source_service")
        target = dependency.get("target_service")

        if (
            source == source_service
            and target == candidate_service
        ):
            return 1.0

        if (
            source == candidate_service
            and target == source_service
        ):
            return 1.0

    return 0.0


def calculate_cost_evidence(
    contribution_percent: float,
) -> float:
    """
    Convert positive cost contribution percentage into [0, 1].

    100% contribution -> 1.0
    """
    return clamp(float(contribution_percent) / 100.0)


def calculate_evidence_score(
    anomaly_score: float,
    temporal_correlation: float,
    dependency_evidence: float,
    cost_evidence: float,
    event_evidence: float = 0.0,
) -> float:
    """
    Combine evidence signals into a weighted score.

    This is an evidence score, not a causal probability.
    """

    weights = {
        "anomaly": 0.30,
        "temporal": 0.20,
        "dependency": 0.20,
        "cost": 0.20,
        "event": 0.10,
    }

    score = (
        weights["anomaly"] * normalize_anomaly_score(anomaly_score)
        + weights["temporal"] * clamp(temporal_correlation)
        + weights["dependency"] * clamp(dependency_evidence)
        + weights["cost"] * clamp(cost_evidence)
        + weights["event"] * clamp(event_evidence)
    )

    return round(clamp(score), 4)


if __name__ == "__main__":
    print("=" * 80)
    print("Cloud Shadow AI - Evidence Scoring Test")
    print("=" * 80)

    score = calculate_evidence_score(
        anomaly_score=0.85,
        temporal_correlation=1.0,
        dependency_evidence=1.0,
        cost_evidence=0.77,
        event_evidence=1.0,
    )

    print(f"[+] Example evidence score: {score:.4f}")
    print("[+] Evidence scoring module loaded successfully.")