from fastapi import APIRouter

from app.schemas.dependency import DependencyResponse

router = APIRouter()


@router.get("/dependencies", response_model=DependencyResponse)
def get_dependencies():
    return {
        "nodes": [
            {
                "id": "api",
                "label": "API Gateway"
            },
            {
                "id": "service-a",
                "label": "Service A"
            },
            {
                "id": "service-b",
                "label": "Service B"
            },
            {
                "id": "database",
                "label": "Database"
            }
        ],
        "edges": [
            {
                "source": "api",
                "target": "service-a"
            },
            {
                "source": "service-a",
                "target": "service-b"
            },
            {
                "source": "service-b",
                "target": "database"
            }
        ]
    }