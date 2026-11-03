"""
ChargeAtlas India - GIS & Spatial Analysis API Endpoints
Phase 4: Advanced Geospatial Intelligence, Dual UTM CRS & Multi-Criteria Gap Indices

Provides reliable REST endpoints for:
- State & District Boundaries and Geometries
- State & District Spatial Analytics with CGI Components
- Station GeoJSON with Viewport Bounding Box & Attribute Filtering
- Individual Station Facilities, EVSE Kiosks & Connector Guns
- Pune Urban 1km² Grid & Planning Benchmark Metrics
- Samruddhi Mahamarg 701km Geodetic Corridor & Directional Highway Evaluation
- MoP September 2024 Policy Benchmark Evaluation
- Spatial Operator Validation Test Suite (ST_Within, ST_Intersects, ST_DWithin, ST_Distance, ST_Transform, ST_Area, ST_Length)
"""

from fastapi import APIRouter, HTTPException, Query, Path
from typing import Optional, List, Dict, Any
from app.services.gis import gis_service
from app.services.gap_engine import gap_engine
from app.services.policy_engine import policy_engine

router = APIRouter()

# ------------------------------------------------------------------------------
# 1. ENGINE HEALTH & DIAGNOSTICS
# ------------------------------------------------------------------------------

@router.get("/health", summary="GIS Engine Diagnostic Status")
def get_gis_health():
    """Returns spatial engine status, available CRS transformations, and layer counts."""
    boundaries = gis_service.get_boundaries_list()
    return {
        "status": "HEALTHY",
        "engine": "GeoPandas 1.2.0 + Shapely 2.0 + PyProj 3.7",
        "crs_storage": "EPSG:4326 (WGS 84 Ellipsoid)",
        "crs_projected_western": "EPSG:32643 (UTM Zone 43N - Pune & Western Maharashtra)",
        "crs_projected_eastern": "EPSG:32644 (UTM Zone 44N - Vidarbha / Eastern Maharashtra)",
        "geodesy_engine": "WGS-84 Ellipsoidal Geodesy for Trans-Zone Corridors (Samruddhi)",
        "available_boundaries": boundaries,
        "verified_stations_count": len(gis_service._stations_gdf) if gis_service._stations_gdf is not None else 0,
        "is_synthetic": False,
        "data_mode": "authentic",
        "data_classification": "VERIFIED AUTHENTIC & PARTIALLY VERIFIED",
        "data_provenance": "Survey of India, MoRTH VAHAN 4, BEE EV Yatra, MSRDC, Census 2011"
    }

@router.get("/spatial-validation", summary="Execute Formal Spatial Operator Test Suite")
def get_spatial_validation():
    """
    Executes and reports formal tests for PostGIS / Python spatial operations:
    ST_Within, ST_Intersects, ST_DWithin, ST_Distance, ST_Transform, ST_Area, ST_Length.
    Uses known geographic ground truth points in Maharashtra.
    """
    return gis_service.run_spatial_validation_tests()

# ------------------------------------------------------------------------------
# 2. BOUNDARIES
# ------------------------------------------------------------------------------

@router.get("/boundaries", summary="List Available Geographic Boundaries")
def list_boundaries():
    """Lists all registered official administrative and corridor boundaries."""
    return gis_service.get_boundaries_list()

@router.get("/boundaries/{name}", summary="Get Boundary GeoJSON")
def get_boundary_geojson(name: str = Path(..., description="Boundary ID (e.g. maharashtra_districts, pune_urban, samruddhi_corridor)")):
    """Retrieves official GeoJSON boundary feature collection by name."""
    geojson_data = gis_service.get_boundary_geojson(name)
    if not geojson_data:
        raise HTTPException(
            status_code=404,
            detail=f"Boundary '{name}' not found. Available: maharashtra_districts, pune_urban, samruddhi_corridor"
        )
    return geojson_data

# ------------------------------------------------------------------------------
# 3. STATE & DISTRICT ANALYSIS
# ------------------------------------------------------------------------------

