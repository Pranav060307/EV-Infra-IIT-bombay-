import os
import sys
import io
import json
import pytest
import pandas as pd

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, init_db
from app.models import ChargingStation, EVRegistration, DatasetImport

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()
    yield

def test_01_health_and_system_metrics():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data

    metrics = client.get("/api/v1/datasets/metrics")
    assert metrics.status_code == 200
    m_data = metrics.json()
    assert "total_datasets" in m_data
    assert "total_records_processed" in m_data

def test_02_upload_valid_csv():
    # Distinct coordinates avoiding existing demo stations
    csv_content = """station_id,name,operator,latitude,longitude,district_code,access_type,total_points
STN-TEST-VAL-01,Test Chinchwad Charging Hub,Tata Power EZ Charge,18.6350,73.7920,MH-PUN,PUBLIC,2
STN-TEST-VAL-02,Test Nigdi AC Point,Statiq,18.6520,73.7680,MH-PUN,PUBLIC,2
"""
    files = {"file": ("valid_stations.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post(
        "/api/v1/datasets/upload",
        files=files,
        data={"dataset_category": "charging_stations", "is_synthetic": "false"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UPLOADED"
    assert data["total_rows"] == 2
    assert "dataset_id" in data
    dataset_id = data["dataset_id"]

    # Validate dataset
    v_res = client.post(f"/api/v1/datasets/{dataset_id}/validate")
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["valid_count"] == 2
    assert v_data["invalid_count"] == 0
    assert v_data["quality_scores"]["overall_score"] >= 80.0

    # Import dataset
    i_res = client.post(f"/api/v1/datasets/{dataset_id}/import")
    assert i_res.status_code == 200
    i_data = i_res.json()
    assert i_data["imported_count"] == 2
    assert i_data["is_synthetic"] is False

    # Verify in DB
    db = SessionLocal()
    stn = db.query(ChargingStation).filter_by(id="STN-TEST-VAL-01").first()
    assert stn is not None
    assert stn.is_synthetic is False
    assert stn.name == "Test Chinchwad Charging Hub"
    db.close()

def test_03_upload_csv_with_missing_columns():
    # Missing required 'latitude' and 'longitude'
    csv_content = """station_id,name,operator,district_code
STN-BAD-001,Station Without Coords,Unknown CPO,MH-PUN
"""
    files = {"file": ("missing_cols.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post(
        "/api/v1/datasets/upload",
        files=files,
        data={"dataset_category": "charging_stations", "is_synthetic": "false"}
    )
    assert response.status_code == 200
    dataset_id = response.json()["dataset_id"]

    v_res = client.post(f"/api/v1/datasets/{dataset_id}/validate")
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["invalid_count"] == 1
    assert v_data["issues_count"] > 0
    assert len(v_data["issues"]) > 0

def test_04_upload_csv_with_invalid_coordinates():
    # Latitude and longitude clearly outside India bounds (lat > 38)
    csv_content = """station_id,name,operator,latitude,longitude,district_code
STN-OUT-001,London Charger,Global CPO,51.5074,-0.1278,MH-PUN
"""
    files = {"file": ("out_of_bounds.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post(
        "/api/v1/datasets/upload",
        files=files,
        data={"dataset_category": "charging_stations", "is_synthetic": "false"}
    )
    dataset_id = response.json()["dataset_id"]

    v_res = client.post(f"/api/v1/datasets/{dataset_id}/validate")
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["warning_count"] >= 1

def test_05_upload_csv_with_duplicate_candidates():
    # Two stations positioned 15 meters apart with identical names
    csv_content = """station_id,name,operator,latitude,longitude,district_code
STN-DUP-A,Dange Chowk Wakad Station A,Tata Power,18.6010,73.7710,MH-PUN
STN-DUP-B,Dange Chowk Wakad Station A,Tata Power EZ Charge,18.6011,73.7711,MH-PUN
"""
    files = {"file": ("duplicates.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post(
        "/api/v1/datasets/upload",
        files=files,
        data={"dataset_category": "charging_stations", "is_synthetic": "false"}
    )
    dataset_id = response.json()["dataset_id"]

    v_res = client.post(f"/api/v1/datasets/{dataset_id}/validate")
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["duplicate_count"] >= 1
    assert v_data["duplicate_candidates"][0]["distance_meters"] < 25.0

def test_06_upload_and_validate_geojson():
    geojson_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [73.8446, 18.5314]},
                "properties": {
                    "station_id": "GEO-PUN-01",
                    "name": "Pune GeoJSON Hub",
                    "operator": "BEE Yatra",
                    "district_code": "MH-PUN"
                }
            }
        ]
    }
    content = json.dumps(geojson_data).encode("utf-8")
    files = {"file": ("stations.geojson", io.BytesIO(content), "application/geo+json")}
    response = client.post(
        "/api/v1/datasets/upload",
        files=files,
        data={"dataset_category": "charging_stations", "is_synthetic": "false"}
    )
    assert response.status_code == 200
    dataset_id = response.json()["dataset_id"]

    v_res = client.post(f"/api/v1/datasets/{dataset_id}/validate")
    assert v_res.status_code == 200
    assert v_res.json()["valid_count"] == 1

def test_07_upload_and_validate_excel():
    df = pd.DataFrame([
        {
            "record_id": "REG-TEST-XLSX-01",
            "district_code": "MH-PUN",
            "year": 2024,
            "month": 5,
            "vehicle_category": "4W",
            "registrations_count": 450
        }
    ])
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)
    buf.seek(0)

    files = {"file": ("registrations.xlsx", buf.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    response = client.post(
        "/api/v1/datasets/upload",
        files=files,
        data={"dataset_category": "ev_registrations", "is_synthetic": "false"}
    )
    assert response.status_code == 200
    dataset_id = response.json()["dataset_id"]

    v_res = client.post(f"/api/v1/datasets/{dataset_id}/validate")
    assert v_res.status_code == 200
    assert v_res.json()["valid_count"] == 1

    i_res = client.post(f"/api/v1/datasets/{dataset_id}/import")
    assert i_res.status_code == 200
    assert i_res.json()["imported_count"] == 1

def test_08_verify_synthetic_vs_real_separation():
    db = SessionLocal()
    # Ensure at least one synthetic record is present for isolation check
    if db.query(ChargingStation).filter_by(is_synthetic=True).count() == 0:
        syn_st = ChargingStation(
            id="SYN-TEST-001",
            name="Demonstration Synthetic Station",
            latitude=18.5204,
            longitude=73.8567,
            is_synthetic=True,
            status="OPERATIONAL",
            access_type="PUBLIC"
        )
        db.add(syn_st)
        db.commit()

    # Synthetic records
    synthetic_count = db.query(ChargingStation).filter_by(is_synthetic=True).count()
    # Real records imported from test_02
    real_count = db.query(ChargingStation).filter_by(is_synthetic=False).count()
    assert synthetic_count > 0
    assert real_count > 0
    db.close()

def test_09_failed_import_does_not_corrupt_existing_data():
    db = SessionLocal()
    initial_stations_count = db.query(ChargingStation).count()
    db.close()

    # Attempt importing a dataset that has not been validated
    dummy_id = "IMP-NONEXISTENT"
    response = client.post(f"/api/v1/datasets/{dummy_id}/import")
    assert response.status_code == 404

    db = SessionLocal()
    post_count = db.query(ChargingStation).count()
    assert post_count == initial_stations_count
    db.close()
