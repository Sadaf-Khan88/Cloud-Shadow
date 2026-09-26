from pydantic import BaseModel


class RootCauseChainItem(BaseModel):
    event: str
    change: str


class RootCauseResponse(BaseModel):
    title: str
    confidence: int
    impact: str
    chain: list[RootCauseChainItem]
    evidence: list[str]
