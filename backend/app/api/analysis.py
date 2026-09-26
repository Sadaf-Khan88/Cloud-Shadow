from fastapi import APIRouter

from app.schemas.analysis import AnalysisResponse
from app.services.engine_client import run_engine_analysis

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/run", response_model=AnalysisResponse)
def run_analysis():
    return run_engine_analysis()