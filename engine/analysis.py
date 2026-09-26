"""
Cloud Shadow AI - Engine Orchestrator
=====================================
Module: engine.analysis

Purpose:
    Coordinates the full end-to-end analysis pipeline:
    1. Parse / normalize AnalysisInput
    2. Historical Baseline calculation (clean calibration window)
    3. Time-Series Anomaly Detection (complete timeline)
    4. Cost Attribution & Financial Impact Summary
    5. Episode-Based Root Cause Analysis (dependency-aware)
    6. Actionable Remediation Recommendations
    7. Assembles and returns EngineResult

Important:
    - Loosely coupled and completely independent of FastAPI / HTTP servers.
    - Deterministic, evidence-based, and fully compatible with backend consumers.
"""

from __future__ import annotations

import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import pandas as pd

# Guarantee package visibility regardless of execution directory
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from engine.anomaly.baseline import (
    DEFAULT_CALIBRATION_END,
    DEFAULT_CALIBRATION_START,
    calculate_historical_baseline,
    find_metrics_file,
    load_metrics,
)
from engine.anomaly.detector import (
    DEFAULT_DETECTION_START,
    detect_anomalies,
)
from engine.attribution.cost_attribution import (
    attribute_cost_change,
    build_cost_summary,
    find_costs_file,
    load_costs,
)
from engine.rootcause.analyzer import analyze_root_causes
from engine.rootcause.recommendations import generate_recommendations


@dataclass
class AnalysisInput:
    """Configuration and input parameters container for run_analysis()."""
    analysis_id: Optional[str] = None
    calibration_start: str = DEFAULT_CALIBRATION_START
    calibration_end: str = DEFAULT_CALIBRATION_END
    detection_start: str = DEFAULT_DETECTION_START
    detection_end: Optional[str] = None
    metrics_path: Optional[str] = None
    costs_path: Optional[str] = None
    dependencies_path: Optional[str] = None
    events_path: Optional[str] = None
    metrics_df: Optional[Any] = None
    costs_df: Optional[Any] = None
    dependencies: Optional[Any] = None
    events: Optional[Any] = None
    analysis_start: Optional[Any] = None
    analysis_end: Optional[Any] = None


