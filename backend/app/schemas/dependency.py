from pydantic import BaseModel


class DependencyNode(BaseModel):
    id: str
    label: str


class DependencyEdge(BaseModel):
    source: str
    target: str


class DependencyResponse(BaseModel):
    nodes: list[DependencyNode]
    edges: list[DependencyEdge]

