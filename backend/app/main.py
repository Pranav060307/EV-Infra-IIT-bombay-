import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api_router import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("chargeatlas")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ChargeAtlas India Platform Backend...")
    logger.info(f"Environment: {settings.APP_ENV} | Debug: {settings.DEBUG}")
    yield
    logger.info("Shutting down ChargeAtlas India Platform Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Enterprise GIS-based decision-support platform for EV Charging Infrastructure "
        "Mapping, Gap Analysis, Demand Forecasting & Smart Site Recommendations across India."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set up CORS for React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to ChargeAtlas India Analytical Platform API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "project": "Techfest 2026-27 | EV Infra Map India Challenge (MHI & ICAT)",
        "team": "SuperNova - Sanjivani University"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

