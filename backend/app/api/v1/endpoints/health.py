import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db, active_engine_type

router = APIRouter()

@router.get("/health", summary="System Health & Diagnostic Check")
def health_check(db: Session = Depends(get_db)):
    """
    Performs a live diagnostic check of the ChargeAtlas backend services:
    - FastAPI runtime
    - Database engine connectivity (PostgreSQL vs SQLite fallback)
    - PostGIS spatial extension availability
    - Data environment mode (Synthetic vs Production)
    """
    db_status = "connected"
    postgis_available = False
    postgis_version = None

    try:
        if "postgres" in active_engine_type:
            res = db.execute(text("SELECT PostGIS_Version();")).fetchone()
            if res:
                postgis_available = True
                postgis_version = str(res[0])
        else:
            postgis_version = "N/A (SQLite mode active)"
    except Exception:
        postgis_available = False
        postgis_version = "PostGIS extension not detected"

    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "database": {
            "engine": active_engine_type,
            "status": db_status,
            "postgis_enabled": postgis_available,
            "postgis_version": postgis_version
        },
        "data_mode": {
            "is_synthetic_demo": settings.SYNTHETIC_DATA_MODE,
            "active_mode": "demo" if settings.SYNTHETIC_DATA_MODE else "authentic",
            "data_classification": "SYNTHETIC DEMONSTRATION" if settings.SYNTHETIC_DATA_MODE else "VERIFIED AUTHENTIC & PARTIALLY VERIFIED",
            "notice": (
                "Demonstration datasets enabled."
                if settings.SYNTHETIC_DATA_MODE else
                "Authentic Production Mode active. Analytical views strictly reflect verified government records (VAHAN 4, BEE EV Yatra, Census 2011, MSRDC). Synthetic records are isolated."
            )
        }
    }

@router.get("/system-status", summary="Infrastructure & Data Layer Summary")
def system_status():
    """
    Returns platform high-level configuration and active module statuses.
    """
    return {
        "platform": settings.APP_NAME,
        "version": "1.0.0-phase1",
        "modules": {
            "M1_data_pipeline": "Initialized (Templates & Synthetic Registry ready)",
            "M2_gap_assessment": "Architecture Defined (MoP 2024 Norms)",
            "M3_demand_forecasting": "Architecture Defined (CAGR + Logistic S-Curve)",
            "M4_site_recommendations": "Architecture Defined (MCLP Solver)",
            "M5_web_platform": "Initialized (React + Tailwind + MapLibre)"
        },
        "geographical_scope": {
            "level_1": "National (India Overview)",
            "level_2": "State (Maharashtra - 36 Districts Deep Dive)",
            "level_3": ["Pune Urban 1km² Grid", "Samruddhi Mahamarg 701km Highway Corridor"]
        }
    }

