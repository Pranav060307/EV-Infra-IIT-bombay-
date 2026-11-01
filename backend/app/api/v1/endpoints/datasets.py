import os
import shutil
from typing import List, Optional
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import (
    DatasetImport,
    DataQualityReport,
    DatasetSource,
    ChargingStation,
    ChargingPoint,
    ChargingConnector,
    EVRegistration,
    CandidateLocation,
    generate_uuid,
    utc_now,
)
from app.services.validator import DatasetValidator, load_file_to_df, standardize_vehicle_category, standardize_connector_type

router = APIRouter()

STAGING_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "staging"))
os.makedirs(STAGING_DIR, exist_ok=True)

@router.get("/metrics", summary="Aggregated Ingestion & Data Pipeline Metrics")
def get_dataset_metrics(db: Session = Depends(get_db)):
    """
    Returns platform-wide data pipeline summary for the Data Management Overview cards.
    """
    total_datasets = db.query(DatasetImport).count()
    uploaded_count = db.query(DatasetImport).filter(DatasetImport.status == "UPLOADED").count()
    validated_count = db.query(DatasetImport).filter(DatasetImport.status.in_(["VALIDATED", "NEEDS_REVIEW"])).count()
    imported_count = db.query(DatasetImport).filter(DatasetImport.status == "IMPORTED").count()
    rejected_count = db.query(DatasetImport).filter(DatasetImport.status == "FAILED").count()

    total_rows = db.query(func.sum(DatasetImport.total_rows_read)).scalar() or 0
    total_valid = db.query(func.sum(DatasetImport.valid_rows_imported)).scalar() or 0

    return {
        "total_datasets": total_datasets,
        "uploaded_count": uploaded_count,
        "validated_count": validated_count,
        "imported_count": imported_count,
        "rejected_count": rejected_count,
        "total_records_processed": int(total_rows),
        "total_records_imported": int(total_valid)
    }