@router.get("/state-analysis", summary="State-level Aggregated Geographic & Fleet Indicators")
def get_state_analysis():
    """
    Returns state-wide aggregated EV adoption, public charging infrastructure,
    density indicators, and unserved district counts across Maharashtra.
    """
    return gis_service.get_state_spatial_summary()

@router.get("/district-analysis", summary="District-level Spatial & CGI Analysis")
def get_district_analysis(
    sort_by: Optional[str] = Query("cgi_score", description="Sort by: 'cgi_score' (default), 'total_ev', or 'verified_charging_points'")
):
    """
    Performs spatial point-in-polygon join and computes
    the multi-criteria Charging Gap Index (CGI) across all 36 Maharashtra districts.
    Exposes every component score (EV ratio gap, spatial gap, per-capita gap, policy gap).
    """
    raw_summary = gis_service.get_district_spatial_summary()
    if not raw_summary:
        raise HTTPException(status_code=404, detail="District spatial datasets not loaded.")

    analyzed_districts = gap_engine.compute_district_cgi(raw_summary)

    # Sort
    sort_key = getattr(sort_by, "default", sort_by) or "cgi_score"
    if sort_key in ["total_ev", "verified_charging_points", "cgi_score"]:
        analyzed_districts.sort(key=lambda x: x.get(sort_key, 0) or 0, reverse=True)

    # Calculate state rollups
    total_ev = sum(d.get("total_ev", 0) for d in analyzed_districts)
    total_chargers = sum(d.get("verified_charging_points", 0) for d in analyzed_districts)
    avg_cgi = round(sum(d.get("cgi_score", 0) for d in analyzed_districts) / len(analyzed_districts), 1)

    return {
        "region": "Maharashtra",
        "total_districts": len(analyzed_districts),
        "total_ev_registered": total_ev,
        "total_verified_charging_points": total_chargers,
        "state_ev_to_charger_ratio": round(total_ev / max(1, total_chargers), 1),
        "average_charging_gap_index": avg_cgi,
        "cgi_methodology": "Transparent Multi-Criteria Weighted Formula: EV/charger (35%), spatial density (25%), per-capita (20%), MoP policy deficit (20%)",
        "districts": analyzed_districts
    }

@router.get("/districts/{district_name}", summary="Deep-dive Single District Profile")
def get_district_profile(district_name: str = Path(..., description="Name or code of the district (e.g. Pune, Mumbai Suburban, Dharashiv)")):
    """Returns granular demographic, fleet segment, station list, and CGI metrics for a specific district."""
    details = gis_service.get_district_details(district_name)
    if not details:
        raise HTTPException(
            status_code=404,
            detail=f"District '{district_name}' not found in official 36 Maharashtra districts."
        )
    return details

# ------------------------------------------------------------------------------
# 4. CHARGING STATIONS & BOUNDING BOX
# ------------------------------------------------------------------------------

@router.get("/stations", summary="Query Verified Charging Stations with Bounding Box & Pagination")
def get_stations(
    district: Optional[str] = Query(None, description="Filter by district name"),
    operator: Optional[str] = Query(None, description="Filter by CPO / operator"),
    min_power: Optional[float] = Query(None, description="Minimum power in kW"),
    bbox: Optional[str] = Query(None, description="Bounding box as 'minLon,minLat,maxLon,maxLat' (e.g. 73.7,18.4,74.1,18.7)"),
    limit: int = Query(100, ge=1, le=500, description="Page limit (default 100)"),
    offset: int = Query(0, ge=0, description="Offset for pagination (default 0)")
):
    """
    Returns verified public charging station locations as GeoJSON.
    Supports attribute filtering, viewport bounding-box clipping, and pagination.
    """
    dist_val = getattr(district, "default", district)
    op_val = getattr(operator, "default", operator)
    pwr_val = getattr(min_power, "default", min_power)
    
    bbox_coords = None
    bbox_str = getattr(bbox, "default", bbox)
    if bbox_str and isinstance(bbox_str, str):
        try:
            parts = [float(x.strip()) for x in bbox_str.split(",")]
            if len(parts) == 4:
                bbox_coords = parts
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid bbox format. Expected 'minLon,minLat,maxLon,maxLat'.")

    return gis_service.get_stations_geojson(
        district=dist_val,
        operator=op_val,
        min_power=pwr_val,
        bbox=bbox_coords,
        limit=limit,
        offset=offset
    )

