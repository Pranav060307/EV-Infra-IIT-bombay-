from fastapi import APIRouter
from app.api.v1.endpoints import health, datasets

api_router = APIRouter()

# Core diagnostic and health endpoints
api_router.include_router(health.router, tags=["Health & System Diagnostics"])

# Module 1: Data Integration & Dataset Management
api_router.include_router(datasets.router, prefix="/datasets", tags=["Module 1: Dataset Pipeline"])

