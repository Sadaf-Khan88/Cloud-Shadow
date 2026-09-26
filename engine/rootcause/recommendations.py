"""
Cloud Shadow AI - Automated Remediation & Optimization Recommendations
======================================================================
Module: engine.rootcause.recommendations

Purpose:
    Generates actionable, evidence-supported architectural and operational
    recommendations based on detected anomalies, root causes, and cost impact.

Schema (EngineResult compatible):
    {
        "service_id": str,
        "action": str,
        "reason": str,
        "expected_effect": str,
        "risk": str
    }

Supported Situations:
    1. High compute / CPU utilization
    2. High database queries / DB load
    3. High network egress
    4. Storage growth
    5. Cache saturation / excessive cache pressure
    6. Problematic deployment followed by anomalies
    7. Excessive request/traffic-driven cost
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set, Tuple


def generate_recommendations(
    root_causes: list[dict[str, Any]],
    anomalies: Optional[list[dict[str, Any]]] = None,
    cost_attributions: Optional[list[dict[str, Any]]] = None,
    cost_summary: Optional[dict[str, Any]] = None,
    min_confidence_threshold: float = 0.40,
) -> list[dict[str, Any]]:
    """
    Produces deterministic, evidence-based recommendations for candidate root causes
    and affected services.

    Args:
        root_causes: List of root-cause candidate episodes from analyze_root_causes().
        anomalies: Optional list of raw detected anomaly dictionaries.
        cost_attributions: Optional list of cost attribution records.
        cost_summary: Optional high-level cost summary dictionary.
        min_confidence_threshold: Minimum confidence score to justify recommendations.

    Returns:
        list[dict[str, Any]]: List of recommendation dictionaries adhering to EngineResult schema.
    """
    if not root_causes:
        return []

    recommendations: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()

    def add_recommendation(
        service_id: str,
        action: str,
        reason: str,
        expected_effect: str,
        risk: str,
    ) -> None:
        key = (service_id, action)
        if key not in seen:
            seen.add(key)
            recommendations.append({
                "service_id": service_id,
                "action": action,
                "reason": reason,
                "expected_effect": expected_effect,
                "risk": risk,
            })

    for rc in root_causes:
        confidence = float(rc.get("confidence", 0.0))
        if confidence < min_confidence_threshold:
            continue

        svc = rc.get("service_id", "")
        primary_metric = rc.get("metric", "")
        impact_services = rc.get("impact_services", [])
        evidence = rc.get("evidence", {})
        related_event = evidence.get("related_event") or {}
        event_type = related_event.get("event_type", "")
        event_desc = related_event.get("description", "")
        cost_contrib = float(evidence.get("cost_contribution", 0.0))

        # ----------------------------------------------------------------------
        # Situation 1: Problematic deployment followed by anomalies
        # ----------------------------------------------------------------------
        if event_type == "deployment":
            add_recommendation(
                service_id=svc,
                action="Rollback release or review recent deployment",
                reason=(
                    f"Service degradation observed immediately following deployment "
                    f"('{event_desc}') with evidence confidence {confidence:.2f}."
                ),
                expected_effect="Restore service stability and eliminate deployment-related metric degradation",
                risk="Medium - Reverting release temporarily suspends newly shipped features until the defect is patched.",
            )

        # ----------------------------------------------------------------------
        # Situation 2: High database queries / DB load
        # ----------------------------------------------------------------------
        if primary_metric == "db_queries" or "postgres-db" in impact_services or svc == "postgres-db":
            target_svc = svc if primary_metric == "db_queries" else "postgres-db"
            add_recommendation(
                service_id=target_svc,
                action="Optimize database query loops, add read caching, and review index usage",
                reason=(
                    f"Substantial database query surge observed originating from {svc}, "
                    f"creating thread pool contention and elevated IOPS consumption on database tier."
                ),
                expected_effect="Reduce unnecessary database load and shield downstream database from query saturation",
                risk="Low to Medium - Query and caching optimizations require regression testing to ensure data freshness.",
            )

        # ----------------------------------------------------------------------
        # Situation 3: High network egress
        # ----------------------------------------------------------------------
        if primary_metric == "network_out" or any(
            w in event_desc.lower() for w in ["egress", "uncompressed", "pdf", "assets", "bandwidth"]
        ):
            add_recommendation(
                service_id=svc,
                action="Enable payload compression (gzip/brotli) and CDN object caching for egress assets",
                reason=(
                    f"Sharp network egress bandwidth spike detected on {svc}, "
                    f"driving elevated cloud data transfer charges."
                ),
                expected_effect="Lower network egress cost and reduce outbound data transfer payload volume",
                risk="Low - Standard compression algorithms have negligible CPU overhead and zero functional side effects.",
            )

        # ----------------------------------------------------------------------
        # Situation 4: Storage growth
        # ----------------------------------------------------------------------
        if svc == "object-storage" or "object-storage" in impact_services or any(
            w in event_desc.lower() for w in ["storage", "lifecycle", "bucket", "audit", "volume"]
        ):
            add_recommendation(
                service_id="object-storage",
                action="Enforce automated storage lifecycle expiration and transition to cold archive tiers",
                reason=(
                    "Sustained object accumulation and storage request surge observed on object-storage "
                    "without active lifecycle expiration."
                ),
                expected_effect="Reduce storage growth and curtail recurring monthly storage capacity charges",
                risk="Low - Lifecycle policies targeting audit payloads and temporary logs preserve operational compliance while purging stale data.",
            )

        # ----------------------------------------------------------------------
        # Situation 5: Cache saturation / excessive cache pressure
        # ----------------------------------------------------------------------
        if svc == "redis-cache" or "redis-cache" in impact_services or any(
            w in event_desc.lower() for w in ["redis", "cache", "eviction", "thrashing"]
        ):
            add_recommendation(
                service_id="redis-cache",
                action="Review Redis key TTL expiration policies, tune eviction algorithm, and scale memory allocation",
                reason=(
                    "Redis cache saturation and memory fragmentation detected, "
                    "causing eviction thrashing and cascading connection pressure to backend databases."
                ),
                expected_effect="Alleviate cache eviction pressure and protect downstream databases from connection spikes",
                risk="Medium - Cache eviction adjustments or node scaling should be applied during low-traffic windows to avoid cache stampedes.",
            )

        # ----------------------------------------------------------------------
        # Situation 6: High compute / CPU utilization
        # ----------------------------------------------------------------------
        if primary_metric == "cpu" or any(
            w in event_desc.lower() for w in ["cpu", "autovacuum", "burst", "maintenance"]
        ):
            add_recommendation(
                service_id=svc,
                action="Profile CPU-intensive operations and schedule heavy maintenance during off-peak windows",
                reason=(
                    f"Sustained elevated CPU utilization detected on {svc}, "
                    f"significantly exceeding historical baseline calibration levels."
                ),
                expected_effect="Limit compute scaling pressure and avoid compute throttling during peak user hours",
                risk="Low - Rescheduling non-critical maintenance and profiling resource contention carries minimal operational risk.",
            )

        # ----------------------------------------------------------------------
        # Situation 7: Excessive request/traffic-driven cost
        # ----------------------------------------------------------------------
        if event_type == "traffic_spike" or (primary_metric == "requests" and cost_contrib > 10.0):
            add_recommendation(
                service_id=svc,
                action="Apply edge request rate-limiting, request throttling, and tune autoscaling cooldown periods",
                reason=(
                    f"Significant request traffic surge observed on {svc}, "
                    f"driving multi-service scale-out and request-volume cloud infrastructure spending."
                ),
                expected_effect="Limit compute scaling pressure and smooth out sudden traffic waves",
                risk="Low - Rate-limiting non-critical endpoints protects core service availability during promotional traffic peaks.",
            )

    return recommendations


if __name__ == "__main__":
    print("=" * 80)
    print("Cloud Shadow AI - Recommendations Module Standalone Test")
    print("=" * 80)

    # Synthetic validation
    mock_root_causes = [
        {
            "service_id": "notification-service",
            "metric": "network_out",
            "confidence": 0.85,
            "impact_services": ["object-storage"],
            "evidence": {
                "related_event": {
                    "event_type": "config_change",
                    "description": "Updated invoice PDF generator to attach high-resolution uncompressed assets",
                },
                "cost_contribution": 53.2,
            },
        },
        {
            "service_id": "order-api",
            "metric": "latency",
            "confidence": 0.76,
            "impact_services": ["api-gateway"],
            "evidence": {
                "related_event": {
                    "event_type": "deployment",
                    "description": "Release checkout optimization and inventory pre-fetch memory leak",
                },
                "cost_contribution": 98.7,
            },
        },
        {
            "service_id": "recommendation-service",
            "metric": "db_queries",
            "confidence": 0.80,
            "impact_services": ["postgres-db"],
            "evidence": {
                "related_event": {
                    "event_type": "deployment",
                    "description": "Deploy personalized recommendation feed with real-time similarity query",
                },
                "cost_contribution": 0.0,
            },
        },
    ]

    recs = generate_recommendations(mock_root_causes)
    print(f"[+] Generated {len(recs)} recommendations for mock root causes:")
    for idx, r in enumerate(recs, 1):
        print(f"  #{idx} [{r['service_id']}] Action: {r['action']}")
        print(f"      Reason: {r['reason']}")
        print(f"      Effect: {r['expected_effect']}")
        print(f"      Risk:   {r['risk']}")

    print("\n[+] Recommendations module loaded and verified successfully.")
