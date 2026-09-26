from fastapi import APIRouter

from app.schemas.cost import CostSummaryResponse, CostTrendPoint
from app.services.mock_data import COST_SUMMARY, COST_TREND

router = APIRouter(prefix="/costs", tags=["costs"])


@router.get("/summary", response_model=CostSummaryResponse)
def get_cost_summary() -> CostSummaryResponse:
    return COST_SUMMARY


@router.get("/trend", response_model=list[CostTrendPoint])
def get_cost_trend() -> list[CostTrendPoint]:
    return COST_TREND
