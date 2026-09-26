from fastapi import APIRouter

from app.schemas.recommendation import RecommendationResponse

router = APIRouter()


@router.get(
    "/recommendations",
    response_model=list[RecommendationResponse],
)
def get_recommendations():
    return [
        {
            "title": "Enable caching for Service A",
            "estimatedSaving": 42000,
            "performanceImpact": "Positive",
            "reliabilityImpact": "Low Risk",
            "reason": "Repeated requests are increasing downstream traffic",
            "confidence": 88,
        }
    ]