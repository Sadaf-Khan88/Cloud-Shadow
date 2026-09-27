from __future__ import annotations

import math
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[3]

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from engine.analysis import run_analysis


def _to_json_safe(value: Any) -> Any:
    """Convert engine output into values FastAPI can serialize."""
    if isinstance(value, dict):
        return {
            str(key): _to_json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [_to_json_safe(item) for item in value]

    if hasattr(value, "isoformat"):
        return value.isoformat()

    if hasattr(value, "item"):
        return _to_json_safe(value.item())

    if isinstance(value, float) and not math.isfinite(value):
        return None

    return value


def run_engine_analysis() -> dict[str, Any]:
    """Run the real CloudShadow analysis engine."""
    result = run_analysis()
    return _to_json_safe(dict(result))
