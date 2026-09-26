"""
Cloud Shadow AI - Anomaly Baseline Engine
========================================
Module: engine.anomaly.baseline
Description: Computes statistical baselines for service metrics and compares
             current values against normal historical behavior.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional, Sequence, Union

import numpy as np
import pandas as pd

# Canonical metrics supported by Cloud Shadow AI
SUPPORTED_METRICS: List[str] = [
    "cpu",
    "memory",
    "requests",
    "latency",
    "errors",
    "network_in",
    "network_out",
    "db_queries",
]

# Configurable calibration window constants (clean pre-incident period)
DEFAULT_CALIBRATION_START: str = "2026-03-01T00:00:00Z"
DEFAULT_CALIBRATION_END: str = "2026-03-03T23:59:59Z"


def find_metrics_file(custom_path: Optional[Union[str, Path]] = None) -> Path:
    """
    Locates the processed metrics CSV file across standard project locations.

    Args:
        custom_path: Optional explicit file path to search for.

    Returns:
        Path: Resolved absolute path to the metrics CSV.

    Raises:
        FileNotFoundError: If the metrics file cannot be found in any candidate path.
    """
    if custom_path:
        p = Path(custom_path)
        if p.is_file():
            return p.resolve()
        raise FileNotFoundError(f"Specified metrics file does not exist: {custom_path}")

    # Standard candidate paths
    module_dir = Path(__file__).resolve().parent
    project_root = module_dir.parent.parent
    cwd = Path.cwd()

    candidates = [
        cwd / "data" / "processed" / "metrics_clean.csv",
        cwd / "data" / "data" / "processed" / "metrics_clean.csv",
        project_root / "data" / "processed" / "metrics_clean.csv",
        project_root / "data" / "data" / "processed" / "metrics_clean.csv",
        module_dir / ".." / ".." / "data" / "processed" / "metrics_clean.csv",
        module_dir / ".." / ".." / "data" / "data" / "processed" / "metrics_clean.csv",
    ]

    for candidate in candidates:
        candidate_resolved = candidate.resolve()
        if candidate_resolved.is_file():
            return candidate_resolved

    searched_str = "\n  - ".join(str(c) for c in candidates)
    raise FileNotFoundError(
        f"Could not locate 'metrics_clean.csv'. Searched in candidate paths:\n  - {searched_str}"
    )


def load_metrics(csv_path: Optional[Union[str, Path]] = None) -> pd.DataFrame:
    """
    Loads processed metrics data from CSV and standardizes timestamps.

    Args:
        csv_path: Optional file path. If None, automatically searches candidate locations.

    Returns:
        pd.DataFrame: Loaded metrics DataFrame with parsed datetime timestamps.

    Raises:
        FileNotFoundError: If the CSV file is not found.
        ValueError: If required columns ('timestamp', 'service_id') are missing.
    """
    resolved_path = find_metrics_file(csv_path)
    df = pd.read_csv(resolved_path)
    return validate_and_prepare_metrics(df)


def validate_and_prepare_metrics(metrics_df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates input metrics DataFrame and parses timestamps into pandas datetime.

    Args:
        metrics_df: DataFrame containing service metrics.

    Returns:
        pd.DataFrame: Validated DataFrame copy with standardized datetime index/column.

    Raises:
        ValueError: If input is not a DataFrame, is empty, or lacks required columns.
    """
    if not isinstance(metrics_df, pd.DataFrame):
        raise ValueError(
            f"Input 'metrics_df' must be a pandas DataFrame, got {type(metrics_df).__name__}."
        )

    if metrics_df.empty:
        raise ValueError("Input 'metrics_df' is empty. Cannot compute baseline.")

    required_cols = {"timestamp", "service_id"}
    missing_cols = required_cols - set(metrics_df.columns)
    if missing_cols:
        raise ValueError(
            f"Missing required columns in metrics_df: {sorted(list(missing_cols))}. "
            f"Available columns: {list(metrics_df.columns)}"
        )

    df_copy = metrics_df.copy()

    # Convert timestamp to pandas datetime
    if not pd.api.types.is_datetime64_any_dtype(df_copy["timestamp"]):
        try:
            df_copy["timestamp"] = pd.to_datetime(df_copy["timestamp"])
        except Exception as e:
            raise ValueError(f"Failed to parse 'timestamp' column as datetime: {e}") from e

    return df_copy


