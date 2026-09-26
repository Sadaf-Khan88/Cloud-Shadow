"""
Cloud Shadow AI - Time-Series Anomaly Detector Engine
====================================================
Module: engine.anomaly.detector
Description: Identifies statistically significant and meaningful metric anomalies
             across the entire detection window by comparing time-series observations
             against a clean, unpolluted historical calibration baseline.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import List, Optional, Tuple, Union

import numpy as np
import pandas as pd

# Guarantee parent package accessibility regardless of execution directory
try:
    from engine.anomaly.baseline import (
        DEFAULT_CALIBRATION_END,
        DEFAULT_CALIBRATION_START,
        SUPPORTED_METRICS,
        calculate_historical_baseline,
        detect_metric_columns,
        load_metrics,
        validate_and_prepare_metrics,
    )
except ImportError:
    project_root = Path(__file__).resolve().parent.parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    from engine.anomaly.baseline import (
        DEFAULT_CALIBRATION_END,
        DEFAULT_CALIBRATION_START,
        SUPPORTED_METRICS,
        calculate_historical_baseline,
        detect_metric_columns,
        load_metrics,
        validate_and_prepare_metrics,
    )

# ==============================================================================
# Configurable Anomaly Detection Thresholds and Parameters
# ==============================================================================

# Time-series calibration and detection window boundaries
DEFAULT_CALIBRATION_START: str = "2026-03-01T00:00:00Z"
DEFAULT_CALIBRATION_END: str = "2026-03-03T23:59:59Z"
DEFAULT_DETECTION_START: str = "2026-03-04T00:00:00Z"
DEFAULT_DETECTION_END: Optional[str] = None

# Minimum historical observations required to establish a trustworthy baseline
MIN_OBSERVATIONS: int = 10

# Primary statistical threshold: minimum Z-score to indicate potential anomaly
Z_SCORE_THRESHOLD: float = 2.0

# Relative magnitude threshold: minimum percentage deviation from baseline
CHANGE_PERCENT_THRESHOLD: float = 20.0

# Safe surrogate Z-score assigned when historical variance is zero and current value deviates
ZERO_STD_Z_SCORE: float = 5.0

# Tolerance for zero/constant comparisons to avoid floating-point inaccuracies
EPSILON_TOLERANCE: float = 1e-5

# Upper scales for continuous score normalization
Z_SCORE_MAX_SCALE: float = 4.0
CHANGE_PERCENT_MAX_SCALE: float = 150.0

# Coefficient of Variation thresholds to gauge natural metric variability
HIGH_VARIABILITY_CV_THRESHOLD: float = 1.0
LOW_VARIABILITY_CV_THRESHOLD: float = 0.15

# Minimum absolute deviation threshold for discrete count metrics (e.g. errors)
MIN_COUNT_ABSOLUTE_DEVIATION: float = 2.0

# Severity score boundaries (bounded strictly within [0.0, 1.0])
SEVERITY_CRITICAL_THRESHOLD: float = 0.80
SEVERITY_HIGH_THRESHOLD: float = 0.60
SEVERITY_MEDIUM_THRESHOLD: float = 0.40
SEVERITY_LOW_THRESHOLD: float = 0.20

# Canonical expected output column schema
ANOMALY_OUTPUT_COLUMNS: List[str] = [
    "anomaly_id",
    "timestamp",
    "service_id",
    "metric",
    "baseline_value",
    "current_value",
    "absolute_deviation",
    "change_percent",
    "z_score",
    "anomaly_score",
    "severity",
]


def calculate_anomaly_score(
    current_value: float,
    baseline_median: float,
    baseline_std: float,
    absolute_deviation: float,
    change_percent: float,
    observations: int,
    metric: str = "",
) -> Tuple[float, float, str]:
    """
    Computes a normalized anomaly score [0.0, 1.0], z_score, and severity category.

    Calculation Strategy:
        1. Standardized Deviation (Z-score):
           Measures distance from baseline in units of historical dispersion.
           If baseline_std == 0:
             - current_value == baseline_median -> z = 0.0, normal
             - current_value != baseline_median -> z = ZERO_STD_Z_SCORE, critical
        2. Percentage Deviation:
           Measures relative scale of the change compared to typical level.
        3. Historical Variability Adjustment (CV):
           If historical variance is naturally high (CV > 1.0), weight Z-score higher
           (70%) to avoid false alarms from routine operational swings.
           If historical variance is very low (CV < 0.15), weight percentage change
           higher (55%) as even moderate shifts represent true anomalies.
        4. Dual-Evidence Gating:
           An observation requires both statistical evidence (Z >= Z_SCORE_THRESHOLD)
           AND material relative change (|pct| >= CHANGE_PERCENT_THRESHOLD) to avoid
           suppression. This prevents routine diurnal swings and tiny fluctuations on
           tight-variance metrics from crossing into anomaly territory.
        5. Discrete Count Gating:
           For count metrics ('errors'), fluctuations of <= 1 count (e.g. 0 <-> 1)
           are normal stochastic Poisson background noise and are suppressed.
        6. Severity Binning:
           score >= 0.80 -> 'critical'
           score >= 0.60 -> 'high'
           score >= 0.40 -> 'medium'
           score >= 0.20 -> 'low'
           otherwise     -> 'normal'

    Args:
        current_value: Observed metric value.
        baseline_median: Historical median baseline.
        baseline_std: Historical standard deviation.
        absolute_deviation: Absolute difference |current - baseline|.
        change_percent: Signed or absolute percentage change from baseline.
        observations: Number of historical records used in baseline.
        metric: Name of the metric (e.g., 'cpu', 'errors').

    Returns:
        Tuple[float, float, str]: (z_score, anomaly_score, severity)
    """
    if observations < MIN_OBSERVATIONS:
        return 0.0, 0.0, "normal"

    pct = abs(float(change_percent))

    if baseline_std > EPSILON_TOLERANCE:
        z = absolute_deviation / baseline_std
    else:
        if absolute_deviation <= EPSILON_TOLERANCE:
            return 0.0, 0.0, "normal"
        return ZERO_STD_Z_SCORE, 1.0, "critical"

    s_z = min(1.0, z / Z_SCORE_MAX_SCALE)
    s_pct = min(1.0, pct / CHANGE_PERCENT_MAX_SCALE)

    cv = baseline_std / max(abs(baseline_median), 1.0)
    if cv > HIGH_VARIABILITY_CV_THRESHOLD:
        w_z, w_pct = 0.70, 0.30
    elif cv < LOW_VARIABILITY_CV_THRESHOLD:
        w_z, w_pct = 0.45, 0.55
    else:
        w_z, w_pct = 0.60, 0.40

    raw_score = (w_z * s_z) + (w_pct * s_pct)

    # 1. Discrete count metric gating: small stochastic single-count shifts (e.g. 0 <-> 1) are normal noise
    if metric == "errors":
        if absolute_deviation <= 1.0:
            raw_score = 0.0
        elif absolute_deviation < 3.0:
            raw_score *= (absolute_deviation - 1.0) / 2.0

    # 2. Dual-evidence gating: require both statistical significance AND material percentage change
    if z < Z_SCORE_THRESHOLD or pct < CHANGE_PERCENT_THRESHOLD:
        dual_dampener = min(1.0, z / Z_SCORE_THRESHOLD) * min(1.0, pct / CHANGE_PERCENT_THRESHOLD)
        raw_score *= dual_dampener

    # 3. Floor suppression for standard dispersion (< 1.5 standard deviations)
    if z < 1.5:
        raw_score *= z / 1.5

    final_score = round(float(np.clip(raw_score, 0.0, 1.0)), 4)
    final_z = round(float(z), 4)

    if final_score >= SEVERITY_CRITICAL_THRESHOLD:
        severity = "critical"
    elif final_score >= SEVERITY_HIGH_THRESHOLD:
        severity = "high"
    elif final_score >= SEVERITY_MEDIUM_THRESHOLD:
        severity = "medium"
    elif final_score >= SEVERITY_LOW_THRESHOLD:
        severity = "low"
    else:
        severity = "normal"

    return final_z, final_score, severity


def detect_anomalies(
    metrics_df: pd.DataFrame,
    baseline_df: Optional[pd.DataFrame] = None,
    detection_start: Optional[Union[str, pd.Timestamp]] = None,
    detection_end: Optional[Union[str, pd.Timestamp]] = None,
    calibration_start: Optional[Union[str, pd.Timestamp]] = None,
    calibration_end: Optional[Union[str, pd.Timestamp]] = None,
    only_anomalies: bool = True,
    filter_isolated_low: bool = True,
) -> pd.DataFrame:
    """
    Evaluates every timestamp in the detection window against a clean calibration baseline
    and outputs meaningful operational anomalies.

    For every timestamp:
        for every service:
            for every metric:
                compare current value against calibration baseline
                calculate absolute_deviation
                calculate change_percent
                calculate z_score
                calculate anomaly_score
                classify severity

    Args:
        metrics_df: Full metrics DataFrame containing 'timestamp', 'service_id', and numeric metrics.
                    (Alternatively, a pre-computed baseline_report DataFrame for backward compatibility).
        baseline_df: Optional pre-calculated baseline DataFrame. If None, computes clean calibration
                     baseline using calculate_historical_baseline().
        detection_start: Start timestamp for anomaly evaluation (defaults to DEFAULT_DETECTION_START).
        detection_end: Optional end timestamp for anomaly evaluation (defaults to None / dataset end).
        calibration_start: Optional start timestamp for calibration (defaults to DEFAULT_CALIBRATION_START).
        calibration_end: Optional end timestamp for calibration (defaults to DEFAULT_CALIBRATION_END).
        only_anomalies: If True (default), outputs only meaningful anomalies ('low', 'medium', 'high', 'critical').
        filter_isolated_low: If True (default), filters out transient 1-hour isolated LOW anomalies
                             while preserving all sustained LOW anomalies (>= 2 consecutive hours)
                             and all MEDIUM, HIGH, and CRITICAL anomalies.

    Returns:
        pd.DataFrame: Anomalies DataFrame with columns:
            - anomaly_id: "{service_id}:{metric}:{timestamp}"
            - timestamp: Observation timestamp
            - service_id: Service identifier
            - metric: Metric name
            - baseline_value: Baseline median value
            - current_value: Current observed metric value
            - absolute_deviation: Absolute difference |current - baseline|
            - change_percent: Percentage change from baseline
            - z_score: Standardized deviation Z-score
            - anomaly_score: Normalized anomaly score [0.0, 1.0]
            - severity: Operational classification
    """
    if not isinstance(metrics_df, pd.DataFrame):
        raise ValueError(
            f"Input 'metrics_df' must be a pandas DataFrame, got {type(metrics_df).__name__}."
        )

    if metrics_df.empty:
        raise ValueError("Input 'metrics_df' is empty. Cannot perform anomaly detection.")

    # Backward compatibility: Support direct evaluation of a legacy baseline_report
    legacy_report_cols = {"baseline_median", "baseline_std", "current_value", "observations"}
    if legacy_report_cols.issubset(set(metrics_df.columns)):
        return _evaluate_legacy_report(metrics_df, only_anomalies=only_anomalies)

    df = validate_and_prepare_metrics(metrics_df)
    metric_cols = detect_metric_columns(df)

    # 1. Establish clean calibration baseline
    if baseline_df is None:
        baseline_df = calculate_historical_baseline(
            metrics_df=df,
            calibration_start=calibration_start or DEFAULT_CALIBRATION_START,
            calibration_end=calibration_end or DEFAULT_CALIBRATION_END,
        )

    # 2. Filter strictly for the detection window (all subsequent timestamps)
    start_ts = pd.to_datetime(detection_start or DEFAULT_DETECTION_START)
    mask = df["timestamp"] >= start_ts
    if detection_end is not None:
        end_ts = pd.to_datetime(detection_end)
        mask = mask & (df["timestamp"] <= end_ts)

    detection_df = df[mask].copy()
    if detection_df.empty:
        raise ValueError(
            f"No observations found in detection window starting from {start_ts}. "
            f"Dataset timestamp range: {df['timestamp'].min()} to {df['timestamp'].max()}."
        )

    # 3. Melt detection window observations
    detect_melted = detection_df.melt(
        id_vars=["timestamp", "service_id"],
        value_vars=metric_cols,
        var_name="metric",
        value_name="current_value",
    )

    # 4. Merge every timestamp observation with the baseline
    merged = pd.merge(
        detect_melted,
        baseline_df,
        on=["service_id", "metric"],
        how="inner",
    )

    merged["baseline_value"] = merged["baseline_median"]
    merged["absolute_deviation"] = (
        (merged["current_value"] - merged["baseline_median"]).abs().round(4)
    )

    # Calculate safe change percent
    delta = merged["current_value"] - merged["baseline_median"]
    base = merged["baseline_median"]
    zero_mask = base == 0.0
    change_pct = pd.Series(0.0, index=merged.index, dtype=float)
    change_pct.loc[~zero_mask] = (delta.loc[~zero_mask] / base.loc[~zero_mask]) * 100.0
    change_pct.loc[zero_mask] = np.where(
        merged.loc[zero_mask, "current_value"] == 0.0,
        0.0,
        np.where(merged.loc[zero_mask, "current_value"] > 0.0, 100.0, -100.0),
    )
    merged["change_percent"] = change_pct

    # 5. Evaluate anomaly score for every observation
    scores = [
        calculate_anomaly_score(
            current_value=float(row["current_value"]),
            baseline_median=float(row["baseline_median"]),
            baseline_std=float(row["baseline_std"]),
            absolute_deviation=float(row["absolute_deviation"]),
            change_percent=float(row["change_percent"]),
            observations=int(row["observations"]),
            metric=str(row["metric"]),
        )
        for _, row in merged.iterrows()
    ]

    merged["z_score"] = [s[0] for s in scores]
    merged["anomaly_score"] = [s[1] for s in scores]
    merged["severity"] = [s[2] for s in scores]

    # Format timestamp and unique timestamped anomaly_id
    if pd.api.types.is_datetime64_any_dtype(merged["timestamp"]):
        ts_formatted = merged["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    else:
        ts_formatted = pd.to_datetime(merged["timestamp"]).dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    merged["anomaly_id"] = (
        merged["service_id"].astype(str)
        + ":"
        + merged["metric"].astype(str)
        + ":"
        + ts_formatted
    )

    # Project to canonical columns
    output_df = merged[ANOMALY_OUTPUT_COLUMNS].copy()

    # Sort consistently by timestamp, service_id, metric
    output_df = output_df.sort_values(
        by=["timestamp", "service_id", "metric"]
    ).reset_index(drop=True)

    if only_anomalies:
        output_df = output_df[output_df["severity"] != "normal"].reset_index(drop=True)

        # Temporal persistence filter: suppress isolated 1-hour LOW blips
        if filter_isolated_low and not output_df.empty:
            output_df = _apply_persistence_filter(output_df)

    return output_df


def _apply_persistence_filter(anomalies_df: pd.DataFrame) -> pd.DataFrame:
    """
    Separates persistent incident anomalies from isolated 1-hour LOW severity blips.

    Preserves:
        - ALL critical, high, and medium anomalies (strong one-off spikes)
        - ALL sustained low anomalies (runs of >= 2 consecutive hours)
    Filters:
        - Isolated 1-hour blips of LOW severity
    """
    df = anomalies_df.copy()
    df = df.sort_values(by=["service_id", "metric", "timestamp"])

    df["_prev_ts"] = df.groupby(["service_id", "metric"])["timestamp"].shift(1)
    df["_time_diff"] = (df["timestamp"] - df["_prev_ts"]).dt.total_seconds() / 3600.0
    df["_is_new_run"] = df["_time_diff"] != 1.0
    df["_run_id"] = df.groupby(["service_id", "metric"])["_is_new_run"].cumsum()

    # Calculate run length for each continuous episode
    df["_run_len"] = df.groupby(["service_id", "metric", "_run_id"])["severity"].transform("count")

    # Isolate single-hour low blips
    is_isolated_low = (df["severity"] == "low") & (df["_run_len"] == 1)

    filtered_df = df[~is_isolated_low].copy()
    filtered_df = filtered_df.drop(
        columns=["_prev_ts", "_time_diff", "_is_new_run", "_run_id", "_run_len"]
    )
    return filtered_df.sort_values(by=["timestamp", "service_id", "metric"]).reset_index(drop=True)


def _evaluate_legacy_report(
    baseline_report: pd.DataFrame,
    only_anomalies: bool = True,
) -> pd.DataFrame:
    """Evaluates a legacy pre-computed baseline report DataFrame."""
    df = baseline_report.copy()
    ts_col = "current_timestamp" if "current_timestamp" in df.columns else "timestamp"
    if ts_col not in df.columns:
        raise ValueError("Missing timestamp column in legacy baseline_report.")

    df["timestamp"] = df[ts_col]
    df["baseline_value"] = df["baseline_median"]
    df["absolute_deviation"] = (df["current_value"] - df["baseline_median"]).abs().round(4)

    if pd.api.types.is_datetime64_any_dtype(df["timestamp"]):
        ts_formatted = df["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    else:
        ts_formatted = pd.to_datetime(df["timestamp"]).dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    df["anomaly_id"] = (
        df["service_id"].astype(str) + ":" + df["metric"].astype(str) + ":" + ts_formatted
    )

    scores = [
        calculate_anomaly_score(
            current_value=float(row["current_value"]),
            baseline_median=float(row["baseline_median"]),
            baseline_std=float(row["baseline_std"]),
            absolute_deviation=float(row["absolute_deviation"]),
            change_percent=float(row["change_percent"]),
            observations=int(row["observations"]),
            metric=str(row["metric"]),
        )
        for _, row in df.iterrows()
    ]

    df["z_score"] = [s[0] for s in scores]
    df["anomaly_score"] = [s[1] for s in scores]
    df["severity"] = [s[2] for s in scores]

    output_df = df[ANOMALY_OUTPUT_COLUMNS].sort_values(
        by=["timestamp", "service_id", "metric"]
    ).reset_index(drop=True)

    if only_anomalies:
        output_df = output_df[output_df["severity"] != "normal"].reset_index(drop=True)

    return output_df


def run_anomaly_detection(
    metrics_df: pd.DataFrame,
    calibration_start: Optional[Union[str, pd.Timestamp]] = None,
    calibration_end: Optional[Union[str, pd.Timestamp]] = None,
    detection_start: Optional[Union[str, pd.Timestamp]] = None,
    detection_end: Optional[Union[str, pd.Timestamp]] = None,
    only_anomalies: bool = True,
    filter_isolated_low: bool = True,
) -> pd.DataFrame:
    """
    End-to-end time-series convenience pipeline that builds a calibration baseline and evaluates
    every subsequent timestamp in the detection window.

    Pipeline:
        metrics_df -> clean calibration window -> baseline -> evaluate every timestamp -> anomalies

    Args:
        metrics_df: Raw or clean metrics DataFrame containing 'timestamp', 'service_id', and metrics.
        calibration_start: Optional calibration start timestamp (default: 2026-03-01T00:00:00Z).
        calibration_end: Optional calibration end timestamp (default: 2026-03-03T23:59:59Z).
        detection_start: Optional detection start timestamp (default: 2026-03-04T00:00:00Z).
        detection_end: Optional detection end timestamp (default: None / dataset end).
        only_anomalies: Whether to filter out normal records (default: True).
        filter_isolated_low: Whether to suppress isolated 1-hour LOW anomalies (default: True).

    Returns:
        pd.DataFrame: Detected time-series anomalies DataFrame.
    """
    return detect_anomalies(
        metrics_df=metrics_df,
        calibration_start=calibration_start,
        calibration_end=calibration_end,
        detection_start=detection_start,
        detection_end=detection_end,
        only_anomalies=only_anomalies,
        filter_isolated_low=filter_isolated_low,
    )


if __name__ == "__main__":
    print("=" * 80)
    print("Cloud Shadow AI - Time-Series Anomaly Detector Test Execution")
    print("=" * 80)

    try:
        metrics_data = load_metrics()
        print(f"[*] Loaded metrics dataset: {len(metrics_data)} total rows")
    except Exception as err:
        print(f"[!] Failed to load metrics: {err}")
        sys.exit(1)

    # 1. Run time-series anomaly detection across detection window (2026-03-04 onwards)
    anomalies_df = run_anomaly_detection(metrics_data, only_anomalies=True, filter_isolated_low=True)
    all_eval_df = run_anomaly_detection(metrics_data, only_anomalies=False, filter_isolated_low=False)

    total_timestamps = all_eval_df["timestamp"].nunique()
    total_evaluated = len(all_eval_df)
    total_anomalies = len(anomalies_df)

    print("\n" + "-" * 80)
    print("TIME-SERIES ANOMALY DETECTION SUMMARY:")
    print(f"  - Total timestamps evaluated: {total_timestamps}")
    print(f"  - Total service-metric observations evaluated: {total_evaluated}")
    print(f"  - Total meaningful anomalies detected: {total_anomalies} ({total_anomalies/total_evaluated*100:.1f}%)")
    print("-" * 80)

    print("\nANOMALY COUNT BY SEVERITY:")
    severity_counts = anomalies_df["severity"].value_counts()
    for sev in ["critical", "high", "medium", "low"]:
        cnt = severity_counts.get(sev, 0)
        print(f"  - {sev.upper():8}: {cnt}")
    print(f"  - NORMAL  : {len(all_eval_df) - total_anomalies}")

    print("\nANOMALY COUNT BY SERVICE:")
    service_counts = anomalies_df["service_id"].value_counts()
    for svc, cnt in service_counts.items():
        print(f"  - {svc:24}: {cnt}")

    print("\nANOMALY COUNT BY METRIC:")
    metric_counts = anomalies_df["metric"].value_counts()
    for m, cnt in metric_counts.items():
        print(f"  - {m:16}: {cnt}")

    print("\nFIRST 20 ANOMALIES:")
    pd.set_option("display.max_columns", None)
    pd.set_option("display.width", 1000)
    print(anomalies_df.head(20).to_string(index=False))
    print("=" * 80)
