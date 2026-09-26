from fastapi import APIRouter

from app.schemas.service import ServiceResponse
from app.services.mock_data import SERVICES

router = APIRouter(tags=["services"])


@router.get("/services", response_model=list[ServiceResponse])
def get_services() -> list[ServiceResponse]:
    return SERVICES