def detect_metric_columns(
    metrics_df: pd.DataFrame,
    supported_metrics: Optional[Sequence[str]] = None,
) -> List[str]:
    """
    Dynamically detects numeric metric columns, ignoring non-numeric and identifier columns.

    Preserves canonical ordering for known metrics, followed by any other numeric columns.

    Args:
        metrics_df: Metrics DataFrame.
        supported_metrics: Optional preferred ordering of metric column names.

    Returns:
        List[str]: List of detected metric column names.

    Raises:
        ValueError: If no numeric metric columns are present.
    """
    if supported_metrics is None:
        supported_metrics = SUPPORTED_METRICS

    exclude_cols = {"timestamp", "service_id"}
    all_numeric = [
        col
        for col in metrics_df.columns
        if col not in exclude_cols and pd.api.types.is_numeric_dtype(metrics_df[col])
    ]

    if not all_numeric:
        raise ValueError(
            f"No numeric metric columns detected in metrics_df. "
            f"Columns evaluated: {[c for c in metrics_df.columns if c not in exclude_cols]}"
        )

    # Order known supported metrics first, then any extra numeric metrics alphabetically
    ordered_metrics: List[str] = [m for m in supported_metrics if m in all_numeric]
    extra_metrics: List[str] = sorted([m for m in all_numeric if m not in ordered_metrics])
    return ordered_metrics + extra_metrics


def calculate_historical_baseline(
    metrics_df: pd.DataFrame,
    calibration_start: Optional[Union[str, pd.Timestamp]] = None,
    calibration_end: Optional[Union[str, pd.Timestamp]] = None,
) -> pd.DataFrame:
    """
    Calculates robust historical baseline statistics for each service and metric
    strictly over a clean calibration window.

    The calibration window represents normal, unpolluted operational behavior and
    excludes known incident or anomalous periods.

    Args:
        metrics_df: Full DataFrame containing 'timestamp', 'service_id', and numeric metrics.
        calibration_start: Optional start timestamp for calibration (defaults to DEFAULT_CALIBRATION_START).
        calibration_end: Optional end timestamp for calibration (defaults to DEFAULT_CALIBRATION_END).

    Returns:
        pd.DataFrame: Baseline statistics per service_id and metric.
            Columns:
                - service_id
                - metric
                - baseline_median
                - baseline_mean
                - baseline_std
                - historical_min
                - historical_max
                - observations

    Raises:
        ValueError: If input is invalid or calibration window yields no observations.
    """
    df = validate_and_prepare_metrics(metrics_df)
    metric_cols = detect_metric_columns(df)

    start_ts = pd.to_datetime(calibration_start or DEFAULT_CALIBRATION_START)
    end_ts = pd.to_datetime(calibration_end or DEFAULT_CALIBRATION_END)

    # Filter strictly for the calibration window
    mask = (df["timestamp"] >= start_ts) & (df["timestamp"] <= end_ts)
    calib_df = df[mask].copy()

    if calib_df.empty:
        raise ValueError(
            f"Calibration window from {start_ts} to {end_ts} contains no records. "
            f"Available dataset timestamp range: {df['timestamp'].min()} to {df['timestamp'].max()}."
        )

    # Melt calibration observations to long format
    melted = calib_df.melt(
        id_vars=["timestamp", "service_id"],
        value_vars=metric_cols,
        var_name="metric",
        value_name="value",
    )

    grouped = melted.groupby(["service_id", "metric"], observed=False)["value"]

    baseline = grouped.agg(
        baseline_median="median",
        baseline_mean="mean",
        baseline_std=lambda x: float(x.std(ddof=1)) if len(x) > 1 else 0.0,
        historical_min="min",
        historical_max="max",
        observations="count",
    ).reset_index()

    baseline["baseline_std"] = baseline["baseline_std"].fillna(0.0)
    baseline["observations"] = baseline["observations"].astype(int)

    # Order metrics to match canonical ordering
    metric_order_map = {m: i for i, m in enumerate(metric_cols)}
    baseline["_metric_order"] = baseline["metric"].map(lambda m: metric_order_map.get(m, 999))
    baseline = baseline.sort_values(by=["service_id", "_metric_order"]).drop(
        columns=["_metric_order"]
    ).reset_index(drop=True)

    expected_cols = [
        "service_id",
        "metric",
        "baseline_median",
        "baseline_mean",
        "baseline_std",
        "historical_min",
        "historical_max",
        "observations",
    ]
    return baseline[expected_cols]


