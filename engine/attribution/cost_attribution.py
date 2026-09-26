"""
Cloud Shadow AI - Cost Attribution Engine
=========================================
Module: engine.attribution.cost_attribution

Purpose:
    Quantifies how much each service/resource contributes to a change in
    cloud spending.

Important:
    Cost attribution measures contribution to observed cost change.
    It does NOT establish causal relationships.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional, Union

import pandas as pd


DEFAULT_CALIBRATION_START = "2026-03-01T00:00:00Z"
DEFAULT_CALIBRATION_END = "2026-03-03T23:59:59Z"


def find_costs_file(custom_path: Optional[Union[str, Path]] = None) -> Path:
    """
    Locate the processed costs CSV.
    """

    if custom_path:
        path = Path(custom_path)

        if path.is_file():
            return path.resolve()

        raise FileNotFoundError(
            f"Specified costs file does not exist: {custom_path}"
        )

    module_dir = Path(__file__).resolve().parent
    project_root = module_dir.parent.parent
    cwd = Path.cwd()

    candidates = [
        cwd / "data" / "processed" / "costs_clean.csv",
        cwd / "data" / "data" / "processed" / "costs_clean.csv",
        project_root / "data" / "processed" / "costs_clean.csv",
        project_root / "data" / "data" / "processed" / "costs_clean.csv",
    ]

    for candidate in candidates:
        resolved = candidate.resolve()

        if resolved.is_file():
            return resolved

    searched = "\n  - ".join(str(path) for path in candidates)

    raise FileNotFoundError(
        "Could not locate 'costs_clean.csv'. "
        f"Searched:\n  - {searched}"
    )


def validate_and_prepare_costs(costs_df: pd.DataFrame) -> pd.DataFrame:
    """
    Validate and standardize the cost dataset.
    """

    if not isinstance(costs_df, pd.DataFrame):
        raise ValueError(
            f"costs_df must be a pandas DataFrame, "
            f"got {type(costs_df).__name__}"
        )

    if costs_df.empty:
        raise ValueError("Cost DataFrame is empty.")

    required_columns = {
        "timestamp",
        "service_id",
        "resource",
        "cost",
    }

    missing = required_columns - set(costs_df.columns)

    if missing:
        raise ValueError(
            f"Missing required cost columns: {sorted(missing)}. "
            f"Available columns: {list(costs_df.columns)}"
        )

    df = costs_df.copy()

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce",
    )

    if df["timestamp"].isna().any():
        raise ValueError(
            "One or more timestamps could not be parsed."
        )

    df["cost"] = pd.to_numeric(
        df["cost"],
        errors="coerce",
    )

    if df["cost"].isna().any():
        raise ValueError(
            "One or more cost values are invalid."
        )

    if (df["cost"] < 0).any():
        raise ValueError(
            "Cost values cannot be negative."
        )

    return df.sort_values("timestamp").reset_index(drop=True)


def load_costs(
    csv_path: Optional[Union[str, Path]] = None,
) -> pd.DataFrame:
    """
    Load and validate the processed cost dataset.
    """

    path = find_costs_file(csv_path)

    df = pd.read_csv(path)

    return validate_and_prepare_costs(df)


def calculate_hourly_costs(
    costs_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Aggregate raw cost records into hourly service/resource costs.

    Multiple billing records for the same service/resource/hour are summed.
    """

    df = validate_and_prepare_costs(costs_df)

    hourly = (
        df.assign(
            timestamp=df["timestamp"].dt.floor("h")
        )
        .groupby(
            [
                "timestamp",
                "service_id",
                "resource",
            ],
            as_index=False,
            observed=False,
        )["cost"]
        .sum()
    )

    return hourly


def calculate_cost_baseline(
    costs_df: pd.DataFrame,
    calibration_start: Optional[Union[str, pd.Timestamp]] = None,
    calibration_end: Optional[Union[str, pd.Timestamp]] = None,
) -> pd.DataFrame:
    """
    Calculate average hourly historical cost for each service/resource.

    The default calibration window is the clean Mar 1-3 period.
    """

    hourly = calculate_hourly_costs(costs_df)

    start = pd.to_datetime(
        calibration_start or DEFAULT_CALIBRATION_START
    )

    end = pd.to_datetime(
        calibration_end or DEFAULT_CALIBRATION_END
    )

    calibration = hourly[
        (hourly["timestamp"] >= start)
        & (hourly["timestamp"] <= end)
    ].copy()

    if calibration.empty:
        raise ValueError(
            f"No cost observations found between "
            f"{start} and {end}."
        )

    baseline = (
        calibration
        .groupby(
            ["service_id", "resource"],
            as_index=False,
            observed=False,
        )
        .agg(
            baseline_hourly_cost=("cost", "mean"),
            baseline_total_cost=("cost", "sum"),
            baseline_hours=("timestamp", "nunique"),
        )
    )

    baseline["baseline_hours"] = (
        baseline["baseline_hours"].astype(int)
    )

    return baseline


def calculate_current_cost(
    costs_df: pd.DataFrame,
    analysis_start: Union[str, pd.Timestamp],
    analysis_end: Union[str, pd.Timestamp],
) -> pd.DataFrame:
    """
    Calculate average hourly cost during the requested analysis window.
    """

    hourly = calculate_hourly_costs(costs_df)

    start = pd.to_datetime(analysis_start)
    end = pd.to_datetime(analysis_end)

    current = hourly[
        (hourly["timestamp"] >= start)
        & (hourly["timestamp"] <= end)
    ].copy()

    if current.empty:
        raise ValueError(
            f"No cost observations found between "
            f"{start} and {end}."
        )

    result = (
        current
        .groupby(
            ["service_id", "resource"],
            as_index=False,
            observed=False,
        )
        .agg(
            current_hourly_cost=("cost", "mean"),
            current_total_cost=("cost", "sum"),
            current_hours=("timestamp", "nunique"),
        )
    )

    result["current_hours"] = (
        result["current_hours"].astype(int)
    )

    return result


