from fastapi import APIRouter
from app.api.v1.endpoints import health, datasets, gis, forecasting, recommendations, auth

api_router = APIRouter()

# Core diagnostic and health endpoints
api_router.include_router(health.router, tags=["Health & System Diagnostics"])

# Security & Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Security: Authentication & RBAC"])

# Module 1: Data Integration & Dataset Management
api_router.include_router(datasets.router, prefix="/datasets", tags=["Module 1: Dataset Pipeline"])

# Module 2 & Phase 3/4: GIS Engine, Charging Gap Assessment & Policy Benchmarks
api_router.include_router(gis.router, prefix="/gis", tags=["Phase 3 & 4: GIS Engine & Charging Gap Assessment"])

# Phase 5: EV Demand Forecasting
api_router.include_router(forecasting.router, prefix="/forecasting", tags=["Phase 5: EV Demand Forecasting Engine"])

# Phase 5: Intelligent Charging Site Recommendation Engine & Optimization
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Phase 5: Intelligent Site Recommender & MCLP Optimization"])
