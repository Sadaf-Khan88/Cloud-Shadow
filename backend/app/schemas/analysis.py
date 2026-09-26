from typing import Any

from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    cost_summary: dict[str, Any]
    anomalies: list[dict[str, Any]]
    root_causes: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    total_anomalies: int
    total_root_causes: int
    total_recommendations: int