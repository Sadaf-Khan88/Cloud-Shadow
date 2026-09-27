from .api.analysis import router as analysis_router
from .api.costs import router as costs_router
from .api.dependencies import router as dependencies_router
from .api.recommendations import router as recommendations_router
from .api.root_causes import router as root_causes_router
from .api.services import router as services_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CloudShadow API",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "https://cloud-shadow-seven.vercel.app/"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(costs_router)
app.include_router(root_causes_router)
app.include_router(services_router)
app.include_router(dependencies_router)
app.include_router(recommendations_router)
app.include_router(analysis_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "cloudshadow-backend",
    }