def attribute_cost_change(
    costs_df: pd.DataFrame,
    analysis_start: Union[str, pd.Timestamp],
    analysis_end: Union[str, pd.Timestamp],
    calibration_start: Optional[Union[str, pd.Timestamp]] = None,
    calibration_end: Optional[Union[str, pd.Timestamp]] = None,
) -> pd.DataFrame:
    """
    Attribute observed hourly cost change to service/resource pairs.

    Positive contribution means that the service/resource increased
    the observed hourly spending relative to its historical baseline.

    Negative contribution means that it reduced spending.

    Contribution percentage is calculated only against the total
    positive cost increase, so it answers:

        "What fraction of the observed cost increase came from this
         service/resource?"
    """

    baseline = calculate_cost_baseline(
        costs_df,
        calibration_start,
        calibration_end,
    )

    current = calculate_current_cost(
        costs_df,
        analysis_start,
        analysis_end,
    )

    result = pd.merge(
        baseline[
            [
                "service_id",
                "resource",
                "baseline_hourly_cost",
            ]
        ],
        current[
            [
                "service_id",
                "resource",
                "current_hourly_cost",
            ]
        ],
        on=["service_id", "resource"],
        how="outer",
    )

    numeric_columns = [
        "baseline_hourly_cost",
        "current_hourly_cost",
    ]

    result[numeric_columns] = (
        result[numeric_columns]
        .fillna(0.0)
    )

    result["hourly_cost_change"] = (
        result["current_hourly_cost"]
        - result["baseline_hourly_cost"]
    )

    baseline_cost = result["baseline_hourly_cost"]

    result["change_percent"] = 0.0

    nonzero_baseline = baseline_cost != 0

    result.loc[nonzero_baseline, "change_percent"] = (
        result.loc[nonzero_baseline, "hourly_cost_change"]
        / baseline_cost.loc[nonzero_baseline]
        * 100.0
    )

    positive_increase = (
        result["hourly_cost_change"]
        .clip(lower=0)
    )

    total_positive_increase = positive_increase.sum()

    if total_positive_increase > 0:
        result["contribution_percent"] = (
            positive_increase
            / total_positive_increase
            * 100.0
        )
    else:
        result["contribution_percent"] = 0.0

    result["direction"] = "unchanged"

    result.loc[
        result["hourly_cost_change"] > 0,
        "direction",
    ] = "increase"

    result.loc[
        result["hourly_cost_change"] < 0,
        "direction",
    ] = "decrease"

    result = result.sort_values(
        by="hourly_cost_change",
        ascending=False,
    ).reset_index(drop=True)

    return result[
        [
            "service_id",
            "resource",
            "baseline_hourly_cost",
            "current_hourly_cost",
            "hourly_cost_change",
            "change_percent",
            "contribution_percent",
            "direction",
        ]
    ]


def build_cost_summary(
    attribution_df: pd.DataFrame,
) -> dict:
    """
    Build a high-level cost summary from attribution results.
    """

    baseline_total = (
        attribution_df["baseline_hourly_cost"].sum()
    )

    current_total = (
        attribution_df["current_hourly_cost"].sum()
    )

    absolute_change = current_total - baseline_total

    if baseline_total != 0:
        change_percent = (
            absolute_change
            / baseline_total
            * 100.0
        )
    else:
        change_percent = 0.0

    return {
        "baseline_hourly_cost": round(
            float(baseline_total),
            6,
        ),
        "current_hourly_cost": round(
            float(current_total),
            6,
        ),
        "hourly_cost_change": round(
            float(absolute_change),
            6,
        ),
        "change_percent": round(
            float(change_percent),
            2,
        ),
    }


if __name__ == "__main__":
    print("=" * 80)
    print("Cloud Shadow AI - Cost Attribution Engine Test")
    print("=" * 80)

    try:
        costs_file = find_costs_file()

        print(
            f"[*] Found costs file at: {costs_file}"
        )

        costs = load_costs(costs_file)

        print(
            f"[+] Loaded cost dataset: "
            f"{len(costs)} rows"
        )

        print(
            f"[+] Time range: "
            f"{costs['timestamp'].min()} → "
            f"{costs['timestamp'].max()}"
        )

        print()

        # Demonstration analysis window.
        # This covers the first detection day after calibration.
        analysis_start = "2026-03-04T00:00:00Z"
        analysis_end = "2026-03-04T23:00:00Z"

        attribution = attribute_cost_change(
            costs_df=costs,
            analysis_start=analysis_start,
            analysis_end=analysis_end,
        )

        summary = build_cost_summary(attribution)

        print("-" * 80)
        print("COST SUMMARY")
        print("-" * 80)

        for key, value in summary.items():
            print(
                f"  - {key}: {value}"
            )

        print()
        print("-" * 80)
        print("TOP COST CONTRIBUTORS")
        print("-" * 80)

        print(
            attribution[
                attribution["hourly_cost_change"] > 0
            ]
            .head(15)
            .to_string(index=False)
        )

        print("=" * 80)

    except Exception as exc:
        print(
            f"[!] Cost attribution test failed: {exc}"
        )
        raise