class EngineResult(dict):
    """Canonical EngineResult dictionary supporting key, attribute, and JSON serialization."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__dict__ = self


def _find_data_file(filename: str, custom_path: Optional[Union[str, Path]] = None) -> Path:
    """Locate a dataset file in candidate directories."""
    if custom_path:
        path = Path(custom_path)
        if path.is_file():
            return path.resolve()
        raise FileNotFoundError(f"Specified file does not exist: {custom_path}")

    cwd = Path.cwd()
    module_dir = Path(__file__).resolve().parent
    root = module_dir.parent

    candidates = [
        cwd / "data" / "data" / "processed" / filename,
        cwd / "data" / "processed" / filename,
        root / "data" / "data" / "processed" / filename,
        root / "data" / "processed" / filename,
    ]

    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()

    searched = "\n  - ".join(str(p) for p in candidates)
    raise FileNotFoundError(f"Could not locate '{filename}'. Searched:\n  - {searched}")


def _extract_param(source: Any, key: str, default: Any = None) -> Any:
    """Extract a parameter from dict, object attribute, or fallback to default."""
    if source is None:
        return default
    if isinstance(source, dict):
        return source.get(key, default)
    return getattr(source, key, default)


def run_analysis(
    analysis_input: Optional[Union[dict, Any]] = None,
) -> dict[str, Any]:
    """
    Executes the end-to-end Cloud Shadow AI analysis engine.

    Pipeline:
      AnalysisInput
          ↓
      Historical Baseline (clean calibration window)
          ↓
      Time-Series Anomaly Detection
          ↓
      Cost Attribution & Summary
          ↓
      Episode-Based Root Cause Analysis (dependency-aware)
          ↓
      Remediation Recommendations
          ↓
      EngineResult

    Args:
        analysis_input: Optional dictionary or object specifying configuration,
                        custom file paths, pre-loaded DataFrames, or window boundaries.

    Returns:
        dict[str, Any]: Canonical EngineResult dictionary with keys:
            - analysis_id: Unique analysis identifier
            - status: Execution status ("completed")
            - cost_summary: High-level cost impact summary
            - anomalies: List of detected anomaly dictionaries
            - root_causes: List of evidence-supported root cause candidate episodes
            - recommendations: List of actionable remediation recommendations
            - total_anomalies: Total number of anomalies detected
            - total_root_causes: Total number of root cause episodes
            - total_recommendations: Total number of recommendations generated
    """
    # --------------------------------------------------------------------------
    # 1. Parse & Normalize AnalysisInput
    # --------------------------------------------------------------------------
    analysis_id = _extract_param(analysis_input, "analysis_id")
    if not analysis_id:
        analysis_id = f"analysis-{uuid.uuid4().hex[:12]}"

    calibration_start = _extract_param(
        analysis_input, "calibration_start", DEFAULT_CALIBRATION_START
    )
    calibration_end = _extract_param(
        analysis_input, "calibration_end", DEFAULT_CALIBRATION_END
    )
    detection_start = _extract_param(
        analysis_input, "detection_start", DEFAULT_DETECTION_START
    )
    detection_end = _extract_param(analysis_input, "detection_end", None)

    metrics_df = _extract_param(analysis_input, "metrics_df")
    metrics_path = _extract_param(analysis_input, "metrics_path")

    costs_df = _extract_param(analysis_input, "costs_df")
    costs_path = _extract_param(analysis_input, "costs_path")

    dependencies = _extract_param(analysis_input, "dependencies")
    dependencies_path = _extract_param(analysis_input, "dependencies_path")

    events = _extract_param(analysis_input, "events")
    events_path = _extract_param(analysis_input, "events_path")

    analysis_start = _extract_param(analysis_input, "analysis_start")
    analysis_end = _extract_param(analysis_input, "analysis_end")

    # --------------------------------------------------------------------------
    # 2. Historical Baseline Calculation
    # --------------------------------------------------------------------------
    if metrics_df is None:
        metrics_df = load_metrics(metrics_path)

    baseline_df = calculate_historical_baseline(
        metrics_df=metrics_df,
        calibration_start=calibration_start,
        calibration_end=calibration_end,
    )

    # --------------------------------------------------------------------------
    # 3. Time-Series Anomaly Detection
    # --------------------------------------------------------------------------
    anomalies_df = detect_anomalies(
        metrics_df=metrics_df,
        baseline_df=baseline_df,
        detection_start=detection_start,
        detection_end=detection_end,
        only_anomalies=True,
        filter_isolated_low=True,
    )
    anomalies = anomalies_df.to_dict(orient="records")

    # --------------------------------------------------------------------------
    # 4. Cost Attribution
    # --------------------------------------------------------------------------
    if costs_df is None:
        costs_df = load_costs(costs_path)

    # Window for cost attribution
    if analysis_start is None:
        analysis_start = detection_start or DEFAULT_DETECTION_START
    if analysis_end is None:
        analysis_end = costs_df["timestamp"].max()

    attribution_df = attribute_cost_change(
        costs_df=costs_df,
        analysis_start=analysis_start,
        analysis_end=analysis_end,
        calibration_start=calibration_start,
        calibration_end=calibration_end,
    )
    cost_summary = build_cost_summary(attribution_df)
    cost_attributions = attribution_df.to_dict(orient="records")

    # --------------------------------------------------------------------------
    # 5. Load Topology & Events
    # --------------------------------------------------------------------------
    if dependencies is None:
        dep_file = _find_data_file("dependencies_clean.csv", dependencies_path)
        dependencies = pd.read_csv(dep_file).to_dict(orient="records")
    elif isinstance(dependencies, pd.DataFrame):
        dependencies = dependencies.to_dict(orient="records")

    if events is None:
        ev_file = _find_data_file("events_clean.csv", events_path)
        events_df = pd.read_csv(ev_file)
        events_df["timestamp"] = pd.to_datetime(events_df["timestamp"])
        events = events_df.to_dict(orient="records")
    elif isinstance(events, pd.DataFrame):
        ev_df = events.copy()
        if "timestamp" in ev_df.columns:
            ev_df["timestamp"] = pd.to_datetime(ev_df["timestamp"])
        events = ev_df.to_dict(orient="records")

    # --------------------------------------------------------------------------
    # 6. Episode-Based Root Cause Analysis
    # --------------------------------------------------------------------------
    root_causes = analyze_root_causes(
        anomalies=anomalies,
        dependencies=dependencies,
        events=events,
        cost_attributions=cost_attributions,
    )

    # --------------------------------------------------------------------------
    # 7. Remediation Recommendations
    # --------------------------------------------------------------------------
    recommendations = generate_recommendations(
        root_causes=root_causes,
        anomalies=anomalies,
        cost_attributions=cost_attributions,
        cost_summary=cost_summary,
    )

    # --------------------------------------------------------------------------
    engine_result = EngineResult(
        analysis_id=str(analysis_id),
        status="completed",
        cost_summary=cost_summary,
        anomalies=anomalies,
        root_causes=root_causes,
        recommendations=recommendations,
        total_anomalies=len(anomalies),
        total_root_causes=len(root_causes),
        total_recommendations=len(recommendations),
    )

    return engine_result


if __name__ == "__main__":
    print("=" * 80)
    print("Cloud Shadow AI - Engine Orchestrator Self-Test")
    print("=" * 80)

    result = run_analysis()

    print(f"\n[+] Analysis ID: {result['analysis_id']}")
    print(f"[+] Status:      {result['status']}")
    print(f"[+] Cost Summary: {result['cost_summary']}")
    print(f"[+] Total Anomalies:       {result['total_anomalies']}")
    print(f"[+] Total Root Causes:     {result['total_root_causes']}")
    print(f"[+] Total Recommendations: {result['total_recommendations']}")
    print("\n[+] Top 5 Root Causes:")
    for idx, rc in enumerate(result["root_causes"][:5], 1):
        print(f"  #{idx} [{rc['service_id']}] metric={rc['metric']} conf={rc['confidence']:.4f} cost={rc['estimated_cost_impact']}")
    print("\n[+] Recommendations Sample:")
    for idx, rec in enumerate(result["recommendations"][:5], 1):
        print(f"  #{idx} [{rec['service_id']}] {rec['action']}")
    print("\n[+] Engine orchestrator self-test completed successfully.")
