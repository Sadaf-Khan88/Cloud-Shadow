"""Cost attribution logic for CloudShadow."""

from typing import TypedDict


class AttributionResult(TypedDict):
    service_id: str
    service_name: str
    observed_cost: int
    traffic_change_percent: int
    estimated_impact: float
    attribution_share: float
    evidence: str


def calculate_cost_attribution(
    services: list[dict],
) -> list[AttributionResult]:
    """
    Estimate each service's contribution to the observed cost footprint.

    This is an attribution estimate based on observed service cost and
    traffic change. It does not prove that the service caused the cost.
    """

    weighted_costs: dict[str, float] = {}

    for service in services:
        cost = float(service.get("cost", 0))
        traffic_change = max(float(service.get("trafficChange", 0)), 0)

        weighted_costs[service["id"]] = cost * (1 + traffic_change / 100)

    total_weighted_cost = sum(weighted_costs.values())

    results: list[AttributionResult] = []

    for service in services:
        service_id = service["id"]
        observed_cost = int(service.get("cost", 0))
        traffic_change = int(service.get("trafficChange", 0))
        weighted_cost = weighted_costs[service_id]

        if total_weighted_cost > 0:
            attribution_share = (
                weighted_cost / total_weighted_cost
            ) * 100
        else:
            attribution_share = 0.0

        results.append(
            {
                "service_id": service_id,
                "service_name": service["name"],
                "observed_cost": observed_cost,
                "traffic_change_percent": traffic_change,
                "estimated_impact": round(weighted_cost, 2),
                "attribution_share": round(attribution_share, 2),
                "evidence": (
                    f"Observed cost ₹{observed_cost:,} with "
                    f"{traffic_change}% traffic change"
                ),
            }
        )

    return results