@router.post("/upload", summary="Upload CSV, XLSX, XLS, or GeoJSON Dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    dataset_category: str = Form("charging_stations"),  # charging_stations, ev_registrations, connectors, candidate_locations
    source_name: Optional[str] = Form("Manual Upload"),
    is_synthetic: bool = Form(False),
    db: Session = Depends(get_db)
):
    """
    Receives user uploaded dataset, verifies file format, saves to secure staging directory,
    generates row preview, and creates a DatasetImport record with status 'UPLOADED'.
    """
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".csv", ".xlsx", ".xls", ".geojson", ".json"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported formats: CSV, XLSX, XLS, GeoJSON."
        )

    # Save to staging folder
    import_id = f"IMP-{generate_uuid()[:8]}"
    staged_filename = f"{import_id}_{filename}"
    staged_path = os.path.join(STAGING_DIR, staged_filename)

    with open(staged_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Inspect preview & column headers
    try:
        df = load_file_to_df(staged_path)
        total_rows = len(df)
        detected_columns = list(df.columns)
        
        preview_rows = []
        for _, row in df.head(10).iterrows():
            item = {}
            for col in detected_columns:
                val = row[col]
                item[col] = None if val is None or (isinstance(val, float) and val != val) else val
            preview_rows.append(item)
    except Exception as e:
        if os.path.exists(staged_path):
            os.remove(staged_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse uploaded dataset: {str(e)}"
        )

    # Record in database
    dataset_record = DatasetImport(
        id=import_id,
        file_name=filename,
        file_format=ext.replace(".", ""),
        dataset_category=dataset_category,
        total_rows_read=total_rows,
        status="UPLOADED",
        is_synthetic=is_synthetic,
        file_path=staged_path,
        preview_data={
            "columns": detected_columns,
            "sample_rows": preview_rows
        }
    )
    db.add(dataset_record)
    db.commit()
    db.refresh(dataset_record)

    return {
        "message": "Dataset uploaded and staged successfully.",
        "dataset_id": dataset_record.id,
        "file_name": filename,
        "format": dataset_record.file_format,
        "total_rows": total_rows,
        "detected_columns": detected_columns,
        "status": dataset_record.status,
        "is_synthetic": is_synthetic,
        "next_step": f"Call POST /api/v1/datasets/{dataset_record.id}/validate to run validation and data quality checks."
    }

@router.get("/list", summary="List All Staged and Imported Datasets")
def list_datasets(db: Session = Depends(get_db)):
    """
    Returns list of all uploaded, validated, and imported datasets with quality summaries.
    """
    records = db.query(DatasetImport).order_by(DatasetImport.created_at.desc()).all()
    results = []
    for r in records:
        qr = r.quality_report
        results.append({
            "id": r.id,
            "file_name": r.file_name,
            "file_format": r.file_format,
            "dataset_category": r.dataset_category,
            "total_rows_read": r.total_rows_read,
            "valid_rows_imported": r.valid_rows_imported,
            "status": r.status,
            "is_synthetic": r.is_synthetic,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "quality_score": qr.overall_confidence_score if qr else None
        })
    return results

@router.get("/{dataset_id}", summary="Get Detailed Dataset Information & Sample Rows")
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    record = db.query(DatasetImport).filter_by(id=dataset_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    qr = record.quality_report
    return {
        "id": record.id,
        "file_name": record.file_name,
        "file_format": record.file_format,
        "dataset_category": record.dataset_category,
        "total_rows_read": record.total_rows_read,
        "valid_rows_imported": record.valid_rows_imported,
        "rejected_rows_count": record.rejected_rows_count,
        "status": record.status,
        "is_synthetic": record.is_synthetic,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "preview_data": record.preview_data,
        "quality_report": {
            "overall_score": qr.overall_confidence_score if qr else None,
            "coordinate_validity": qr.coordinate_validity_score if qr else None,
            "completeness": qr.completeness_score if qr else None,
            "duplicate_rate": qr.duplicate_rate if qr else None,
            "issues_summary": qr.issues_summary if qr else None
        } if qr else None
    }

@router.post("/{dataset_id}/validate", summary="Run Comprehensive Validation & Deduplication")
def validate_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """
    Executes the validation engine:
    - Bounding coordinates check (Lat 6-38, Lon 68-98)
    - Missing required fields
    - Type verification
    - 100m spatial duplicate candidate detection via RapidFuzz + Haversine
    - Generates or updates DataQualityReport
    """
    record = db.query(DatasetImport).filter_by(id=dataset_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if not record.file_path or not os.path.exists(record.file_path):
        raise HTTPException(status_code=400, detail="Staged dataset file not found on disk.")

    # Fetch existing stations for duplicate cross-check
    existing_stations = []
    if record.dataset_category in ["charging_stations", "candidate_locations"]:
        stations = db.query(ChargingStation).all()
        for s in stations:
            existing_stations.append({
                "id": s.id,
                "name": s.name,
                "operator": s.operator,
                "latitude": s.latitude,
                "longitude": s.longitude
            })

    validator = DatasetValidator(duplicate_distance_threshold=100.0)
    result = validator.validate_dataset(
        file_path=record.file_path,
        dataset_category=record.dataset_category,
        existing_stations=existing_stations
    )

    # Update or create DataQualityReport
    qr = record.quality_report
    if not qr:
        qr = DataQualityReport(
            id=f"DQR-{generate_uuid()[:8]}",
            import_id=record.id
        )
        db.add(qr)

    qr.coordinate_validity_score = result["quality_scores"]["coordinate_validity"]
    qr.duplicate_rate = result["quality_scores"]["duplicate_rate"]
    qr.completeness_score = result["quality_scores"]["completeness"]
    qr.overall_confidence_score = result["quality_scores"]["overall_score"]
    qr.issues_summary = {
        "issues": result["issues"],
        "duplicate_candidates": result["duplicate_candidates"]
    }
    qr.generated_at = utc_now()

    record.status = result["status"]
    record.rejected_rows_count = result["invalid_count"]
    record.warning_rows_count = result["warning_count"]
    record.duplicate_candidates_count = result["duplicate_count"]
    record.error_summary = {
        "total_issues": len(result["issues"]),
        "duplicate_candidates_count": result["duplicate_count"],
        "critical_errors": result["invalid_count"]
    }

    db.commit()

    return {
        "dataset_id": record.id,
        "status": record.status,
        "total_rows": result["total_rows"],
        "valid_count": result["valid_count"],
        "invalid_count": result["invalid_count"],
        "warning_count": result["warning_count"],
        "duplicate_count": result["duplicate_count"],
        "quality_scores": result["quality_scores"],
        "issues_count": len(result["issues"]),
        "issues": result["issues"][:20],
        "duplicate_candidates": result["duplicate_candidates"][:10],
        "can_import": record.status in ["VALIDATED", "NEEDS_REVIEW"]
    }

@router.get("/{dataset_id}/report", summary="Download / View Detailed Validation Report")
def get_validation_report(dataset_id: str, db: Session = Depends(get_db)):
    record = db.query(DatasetImport).filter_by(id=dataset_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    qr = record.quality_report
    if not qr:
        raise HTTPException(
            status_code=400,
            detail="Validation has not been run for this dataset yet. Call POST /validate first."
        )

    return {
        "dataset_id": record.id,
        "file_name": record.file_name,
        "dataset_category": record.dataset_category,
        "status": record.status,
        "scores": {
            "overall_confidence": qr.overall_confidence_score,
            "coordinate_validity": qr.coordinate_validity_score,
            "completeness": qr.completeness_score,
            "duplicate_rate": qr.duplicate_rate
        },
        "statistics": {
            "total_rows": record.total_rows_read,
            "rejected_rows": record.rejected_rows_count,
            "warning_rows": record.warning_rows_count,
            "duplicate_candidates": record.duplicate_candidates_count
        },
        "issues_breakdown": qr.issues_summary
    }

@router.post("/{dataset_id}/import", summary="Approve & Ingest Validated Records into Production Database")
def import_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """
    Ingests validated records from staging file into production tables:
    - Sets import_id tracking on each inserted record
    - Sets is_synthetic flag from the import record
    - Marks DatasetImport status as 'IMPORTED'
    """
    record = db.query(DatasetImport).filter_by(id=dataset_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if record.status not in ["VALIDATED", "NEEDS_REVIEW"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot import dataset in '{record.status}' status. Run POST /validate first and ensure it passes."
        )

    df = load_file_to_df(record.file_path)
    imported_count = 0

    try:
        if record.dataset_category == "charging_stations":
            for idx, row in df.iterrows():
                try:
                    lat = float(row.get("latitude"))
                    lon = float(row.get("longitude"))
                    name = str(row.get("name", f"Station {idx+1}")).strip()
                    stn_id = str(row.get("station_id", f"STN-IMP-{record.id}-{idx+1}")).strip()
                    op = str(row.get("operator", "Independent Operator")).strip() if not pd.isna(row.get("operator")) else "Independent Operator"

                    stn = ChargingStation(
                        id=stn_id,
                        name=name,
                        operator=op,
                        address=str(row.get("address", "")) if not pd.isna(row.get("address")) else None,
                        state_code=str(row.get("state_code", "IN-MH")) if not pd.isna(row.get("state_code")) else "IN-MH",
                        district_code=str(row.get("district_code", "MH-PUN")) if not pd.isna(row.get("district_code")) else "MH-PUN",
                        latitude=lat,
                        longitude=lon,
                        access_type=str(row.get("access_type", "PUBLIC")).upper(),
                        total_points=int(row.get("total_points", 2)) if not pd.isna(row.get("total_points")) else 2,
                        status=str(row.get("status", "OPERATIONAL")).upper(),
                        confidence_score=record.quality_report.overall_confidence_score if record.quality_report else 90.0,
                        is_synthetic=record.is_synthetic,
                        import_id=record.id,
                        last_verified_at=utc_now()
                    )
                    db.merge(stn)
                    imported_count += 1
                except Exception as ex:
                    print(f"Error importing station row {idx}: {ex}")
                    continue

        elif record.dataset_category == "ev_registrations":
            for idx, row in df.iterrows():
                try:
                    d_code = str(row.get("district_code", "MH-PUN")).strip()
                    yr = int(row.get("year", 2024))
                    mo = int(row.get("month", 1)) if not pd.isna(row.get("month")) else 1
                    cat = standardize_vehicle_category(row.get("vehicle_category", "4W"))
                    cnt = int(row.get("registrations_count", 0))

                    reg_id = str(row.get("record_id", f"REG-{record.id}-{idx+1}")).strip()
                    ev_reg = EVRegistration(
                        id=reg_id,
                        district_code=d_code,
                        year=yr,
                        month=mo,
                        vehicle_category=cat,
                        registrations_count=max(0, cnt),
                        is_synthetic=record.is_synthetic,
                        import_id=record.id
                    )
                    db.merge(ev_reg)
                    imported_count += 1
                except Exception as ex:
                    print(f"Error importing station row {idx}: {ex}")
                    continue

        record.valid_rows_imported = imported_count
        record.status = "IMPORTED"
        db.commit()

        return {
            "message": f"Successfully imported {imported_count} records into production database.",
            "dataset_id": record.id,
            "status": record.status,
            "imported_count": imported_count,
            "is_synthetic": record.is_synthetic
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database ingestion failed: {str(e)}")

@router.delete("/{dataset_id}", summary="Delete Staged Dataset & Remove Records")
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    record = db.query(DatasetImport).filter_by(id=dataset_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Remove staging file
    if record.file_path and os.path.exists(record.file_path):
        try:
            os.remove(record.file_path)
        except Exception:
            pass

    # Cascading delete in database
    db.delete(record)
    db.commit()

    return {"message": f"Dataset '{dataset_id}' deleted successfully."}
