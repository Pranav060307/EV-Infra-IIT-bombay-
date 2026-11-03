"""
ChargeAtlas India - EV Demand Forecasting API Endpoints (Phase 5)
Routes:
- GET /api/v1/forecasting/baseline : Authentic historical VAHAN records & segment counts
- GET /api/v1/forecasting/models   : Model evaluations, MAPE, and R-squared metrics
- GET /api/v1/forecasting/project  : Parametric fleet projections (2027, 2030, Scenarios)
- GET /api/v1/forecasting/charging-demand : Energy, peak power, required chargers & deficit
- GET /api/v1/forecasting/district/{name} : District-specific fleet & demand projections
"""

from typing import Optional
from fastapi import APIRouter, Query, Path, HTTPException
from app.services.forecasting import forecasting_engine

router = APIRouter()


@router.get("/baseline", summary="Authentic Historical VAHAN Baseline")
def get_historical_baseline():
    """Returns official 2024 VAHAN fleet data by vehicle segment with disclosure of time-series limitations."""
    return forecasting_engine.get_historical_baseline()


@router.get("/models", summary="Compare Forecasting Models & Validation Metrics")
def get_forecast_models():
    """Returns comparative validation results (MAPE, R²) for Linear, Exponential, and CAGR models."""
    return forecasting_engine.evaluate_forecast_models()


@router.get("/project", summary="Generate Parametric Fleet Projections")
def project_ev_fleet(
    horizon_year: int = Query(2027, description="Target planning horizon: 2027 or 2030"),
    scenario: str = Query("BASE", description="Scenario: CONSERVATIVE, BASE, AGGRESSIVE, or CUSTOM"),
    custom_cagr: Optional[float] = Query(None, description="Custom CAGR percentage (e.g. 25.0) when scenario=CUSTOM")
):
    """Generates segment-wise EV fleet growth projections and multi-year trajectory."""
    try:
        hy = int(getattr(horizon_year, "default", horizon_year) or 2027)
        sc = str(getattr(scenario, "default", scenario) or "BASE")
        c_cagr = getattr(custom_cagr, "default", custom_cagr)
        if c_cagr is not None and not isinstance(c_cagr, (int, float)):
            c_cagr = None
        elif c_cagr is not None:
            c_cagr = float(c_cagr)

        return forecasting_engine.generate_fleet_projection(
            horizon_year=hy,
            scenario=sc,
            custom_cagr=c_cagr
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/charging-demand", summary="Estimate Charging Infrastructure & Electrical Demand")
def estimate_charging_demand(
    horizon_year: int = Query(2027, description="Target planning horizon: 2027 or 2030"),
    scenario: str = Query("BASE", description="Scenario: CONSERVATIVE, BASE, AGGRESSIVE, or CUSTOM"),
    custom_cagr: Optional[float] = Query(None, description="Custom CAGR percentage when scenario=CUSTOM"),
    existing_chargers: Optional[int] = Query(None, description="Override existing chargers count")
):
    """
    Translates projected EV fleet into daily energy demand (MWh/day),
    peak power (MW), required public chargers, and infrastructure deficit.
    """
    try:
        hy = int(getattr(horizon_year, "default", horizon_year) or 2027)
        sc = str(getattr(scenario, "default", scenario) or "BASE")
        c_cagr = getattr(custom_cagr, "default", custom_cagr)
        if c_cagr is not None and not isinstance(c_cagr, (int, float)):
            c_cagr = None
        elif c_cagr is not None:
            c_cagr = float(c_cagr)

        ex_chg = getattr(existing_chargers, "default", existing_chargers)
        if ex_chg is not None and not isinstance(ex_chg, int):
            ex_chg = None

        return forecasting_engine.estimate_charging_demand(
            horizon_year=hy,
            scenario=sc,
            custom_cagr=c_cagr,
            existing_chargers=ex_chg
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/district/{district_name}", summary="District-Specific Fleet & Demand Forecast")
def get_district_forecast(
    district_name: str = Path(..., description="Name of district (e.g. Pune, Mumbai Suburban, Nashik)"),
    horizon_year: int = Query(2027, description="Target horizon: 2027 or 2030"),
    scenario: str = Query("BASE", description="Scenario: CONSERVATIVE, BASE, AGGRESSIVE, or CUSTOM"),
    custom_cagr: Optional[float] = Query(None, description="Custom CAGR percentage")
):
    """Calculates granular demand and required public chargers for an individual district."""
    try:
        hy = int(getattr(horizon_year, "default", horizon_year) or 2027)
        sc = str(getattr(scenario, "default", scenario) or "BASE")
        c_cagr = getattr(custom_cagr, "default", custom_cagr)
        if c_cagr is not None and not isinstance(c_cagr, (int, float)):
            c_cagr = None
        elif c_cagr is not None:
            c_cagr = float(c_cagr)

        return forecasting_engine.estimate_charging_demand(
            horizon_year=hy,
            scenario=sc,
            custom_cagr=c_cagr,
            district_name=district_name
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