def calculate_baseline(metrics_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates robust baseline statistics for each service and metric across the provided DataFrame.

    Note: For clean pre-incident baselining that prevents anomaly contamination,
          prefer using calculate_historical_baseline().

    Args:
        metrics_df: DataFrame containing 'timestamp', 'service_id', and numeric metric columns.

    Returns:
        pd.DataFrame: Baseline statistics per service_id and metric.
    """
    df = validate_and_prepare_metrics(metrics_df)
    metric_cols = detect_metric_columns(df)

    melted = df.melt(
        id_vars=["timestamp", "service_id"],
        value_vars=metric_cols,
        var_name="metric",
        value_name="value",
    )

    grouped = melted.groupby(["service_id", "metric"], observed=False)["value"]

    baseline = grouped.agg(
        baseline_median="median",
        baseline_mean="mean",
        baseline_std=lambda x: float(x.std(ddof=1)) if len(x) > 1 else 0.0,
        historical_min="min",
        historical_max="max",
        observations="count",
    ).reset_index()

    baseline["baseline_std"] = baseline["baseline_std"].fillna(0.0)
    baseline["observations"] = baseline["observations"].astype(int)

    metric_order_map = {m: i for i, m in enumerate(metric_cols)}
    baseline["_metric_order"] = baseline["metric"].map(lambda m: metric_order_map.get(m, 999))
    baseline = baseline.sort_values(by=["service_id", "_metric_order"]).drop(
        columns=["_metric_order"]
    ).reset_index(drop=True)

    expected_cols = [
        "service_id",
        "metric",
        "baseline_median",
        "baseline_mean",
        "baseline_std",
        "historical_min",
        "historical_max",
        "observations",
    ]
    return baseline[expected_cols]


def calculate_current_value(metrics_df: pd.DataFrame) -> pd.DataFrame:
    """
    Identifies the latest available value and timestamp for every service_id + metric.

    Args:
        metrics_df: DataFrame containing 'timestamp', 'service_id', and numeric metric columns.

    Returns:
        pd.DataFrame: Latest values per service_id and metric.
    """
    df = validate_and_prepare_metrics(metrics_df)
    metric_cols = detect_metric_columns(df)

    melted = df.melt(
        id_vars=["timestamp", "service_id"],
        value_vars=metric_cols,
        var_name="metric",
        value_name="value",
    )

    sorted_melted = melted.dropna(subset=["value"]).sort_values(by="timestamp")
    latest = (
        sorted_melted.groupby(["service_id", "metric"], observed=False)
        .last()
        .reset_index()
    )

    latest = latest.rename(columns={"value": "current_value"})

    metric_order_map = {m: i for i, m in enumerate(metric_cols)}
    latest["_metric_order"] = latest["metric"].map(lambda m: metric_order_map.get(m, 999))
    latest = latest.sort_values(by=["service_id", "_metric_order"]).drop(
        columns=["_metric_order"]
    ).reset_index(drop=True)

    expected_cols = ["service_id", "metric", "current_value", "timestamp"]
    return latest[expected_cols]


def build_baseline_report(
    metrics_df: pd.DataFrame,
    calibration_start: Optional[Union[str, pd.Timestamp]] = None,
    calibration_end: Optional[Union[str, pd.Timestamp]] = None,
) -> pd.DataFrame:
    """
    Combines baseline statistics with latest current values and computes deviations.

    If calibration_start or calibration_end is specified, computes a clean calibration baseline;
    otherwise computes baseline across the full DataFrame for backward compatibility.
    """
    df = validate_and_prepare_metrics(metrics_df)
    if calibration_start is not None or calibration_end is not None:
        baseline_df = calculate_historical_baseline(df, calibration_start, calibration_end)
    else:
        baseline_df = calculate_baseline(df)
        
    current_df = calculate_current_value(df)

    report = pd.merge(
        baseline_df,
        current_df,
        on=["service_id", "metric"],
        how="inner",
    )

    report = report.rename(columns={"timestamp": "current_timestamp"})

    delta = report["current_value"] - report["baseline_median"]
    median = report["baseline_median"]

    zero_mask = median == 0.0
    change_pct = pd.Series(0.0, index=report.index, dtype=float)
    change_pct.loc[~zero_mask] = (delta.loc[~zero_mask] / median.loc[~zero_mask]) * 100.0

    current_zero_base = report.loc[zero_mask, "current_value"]
    change_pct.loc[zero_mask] = np.where(
        current_zero_base == 0.0,
        0.0,
        np.where(current_zero_base > 0.0, 100.0, -100.0),
    )

    report["absolute_change"] = delta
    report["change_percent"] = change_pct

    expected_cols = [
        "service_id",
        "metric",
        "baseline_median",
        "baseline_mean",
        "baseline_std",
        "historical_min",
        "historical_max",
        "observations",
        "current_value",
        "current_timestamp",
        "absolute_change",
        "change_percent",
    ]
    return report[expected_cols]


if __name__ == "__main__":
    print("=" * 80)
    print("Cloud Shadow AI - Baseline Module Test Execution")
    print("=" * 80)

    try:
        metrics_file = find_metrics_file()
        print(f"[*] Found metrics file at: {metrics_file}")
    except FileNotFoundError as err:
        print(f"[!] Error: {err}")
        exit(1)

    raw_df = pd.read_csv(metrics_file)
    print(f"[+] Loaded raw dataset: {raw_df.shape[0]} rows, {raw_df.shape[1]} columns")

    # Clean calibration baseline test
    clean_baseline = calculate_historical_baseline(raw_df)
    print(f"[+] Calculated clean calibration baseline ({clean_baseline['observations'].iloc[0]} hours per service)")
    print(clean_baseline.head(10).to_string(index=False))
    print("=" * 80)
