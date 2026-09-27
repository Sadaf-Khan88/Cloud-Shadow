from pathlib import Path

from engine.anomaly.baseline import (
    calculate_historical_baseline,
    load_metrics,
)
from engine.anomaly.detector import detect_anomalies
from engine.attribution.cost_attribution import (
    attribute_cost_change,
    build_cost_summary,
    load_costs,
)
from engine.rootcause.analyzer import analyze_root_causes

import pandas as pd


ROOT = Path(__file__).resolve().parent

METRICS_FILE = ROOT / "data" / "data" / "processed" / "metrics_clean.csv"
COSTS_FILE = ROOT / "data" / "data" / "processed" / "costs_clean.csv"
DEPENDENCIES_FILE = (
    ROOT / "data" / "data" / "processed" / "dependencies_clean.csv"
)
EVENTS_FILE = ROOT / "data" / "data" / "processed" / "events_clean.csv"


print("=" * 90)
print("CLOUD SHADOW AI - REAL DATA ROOT CAUSE TEST")
print("=" * 90)


# -------------------------------------------------------------------
# 1. Load metrics
# -------------------------------------------------------------------

metrics = load_metrics(str(METRICS_FILE))

print(f"\n[1] Metrics loaded: {len(metrics)} rows")


# -------------------------------------------------------------------
# 2. Build historical baseline
# -------------------------------------------------------------------

baseline = calculate_historical_baseline(
    metrics,
    calibration_start="2026-03-01T00:00:00Z",
    calibration_end="2026-03-03T23:59:59Z",
)

print(f"[2] Baseline rows: {len(baseline)}")


# -------------------------------------------------------------------
# 3. Run anomaly detector
# -------------------------------------------------------------------

anomalies = detect_anomalies(
    metrics_df=metrics,
    baseline_df=baseline,
)
anomalies = anomalies.to_dict(
    orient="records"
)
print(f"[3] Anomalies detected: {len(anomalies)}")


# -------------------------------------------------------------------
# 4. Load dependencies/events
# -------------------------------------------------------------------

dependencies = pd.read_csv(DEPENDENCIES_FILE).to_dict(
    orient="records"
)

events = pd.read_csv(EVENTS_FILE).to_dict(
    orient="records"
)

print(f"[4] Dependencies: {len(dependencies)}")
print(f"[4] Events: {len(events)}")


# -------------------------------------------------------------------
# 5. Load costs
# -------------------------------------------------------------------

costs = load_costs(str(COSTS_FILE))

# -------------------------------------------------------------------
# 5. Build cost attribution
# -------------------------------------------------------------------

costs = load_costs(str(COSTS_FILE))

analysis_end = costs["timestamp"].max()
analysis_start = analysis_end - pd.Timedelta("71h")

attribution_df = attribute_cost_change(
    costs_df=costs,
    analysis_start=analysis_start,
    analysis_end=analysis_end,
    calibration_start="2026-03-01T00:00:00Z",
    calibration_end="2026-03-03T23:59:59Z",
)

cost_summary = build_cost_summary(
    attribution_df
)

cost_attributions = attribution_df.to_dict(
    orient="records"
)

print(
    f"[5] Cost attribution rows: "
    f"{len(cost_attributions)}"
)

print(
    f"[5] Overall cost change: "
    f"{cost_summary.get('change_percent', 0):.2f}%"
)

print(f"[5] Cost attribution rows: {len(cost_attributions)}")


# -------------------------------------------------------------------
# 6. Root-cause analysis
# -------------------------------------------------------------------

results = analyze_root_causes(
    anomalies=anomalies,
    dependencies=dependencies,
    events=events,
    cost_attributions=cost_attributions,
)


# -------------------------------------------------------------------
# 7. Print top candidates
# -------------------------------------------------------------------

print("\n" + "=" * 90)
print("TOP ROOT-CAUSE CANDIDATES")
print("=" * 90)

for index, result in enumerate(results[:20], start=1):

    evidence = result["evidence"]

    print(
        f"\n#{index} "
        f"{result['service_id']} "
        f"| metric={result['metric']} "
        f"| confidence={result['confidence']:.4f}"
    )

    print(
        f"   timestamp: "
        f"{result['timestamp']}"
    )

    print(
        f"   anomaly_score: "
        f"{evidence['anomaly_score']:.4f}"
    )

    print(
        f"   temporal: "
        f"{evidence['temporal_correlation']:.4f}"
    )

    print(
        f"   dependency: "
        f"{evidence['dependency_relationship']:.4f}"
    )

    print(
        f"   cost contribution: "
        f"{evidence['cost_contribution']:.2f}%"
    )

    related = evidence.get("related_anomaly")

    if related:
        print(
            f"   related anomaly: "
            f"{related.get('service_id')} "
            f"| {related.get('metric')} "
            f"| {related.get('timestamp')}"
        )

        print(
            f"   relationship: "
            f"{evidence.get('relationship')}"
        )

    event = evidence.get("related_event")

    if event:
        print(
            f"   event: "
            f"{event.get('event_type')} "
            f"| {event.get('service_id')} "
            f"| {event.get('timestamp')}"
        )

        print(
            f"   description: "
            f"{event.get('description')}"
        )


print("\n" + "=" * 90)
print("REAL DATA ROOT-CAUSE TEST COMPLETE")
print("=" * 90)