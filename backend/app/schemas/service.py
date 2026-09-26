from pydantic import BaseModel


class ServiceResponse(BaseModel):
    id: str
    name: str
    cost: float
    trafficChange: float
    cpuUsage: float
    latency: float
    status: str
