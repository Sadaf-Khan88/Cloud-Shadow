from pydantic import BaseModel


class CostSummaryResponse(BaseModel):
    currentCost: float
    previousCost: float
    percentageChange: float
    riskLevel: str
    performanceScore: int
    reliabilityScore: int


class CostTrendPoint(BaseModel):
    date: str
    cost: float

