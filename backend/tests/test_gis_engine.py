"""
ChargeAtlas India - Automated GIS Engine & CGI Test Suite
Validates Phase 3 GIS spatial services, UTM CRS transformations,
point-in-polygon joins, 1km² urban grid, corridor buffering,
CGI multi-criteria calculations, and MoP 2024 policy benchmarks.
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from app.services.gis import gis_service
from app.services.gap_engine import gap_engine
from app.services.policy_engine import policy_engine

client = TestClient(app)

def test_gis_boundaries_availability():
    """Verify that all authentic boundaries are loaded and valid."""
    boundaries = gis_service.get_boundaries_list()
    b_ids = [b["id"] for b in boundaries]
    
    assert "maharashtra_districts" in b_ids, "Maharashtra districts boundary must be registered."
    assert "pune_urban" in b_ids, "Pune Urban agglomeration boundary must be registered."
    assert "samruddhi_corridor" in b_ids, "Samruddhi Mahamarg corridor boundary must be registered."

def test_boundary_geojson_retrieval():
    """Verify GeoJSON structure and geometry validity for registered boundaries."""
    mh_geojson = gis_service.get_boundary_geojson("maharashtra_districts")
    assert mh_geojson is not None
    assert mh_geojson["type"] == "FeatureCollection"
    assert len(mh_geojson["features"]) >= 35

    pune_geojson = gis_service.get_boundary_geojson("pune_urban")
    assert pune_geojson is not None
    assert pune_geojson["features"][0]["geometry"]["type"] == "Polygon"

    sam_geojson = gis_service.get_boundary_geojson("samruddhi_corridor")
    assert sam_geojson is not None
    assert sam_geojson["features"][0]["geometry"]["type"] == "LineString"

def test_stations_spatial_filtering():
    """Verify charging station spatial queries and attribute filters."""
    # Filter by operator
    tata_stations = gis_service.get_stations_geojson(operator="Tata Power")
    assert tata_stations["type"] == "FeatureCollection"
    assert len(tata_stations["features"]) > 0
    for f in tata_stations["features"]:
        assert f["properties"]["operator"] == "Tata Power"

    # Filter by minimum power
    fast_stations = gis_service.get_stations_geojson(min_power=100.0)
    for f in fast_stations["features"]:
        assert f["properties"]["total_power_kw"] >= 100.0

def test_district_spatial_summary():
    """Test point-in-polygon join between stations and districts."""
    summary = gis_service.get_district_spatial_summary()
    assert len(summary) >= 35
    
    pune_record = next((d for d in summary if d["district"] == "Pune"), None)
    assert pune_record is not None, "Pune district must exist in spatial summary."
    assert pune_record["total_ev"] > 100000, "Pune cumulative EV registrations should reflect VAHAN data."
    assert pune_record["verified_charging_points"] > 0, "Pune must have verified charging points."
    assert pune_record["status"] == "VERIFIED"

def test_charging_gap_index_computation():
    """Test Charging Gap Index formula, bounds, and categorization."""
    summary = gis_service.get_district_spatial_summary()
    cgi_results = gap_engine.compute_district_cgi(summary)
    
    assert len(cgi_results) == len(summary)
    for res in cgi_results:
        assert 0.0 <= res["cgi_score"] <= 100.0, f"CGI score {res['cgi_score']} must be in range [0, 100]"
        assert "cgi_category" in res
        assert "confidence_status" in res

    # Pune with high EVs and limited chargers should have high CGI
    pune_res = next(r for r in cgi_results if r["district"] == "Pune")
    assert pune_res["cgi_score"] >= 70.0, "Pune should show significant infrastructure gap given EV volume."

def test_pune_1km_urban_grid():
    """Test Pune 1km x 1km metric grid generation and MoP benchmark assignment."""
    grid = gis_service.generate_pune_urban_grid(grid_size_meters=1000.0)
    features = grid.get("features", [])
    
    assert len(features) > 100, f"Expected >100 grid cells for 516 km² Pune urban area, got {len(features)}"
    
    # Check attributes of grid cells
    for f in features[:10]:
        props = f["properties"]
        assert "cell_id" in props
        assert "station_count" in props
        assert "mop_policy_status" in props

def test_samruddhi_corridor_analysis():
    """Test 701km expressway buffering and 20km segment spacing calculations."""
    corridor = gis_service.analyze_samruddhi_corridor(buffer_km=20.0)
    
    assert corridor["total_length_km"] > 600.0, "Corridor length should approximate 701 km."
    assert corridor["total_stations_in_buffer"] >= 5, "At least 5 verified wayside stations along expressway."
    assert len(corridor["segments_analysis"]) > 25, "Expected ~35 segments of 20km along corridor."
    
    # Verify segments have required compliance keys
    for seg in corridor["segments_analysis"]:
        assert "chainage_range" in seg
        assert "mop_compliance" in seg
        assert seg["mop_compliance"] in ["COMPLIANT", "GAP IDENTIFIED (>20KM DEFICIT)"]

def test_policy_benchmark_engine():
    """Test MoP 2024 compliance evaluation engine."""
    grid = gis_service.generate_pune_urban_grid(1000.0)
    urban_eval = policy_engine.evaluate_urban_compliance(grid)
    
    assert "total_urban_grid_cells_evaluated" in urban_eval
    assert "strict_compliance_pct" in urban_eval
    assert 0.0 <= urban_eval["strict_compliance_pct"] <= 100.0

    sam = gis_service.analyze_samruddhi_corridor(20.0)
    corridor_eval = policy_engine.evaluate_corridor_compliance(sam)
    
    assert "highway_spacing_compliance_pct" in corridor_eval
    assert 0.0 <= corridor_eval["highway_spacing_compliance_pct"] <= 100.0

def test_api_endpoints_integration():
    """Test full endpoint handlers for all Phase 3 GIS endpoints."""
    from app.api.v1.endpoints.gis import (
        get_gis_health, list_boundaries, get_boundary_geojson,
        get_stations, get_district_analysis, get_pune_urban_grid,
        get_samruddhi_corridor, get_policy_compliance_report
    )
    # 1. Health
    res = get_gis_health()
    assert res["status"] == "HEALTHY"

    # 2. Boundaries list
    res = list_boundaries()
    assert len(res) >= 3

    # 3. Specific boundary GeoJSON
    res = get_boundary_geojson("pune_urban")
    assert res["type"] == "FeatureCollection"

    # 4. Stations GeoJSON
    res = get_stations()
    assert res["type"] == "FeatureCollection"

    # 5. District Analysis
    res = get_district_analysis()
    assert res["total_districts"] >= 35

    # 6. Pune Grid
    res = get_pune_urban_grid()
    assert "grid_geojson" in res

    # 7. Samruddhi Corridor
    res = get_samruddhi_corridor()
    assert "segments_analysis" in res

    # 8. Policy Compliance Report
    res = get_policy_compliance_report()
    assert "urban_evaluation" in res
    assert "expressway_evaluation" in res
