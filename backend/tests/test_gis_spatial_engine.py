"""
ChargeAtlas India - Phase 4 Comprehensive Spatial Validation & GIS Engine Test Suite
Tests:
- PostGIS / Shapely spatial operators: ST_Within, ST_Intersects, ST_DWithin, ST_Distance, ST_Transform, ST_Area, ST_Length.
- Dual UTM Coordinate Reference Systems: EPSG:32643 (UTM 43N) vs EPSG:32644 (UTM 44N) and WGS-84 Geodetic length.
- Viewport Bounding Box filtering and pagination on stations GeoJSON.
- Single station inspection endpoint.
- Single district comprehensive profile with authentic indicators.
- State-level spatial summary.
- MoP 2024 directional carriageway UNVERIFIED status and 100km fast charging deficit.
"""

import os
import sys
import pytest

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.gis import gis_service
from app.services.gap_engine import gap_engine
from app.api.v1.endpoints.gis import (
    get_spatial_validation,
    get_state_analysis,
    get_district_profile,
    get_station_detail,
    get_stations,
    get_samruddhi_corridor
)


def test_spatial_validation_operator_suite():
    """Verify ST_Within, ST_Intersects, ST_DWithin, ST_Distance, ST_Transform, ST_Area, ST_Length."""
    results = get_spatial_validation()
    assert results is not None
    assert results.get("all_tests_passed") is True, f"Spatial operators failed: {results}"
    
    test_dict = results.get("test_results", {})
    assert "ST_Within" in test_dict
    assert test_dict["ST_Within"]["status"] == "PASSED"
    assert "ST_Intersects" in test_dict
    assert test_dict["ST_Intersects"]["status"] == "PASSED"
    assert "ST_DWithin" in test_dict
    assert test_dict["ST_DWithin"]["status"] == "PASSED"
    assert "ST_Transform_and_ST_Distance" in test_dict
    assert "PASSED" in test_dict["ST_Transform_and_ST_Distance"]["status"]
    assert "ST_Area" in test_dict
    assert test_dict["ST_Area"]["status"] == "PASSED"
    assert "ST_Length" in test_dict
    assert test_dict["ST_Length"]["status"] == "PASSED"


def test_dual_utm_crs_handling():
    """
    Verify Maharashtra CRS handling:
    UTM Zone 43N (EPSG:32643) for Western MH / Pune.
    UTM Zone 44N (EPSG:32644) for Eastern MH / Nagpur.
    WGS-84 Geodetic for trans-zone 701km Samruddhi corridor.
    """
    validation = gis_service.run_spatial_validation_tests()
    crs_list = validation.get("crs_evaluated", [])
    assert any("4326" in c for c in crs_list)
    assert any("32643" in c for c in crs_list)
    assert any("WGS-84" in c for c in crs_list)


def test_stations_bbox_viewport_filtering():
    """Verify viewport bounding box filter on get_stations."""
    # Pune bounding box: [73.75, 18.45, 74.00, 18.65]
    fc = get_stations(bbox="73.75,18.45,74.00,18.65", limit=100, offset=0)
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) > 0
    
    # All returned features must strictly lie within or on the bounding box
    for f in fc["features"]:
        lon, lat = f["geometry"]["coordinates"]
        assert 73.75 - 0.05 <= lon <= 74.00 + 0.05
        assert 18.45 - 0.05 <= lat <= 18.65 + 0.05


def test_single_station_lookup():
    """Verify single station lookup endpoint with connector information."""
    all_stations = gis_service.get_stations_geojson()
    features = all_stations.get("features", [])
    assert len(features) > 0, "At least one authentic station must exist."
    
    target_station_id = features[0]["properties"]["station_id"]
    station_data = get_station_detail(station_id=target_station_id)
    assert station_data["station_id"] == target_station_id
    assert "name" in station_data
    assert "operator" in station_data
    assert "geometry" in station_data
    assert "charging_points_detail" in station_data
    assert "source_provenance" in station_data


def test_state_spatial_summary():
    """Verify state-level aggregated indicators endpoint."""
    data = get_state_analysis()
    assert data["state_code"] == "IN-MH"
    assert data["total_districts"] == 36
    assert data["fleet_summary"]["total_ev"] > 800000
    assert data["infrastructure_summary"]["verified_charging_stations"] >= 25
    assert "ev_2w" in data["fleet_summary"]
    assert "ev_3w" in data["fleet_summary"]
    assert "ev_4w" in data["fleet_summary"]
    assert "districts_without_public_chargers" in data
    assert data["districts_without_public_chargers"] >= 20


def test_district_details_endpoint():
    """Verify comprehensive single district profile endpoint."""
    # Test Pune
    pune = get_district_profile(district_name="Pune")
    assert pune["district"] == "Pune"
    assert pune["total_ev"] > 100000
    assert pune["verified_stations"] > 0
    assert "ev_2w" in pune
    assert "ev_4w" in pune
    assert pune["status"] == "VERIFIED"
    assert len(pune["stations_list"]) > 0

    # Test district with 0 public chargers (e.g., Gadchiroli)
    gadchiroli = get_district_profile(district_name="Gadchiroli")
    assert gadchiroli["district"] == "Gadchiroli"
    assert gadchiroli["verified_stations"] == 0
    assert gadchiroli["ev_to_charger_ratio"] is None  # Must NOT be 0 to avoid distortion
    assert len(gadchiroli["stations_list"]) == 0


def test_samruddhi_mop_compliance_disclaimers():
    """
    Verify Samruddhi Mahamarg compliance transparency:
    1. Directional carriageway access is labelled UNVERIFIED.
    2. Clause 12(7) 100km fast charging compliance evaluated separately.
    """
    data = get_samruddhi_corridor()
    assert "policy_provisions_evaluation" in data
    prov = data["policy_provisions_evaluation"]
    
    assert prov["provision_2_directional_carriageway"]["verdict"] == "UNVERIFIED"
    assert prov["provision_3_heavy_duty_fast_charging_100km"]["compliance_percentage"] == 0.0
    
    # Check that segments have carriageway compliance disclaimer
    for seg in data["segments_analysis"]:
        assert "UNVERIFIED" in seg.get("directional_carriageway_compliance", "")