@router.get("/stations/{station_id}", summary="Single Station Facility & Connector Specs")
def get_station_detail(station_id: str = Path(..., description="Unique Station ID (e.g. BEE-MH-PUN-001)")):
    """Returns facility address, operator, coordinates, individual EVSE kiosks, and connector types."""
    station = gis_service.get_station_by_id(station_id)
    if not station:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found in verified public directory.")
    return station

# ------------------------------------------------------------------------------
# 5. PUNE URBAN GRID & SAMRUDDHI HIGHWAY CORRIDOR
# ------------------------------------------------------------------------------

@router.get("/pune/grid", summary="Pune Urban 1km x 1km Grid Analysis")
def get_pune_urban_grid(
    grid_size_meters: float = Query(1000.0, description="Grid cell size in meters (default 1000m)")
):
    """
    Generates a 1km x 1km metric grid across the Pune Municipal Corporation (PMC)
    and PCMC urban agglomeration (516.18 km²) in UTM Zone 43N (EPSG:32643).
    Evaluates MoP September 2024 urban planning benchmark (Clause 11(1)(a)).
    """
    grid_val = float(getattr(grid_size_meters, "default", grid_size_meters) or 1000.0)
    raw_grid = gis_service.generate_pune_urban_grid(grid_size_meters=grid_val)
    grid_with_cgi = gap_engine.compute_grid_cgi(raw_grid)
    compliance_report = policy_engine.evaluate_urban_compliance(grid_with_cgi)

    return {
        "urban_region": "Pune Urban Agglomeration (PMC + PCMC)",
        "area_sq_km": 516.18,
        "grid_resolution_meters": grid_val,
        "total_grid_cells": len(grid_with_cgi.get("features", [])),
        "mop_policy_evaluation": compliance_report,
        "summary": raw_grid.get("summary", {}),
        "grid_geojson": grid_with_cgi
    }

@router.get("/samruddhi/corridor", summary="Samruddhi Mahamarg 701km Corridor Analysis")
def get_samruddhi_corridor(
    buffer_km: float = Query(20.0, description="Corridor buffer distance in km")
):
    """
    Analyzes the 701 km Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg
    using WGS-84 ellipsoidal geodesy across UTM Zone 43N and Zone 44N.
    Separately evaluates:
    1. 20km highway spacing (Clause 11(1)(b))
    2. Directional carriageway compliance (labelled UNVERIFIED when access is unrecorded)
    3. Heavy-duty fast-charging every 100 km (Clause 12(7): >=2x 240 kW CCS-2)
    """
    buf_val = float(getattr(buffer_km, "default", buffer_km) or 20.0)
    analysis = gis_service.analyze_samruddhi_corridor(buffer_km=buf_val)
    compliance = policy_engine.evaluate_corridor_compliance(analysis)
    analysis["policy_compliance_evaluation"] = compliance
    return analysis

@router.get("/policy-compliance", summary="Consolidated MoP September 2024 Policy Evaluation")
def get_policy_compliance_report():
    """
    Returns consolidated compliance audit against Ministry of Power (MoP)
    Guidelines dated 17 September 2024 across both urban micro-grid and highway corridors.
    """
    pune_grid = gis_service.generate_pune_urban_grid(1000.0)
    sam_corridor = gis_service.analyze_samruddhi_corridor(20.0)

    urban_eval = policy_engine.evaluate_urban_compliance(pune_grid)
    expressway_eval = policy_engine.evaluate_corridor_compliance(sam_corridor)

    return {
        "policy_framework": "Ministry of Power Guidelines dated 17 September 2024 (Ref No. 12/2/2018-EV)",
        "evaluation_timestamp": "2026-11-02T16:00:00Z",
        "urban_evaluation": urban_eval,
        "expressway_evaluation": expressway_eval,
        "statutory_note": "Evaluations strictly reflect verified public datasets. Proximity does not assume dual carriageway access."
    }
