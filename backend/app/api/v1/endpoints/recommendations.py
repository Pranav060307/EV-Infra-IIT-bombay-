"""
ChargeAtlas India - Intelligent Site Recommendation & Optimization API Endpoints (Phase 5)
Routes:
- GET  /api/v1/recommendations/candidates        : List candidates with MCDA scores & filters
- POST /api/v1/recommendations/mcda             : Dynamic MCDA scoring with custom weights
- GET  /api/v1/recommendations/candidates/{id}  : Deep inspection of a single candidate site
- POST /api/v1/recommendations/optimize         : Solve Maximum Covering Location Problem (MCLP)
- GET  /api/v1/recommendations/substations      : Electrical distribution substations for map
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Query, Path, HTTPException, Body
from app.services.recommender import recommender_engine

router = APIRouter()


class MCDAWeightsRequest(BaseModel):
    ev_demand_potential: float = Field(0.25, ge=0.0, le=1.0)
    distance_from_chargers: float = Field(0.20, ge=0.0, le=1.0)
    infrastructure_gap_severity: float = Field(0.15, ge=0.0, le=1.0)
    road_accessibility: float = Field(0.15, ge=0.0, le=1.0)
    electrical_proximity: float = Field(0.15, ge=0.0, le=1.0)
    land_suitability: float = Field(0.10, ge=0.0, le=1.0)
    scope: Optional[str] = Field("ALL", description="ALL, PUNE, SAMRUDDHI, or DISTRICTS")
    category: Optional[str] = None


class MCLPOptimizationRequest(BaseModel):
    p_stations: int = Field(5, ge=1, le=25, description="Number of candidate stations to select")
    service_radius_km: float = Field(3.0, ge=0.5, le=50.0, description="Coverage service radius in km")
    scope: Optional[str] = Field("PUNE", description="PUNE, SAMRUDDHI, or ALL")


@router.get("/candidates", summary="Query Recommended Candidate Sites with MCDA Scores")
def get_candidates(
    scope: Optional[str] = Query("ALL", description="Filter scope: ALL, PUNE, SAMRUDDHI, or DISTRICTS"),
    category: Optional[str] = Query(None, description="Filter category: BUS_DEPOT, HIGHWAY_AMENITY, PETROL_PUMP, etc.")
):
    """Returns candidate charging locations scored and ranked via the 6-criteria MCDA engine."""
    sc = getattr(scope, "default", scope) or "ALL"
    cat = getattr(category, "default", category)
    if cat is not None and not isinstance(cat, str):
        cat = None
    return recommender_engine.score_candidates(scope=sc, category=cat)


@router.post("/mcda", summary="Dynamically Re-score Candidates with Custom MCDA Weights")
def rescore_mcda(req: MCDAWeightsRequest = Body(...)):
    """Accepts custom criteria weights, normalizes them, and returns re-ranked candidates."""
    weights = {
        "ev_demand_potential": req.ev_demand_potential,
        "distance_from_chargers": req.distance_from_chargers,
        "infrastructure_gap_severity": req.infrastructure_gap_severity,
        "road_accessibility": req.road_accessibility,
        "electrical_proximity": req.electrical_proximity,
        "land_suitability": req.land_suitability
    }
    return recommender_engine.score_candidates(
        weights=weights,
        scope=req.scope,
        category=req.category
    )


@router.get("/candidates/{candidate_id}", summary="Deep Inspection for a Single Candidate Site")
def get_candidate_details(
    candidate_id: str = Path(..., description="Unique Candidate ID (e.g. CAND-PUN-001, CAND-SAM-001)")
):
    """Returns granular criterion scores, nearby infrastructure, justification, and limitations."""
    cand = recommender_engine.get_candidate_by_id(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate_id}' not found.")
    return cand


@router.post("/optimize", summary="Solve Maximum Covering Location Problem (MCLP)")
def optimize_siting(req: MCLPOptimizationRequest = Body(...)):
    """
    Executes facility location optimization to select top 'p' stations that
    maximize covered EV demand under a specified service radius constraint.
    """
    return recommender_engine.solve_mclp_optimization(
        p_stations=req.p_stations,
        service_radius_km=req.service_radius_km,
        scope=req.scope
    )


@router.get("/substations", summary="List Distribution Substations for Infrastructure Mapping")
def list_substations():
    """Returns 13 mapped 33kV/22kV/11kV substations across Pune and Samruddhi corridor."""
    return [
        {"id": "SUB-PUN-01", "name": "Shivajinagar 33kV GIS Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 18.532, "longitude": 73.845, "district": "Pune"},
        {"id": "SUB-PUN-02", "name": "Hinjawadi Phase 1 22kV Feeder", "operator": "MSEDCL", "voltage_kv": 22.0, "latitude": 18.591, "longitude": 73.738, "district": "Pune"},
        {"id": "SUB-PUN-03", "name": "Kothrud 11kV Distribution Substation", "operator": "MSEDCL", "voltage_kv": 11.0, "latitude": 18.508, "longitude": 73.807, "district": "Pune"},
        {"id": "SUB-PUN-04", "name": "Viman Nagar 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 18.567, "longitude": 73.914, "district": "Pune"},
        {"id": "SUB-PUN-05", "name": "Hadapsar Magarpatta 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 18.513, "longitude": 73.928, "district": "Pune"},
        {"id": "SUB-SAM-01", "name": "Igatpuri Interchange 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 19.697, "longitude": 73.564, "district": "Nashik"},
        {"id": "SUB-SAM-02", "name": "Sinnar Industrial 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 19.845, "longitude": 73.998, "district": "Nashik"},
        {"id": "SUB-SAM-03", "name": "Kopargaon Bypass 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 19.889, "longitude": 74.475, "district": "Ahmednagar"},
        {"id": "SUB-SAM-04", "name": "Aurangabad West Expressway 33kV", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 19.876, "longitude": 75.343, "district": "Chhatrapati Sambhajinagar"},
        {"id": "SUB-SAM-05", "name": "Jalna MIDC 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 19.841, "longitude": 75.882, "district": "Jalna"},
        {"id": "SUB-SAM-06", "name": "Karanja Lad Toll 22kV Substation", "operator": "MSEDCL", "voltage_kv": 22.0, "latitude": 20.484, "longitude": 77.491, "district": "Washim"},
        {"id": "SUB-SAM-07", "name": "Wardha Outer 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 20.745, "longitude": 78.602, "district": "Wardha"},
        {"id": "SUB-SAM-08", "name": "Nagpur MIHAN Terminal 33kV Substation", "operator": "MSEDCL", "voltage_kv": 33.0, "latitude": 21.055, "longitude": 79.052, "district": "Nagpur"}
    ]
