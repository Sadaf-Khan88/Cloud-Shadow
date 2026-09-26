"""Root cause analysis for CloudShadow."""


def analyze_root_cause(
    anomalies: list[dict],
    dependency_impacts: list[dict],
    attributions: list[dict],
) -> dict:
    """
    Combine anomaly, dependency, and attribution evidence to identify
    the most likely root cause.

    This is evidence-based analysis, not mathematical proof of causality.
    """

    candidates = []

    for anomaly in anomalies:
        if not anomaly.get("anomaly"):
            continue

        service_id = anomaly["service_id"]

        dependency = next(
            (
                item
                for item in dependency_impacts
                if item["service_id"] == service_id
            ),
            None,
        )

        attribution = next(
            (
                item
                for item in attributions
                if item["service_id"] == service_id
            ),
            None,
        )

        if not dependency or not attribution:
            continue

        score = 0

        # Strong anomaly signal
        if anomaly.get("severity") == "HIGH":
            score += 40

        # Downstream impact signal
        if dependency.get("impact_count", 0) > 0:
            score += 30

        # Cost attribution signal
        if attribution.get("attribution_share", 0) >= 50:
            score += 30

        candidates.append(
            {
                "service_id": service_id,
                "service_name": anomaly["service_name"],
                "score": score,
                "anomaly": anomaly,
                "dependency": dependency,
                "attribution": attribution,
            }
        )

    if not candidates:
        return {
            "title": "No strong root cause identified",
            "confidence": 0,
            "impact": "LOW",
            "service_id": None,
            "evidence": [],
        }

    candidates.sort(key=lambda item: item["score"], reverse=True)

    best = candidates[0]

    service_name = best["service_name"]
    anomaly = best["anomaly"]
    dependency = best["dependency"]
    attribution = best["attribution"]

    confidence = round(best["score"] * 0.91)

    if confidence >= 80:
        impact = "HIGH"
    elif confidence >= 60:
        impact = "MEDIUM"
    else:
        impact = "LOW"

    downstream = dependency["downstream_services"]

    evidence = [
        (
            f"{service_name} traffic increased by "
            f"{anomaly['change_percent']}%"
        ),
        (
            f"{service_name} has "
            f"{dependency['impact_count']} downstream dependencies"
        ),
        (
            f"{service_name} has an estimated "
            f"{attribution['attribution_share']}% cost attribution share"
        ),
    ]

    return {
        "title": (
            f"Likely root cause: increased traffic from {service_name}"
        ),
        "confidence": confidence,
        "impact": impact,
        "service_id": best["service_id"],
        "downstream_services": downstream,
        "evidence": evidence,
    }