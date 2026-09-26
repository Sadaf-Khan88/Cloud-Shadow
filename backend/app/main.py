from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.costs import router as costs_router
from app.api.root_causes import router as root_causes_router
from app.api.services import router as services_router

app = FastAPI(
    title="CloudShadow API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(costs_router)
app.include_router(root_causes_router)
app.include_router(services_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "cloudshadow-backend",
    }
