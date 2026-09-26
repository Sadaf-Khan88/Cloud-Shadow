from fastapi import APIRouter

from app.schemas.rootcause import RootCauseResponse
from app.services.mock_data import ROOT_CAUSE

router = APIRouter(tags=["root-causes"])


@router.get("/root-causes", response_model=RootCauseResponse)
def get_root_causes() -> RootCauseResponse:
    return ROOT_CAUSE
