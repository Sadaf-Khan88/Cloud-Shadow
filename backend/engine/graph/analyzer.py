"""Dependency graph analysis for CloudShadow."""

from typing import TypedDict


class GraphImpact(TypedDict):
    service_id: str
    downstream_services: list[str]
    impact_count: int
    evidence: str


def build_dependency_map(
    dependencies: dict[str, list[dict[str, str]]],
) -> dict[str, list[str]]:
    """
    Convert dependency edges into a source -> downstream-service map.

    The dependency graph describes observed relationships. It does not
    establish mathematical causality.
    """

    dependency_map: dict[str, list[str]] = {}

    for edge in dependencies.get("edges", []):
        source = edge["source"]
        target = edge["target"]

        dependency_map.setdefault(source, []).append(target)

    return dependency_map


def get_downstream_services(
    service_id: str,
    dependencies: dict[str, list[dict[str, str]]],
) -> list[str]:
    """
    Return all services downstream of the given service.
    """

    dependency_map = build_dependency_map(dependencies)

    visited: set[str] = set()
    queue = list(dependency_map.get(service_id, []))

    while queue:
        current = queue.pop(0)

        if current in visited:
            continue

        visited.add(current)
        queue.extend(dependency_map.get(current, []))

    return list(visited)


def analyze_dependency_impact(
    service_id: str,
    dependencies: dict[str, list[dict[str, str]]],
) -> GraphImpact:
    """
    Summarize the downstream impact of a service.
    """

    downstream_services = get_downstream_services(
        service_id,
        dependencies,
    )

    return {
        "service_id": service_id,
        "downstream_services": downstream_services,
        "impact_count": len(downstream_services),
        "evidence": (
            f"{service_id} has {len(downstream_services)} "
            "downstream dependency/dependencies"
        ),
    }