"""Anomaly detection for CloudShadow service telemetry."""

from typing import TypedDict


class AnomalyResult(TypedDict):
    service_id: str
    service_name: str
    metric: str
    change_percent: int
    threshold_percent: int
    anomaly: bool
    severity: str
    evidence: str


ANOMALY_THRESHOLD = 50
WARNING_THRESHOLD = 30


def detect_service_anomalies(services: list[dict]) -> list[AnomalyResult]:
    """
    Detect unusually high traffic changes across services.

    This function identifies anomalies only. It does not infer causality.
    """

    results: list[AnomalyResult] = []

    for service in services:
        traffic_change = int(service.get("trafficChange", 0))

        if traffic_change >= ANOMALY_THRESHOLD:
            severity = "HIGH"
            anomaly = True
        elif traffic_change >= WARNING_THRESHOLD:
            severity = "MEDIUM"
            anomaly = False
        else:
            severity = "LOW"
            anomaly = False

        results.append(
            {
                "service_id": service["id"],
                "service_name": service["name"],
                "metric": "traffic",
                "change_percent": traffic_change,
                "threshold_percent": ANOMALY_THRESHOLD,
                "anomaly": anomaly,
                "severity": severity,
                "evidence": (
                    f"{service['name']} traffic changed by "
                    f"{traffic_change}%"
                ),
            }
        )

    return results