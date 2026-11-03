"""
ChargeAtlas India - EV Demand Forecasting Engine Automated Test Suite (Phase 5)
Tests:
- Authentic historical baseline data retrieval & category breakdown (2W, 3W, 4W, BUS).
- Time-series limitations disclosure.
- Linear, Exponential, and CAGR model evaluations and comparative validation metrics (MAPE, R²).
- Parametric fleet projections for 2027 and 2030 across Low/Conservative, Base, Aggressive, and Custom scenarios.
- Granular charging demand estimation: Daily MWh, Peak MW, Required Chargers, and Deficit.
- Segment-specific energy consumption parameters and public charging share.
- District-specific forecasting (Pune, Mumbai Suburban, Nashik).
"""

import os
import sys
import pytest

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.forecasting import forecasting_engine
from app.api.v1.endpoints.forecasting import (
    get_historical_baseline,
    get_forecast_models,
    project_ev_fleet,
    estimate_charging_demand,
    get_district_forecast
)


def test_historical_baseline():
    """Verify authentic historical baseline from VAHAN 4 records."""
    data = get_historical_baseline()
    assert data["state"] == "Maharashtra"
    assert data["baseline_year"] == 2024
    assert data["total_ev_registrations"] > 800000
    assert "data_limitations_disclosure" in data
    
    breakdown = data["segment_breakdown"]
    assert "2W" in breakdown and breakdown["2W"]["count"] > 500000
    assert "3W" in breakdown and breakdown["3W"]["count"] > 100000
    assert "4W" in breakdown and breakdown["4W"]["count"] > 50000
    assert "BUS" in breakdown and breakdown["BUS"]["count"] > 1000
    
    # Verify shares sum to ~100%
    total_share = sum(b["share_pct"] for b in breakdown.values())
    assert 99.0 <= total_share <= 101.0


def test_forecast_models_evaluation():
    """Verify comparative model evaluation (MAPE, R²) against 2021-2024 milestones."""
    models_data = get_forecast_models()
    assert "validation_period" in models_data
    models = models_data["models_evaluated"]
    assert len(models) >= 3
    
    model_ids = [m["model_id"] for m in models]
    assert "CAGR_PARAMETRIC" in model_ids
    assert "EXPONENTIAL" in model_ids
    assert "LINEAR" in model_ids

    for m in models:
        assert "mape_percentage" in m
        assert m["mape_percentage"] >= 0.0
        assert "formula" in m


def test_fleet_projections_2027_and_2030():
    """Verify fleet projection generation across horizon years and policy scenarios."""
    # 2027 Base Scenario
    proj_2027 = project_ev_fleet(horizon_year=2027, scenario="BASE")
    assert proj_2027["horizon_year"] == 2027
    assert proj_2027["years_projected"] == 3
    assert proj_2027["projected_fleet"]["total"] > proj_2027["baseline_2024"]["total"]
    assert len(proj_2027["trajectory"]) == 4  # 2024, 2025, 2026, 2027

    # 2030 Aggressive Scenario
    proj_2030 = project_ev_fleet(horizon_year=2030, scenario="AGGRESSIVE")
    assert proj_2030["horizon_year"] == 2030
    assert proj_2030["years_projected"] == 6
    assert proj_2030["projected_fleet"]["total"] > proj_2027["projected_fleet"]["total"]
    assert len(proj_2030["trajectory"]) == 7  # 2024 through 2030

    # Custom CAGR Scenario
    custom_res = project_ev_fleet(horizon_year=2027, scenario="CUSTOM", custom_cagr=22.5)
    assert custom_res["composite_cagr_pct"] == 22.5
    assert custom_res["scenario"] == "CUSTOM"


def test_charging_demand_estimation():
    """Verify energy (MWh/day), peak power (MW), required chargers, and deficit calculations."""
    demand = estimate_charging_demand(horizon_year=2027, scenario="BASE")
    
    cd = demand["charging_demand"]
    assert cd["total_public_energy_mwh_day"] > 500.0
    assert cd["peak_charging_power_mw"] > 50.0
    
    # Verify segment-specific consumption values
    sb = cd["segment_breakdown"]
    assert sb["2W"]["consumption_kwh_per_km"] == 0.035
    assert sb["3W"]["consumption_kwh_per_km"] == 0.080
    assert sb["4W"]["consumption_kwh_per_km"] == 0.160
    assert sb["BUS"]["consumption_kwh_per_km"] == 1.200

    # Verify public charging shares differ per category
    assert sb["2W"]["public_charging_share_pct"] == 15.0
    assert sb["3W"]["public_charging_share_pct"] == 45.0
    assert sb["4W"]["public_charging_share_pct"] == 30.0
    assert sb["BUS"]["public_charging_share_pct"] == 85.0

    # Infrastructure requirements
    infra = demand["infrastructure_requirements"]
    assert infra["recommended_public_charging_points"] > 1000
    assert infra["infrastructure_deficit_points"] > 0
    assert infra["estimated_expansion_capex_crores_inr"] > 0.0


def test_district_specific_forecast():
    """Verify forecasting and demand estimation for a single district (e.g. Pune)."""
    pune_forecast = get_district_forecast(district_name="Pune", horizon_year=2027, scenario="BASE")
    assert pune_forecast["geography"] == "Pune"
    assert pune_forecast["projected_total_ev"] > 150000
    assert pune_forecast["charging_demand"]["total_public_energy_mwh_day"] > 50.0
    assert pune_forecast["infrastructure_requirements"]["infrastructure_deficit_points"] > 0

