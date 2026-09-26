from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    title: str
    estimatedSaving: float
    performanceImpact: str
    reliabilityImpact: str
    reason: str
    confidence: int
