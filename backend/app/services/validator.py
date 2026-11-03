"""
ChargeAtlas India — Data Validation, Cleaning & Deduplication Engine
Validates CSV, XLSX, XLS, and GeoJSON datasets for EV registrations,
charging stations, connectors, and candidate locations.
"""

import json
import math
import os
import re
from typing import Dict, Any, List, Tuple
import pandas as pd
from rapidfuzz import fuzz

# Bounding box for India
INDIA_LAT_MIN, INDIA_LAT_MAX = 6.0, 38.0
INDIA_LON_MIN, INDIA_LON_MAX = 68.0, 98.0

# 100-meter duplicate threshold (configurable)
DEFAULT_DUPLICATE_DISTANCE_METERS = 100.0
DEFAULT_NAME_SIMILARITY_THRESHOLD = 65.0

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS points in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def normalize_column_name(col: str) -> str:
    """Normalizes column strings to lower snake_case and strips whitespace."""
    col = str(col).strip().lower()
    col = re.sub(r"[^\w\s]", "", col)
    col = re.sub(r"\s+", "_", col)
    return col

# Mapping of common aliases to standardized ChargeAtlas schema names
COLUMN_ALIASES = {
    "lat": "latitude",
    "y": "latitude",
    "lng": "longitude",
    "lon": "longitude",
    "x": "longitude",
    "station": "name",
    "station_name": "name",
    "cpo": "operator",
    "charge_point_operator": "operator",
    "network": "operator",
    "state": "state_code",
    "district": "district_code",
    "pts": "total_points",
    "chargers": "total_points",
    "power": "power_kw",
    "kw": "power_kw",
    "count": "registrations_count",
    "ev_count": "registrations_count",
    "category": "vehicle_category",
    "segment": "vehicle_category",
    "vehicle_type": "vehicle_category",
}

def standardize_vehicle_category(cat: Any) -> str:
    val = str(cat).strip().upper()
    if any(k in val for k in ["2W", "TWO", "SCOOTER", "MOTORCYCLE", "BIKE"]):
        return "2W"
    if any(k in val for k in ["3W", "THREE", "RICKSHAW", "AUTO"]):
        return "3W"
    if any(k in val for k in ["4W", "FOUR", "CAR", "LMV", "TAXI"]):
        return "4W"
    if any(k in val for k in ["BUS", "HEAVY", "OMNIBUS"]):
        return "BUS"
    return "4W"

def standardize_connector_type(conn: Any) -> str:
    val = str(conn).strip().upper()
    if "CCS" in val:
        return "CCS_2"
    if "TYPE" in val or "TYPE2" in val or "IEC" in val:
        return "TYPE_2_AC"
    if "BHARAT" in val and "DC" in val:
        return "BHARAT_DC_001"
    if "BHARAT" in val or "AC001" in val:
        return "BHARAT_AC_001"
    if "CHADEMO" in val:
        return "CHADEMO"
    return "CCS_2"

def load_file_to_df(file_path: str) -> pd.DataFrame:
    """Parses CSV, XLSX, XLS, or GeoJSON into a pandas DataFrame."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".csv":
        df = pd.read_csv(file_path, encoding="utf-8-sig")
    elif ext in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)
    elif ext in [".geojson", ".json"]:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "features" in data:
            records = []
            for feat in data["features"]:
                props = feat.get("properties", {})
                geom = feat.get("geometry", {})
                if geom and geom.get("type") == "Point" and "coordinates" in geom:
                    props["longitude"] = geom["coordinates"][0]
                    props["latitude"] = geom["coordinates"][1]
                records.append(props)
            df = pd.DataFrame(records)
        else:
            df = pd.DataFrame(data)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

    # Standardize column headers
    renamed = {}
    for col in df.columns:
        norm = normalize_column_name(col)
        renamed[col] = COLUMN_ALIASES.get(norm, norm)
    df.rename(columns=renamed, inplace=True)
    return df

class DatasetValidator:
    """Comprehensive validation, data-quality scoring and duplicate candidate detection."""

    def __init__(self, duplicate_distance_threshold=DEFAULT_DUPLICATE_DISTANCE_METERS):
        self.dup_distance_thresh = duplicate_distance_threshold

    def validate_dataset(
        self,
        file_path: str,
        dataset_category: str,
        existing_stations: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        df = load_file_to_df(file_path)
        total_rows = len(df)

        if total_rows == 0:
            return {
                "status": "FAILED",
                "total_rows": 0,
                "valid_count": 0,
                "invalid_count": 0,
                "warning_count": 0,
                "duplicate_count": 0,
                "quality_scores": {
                    "coordinate_validity": 0.0,
                    "completeness": 0.0,
                    "duplicate_rate": 0.0,
                    "overall_score": 0.0,
                },
                "issues": [{"row": 0, "type": "ERROR", "message": "File contains zero data rows."}],
                "sample_preview": []
            }

        issues: List[Dict[str, Any]] = []
        valid_count = 0
        invalid_count = 0
        warning_count = 0
        duplicate_candidates: List[Dict[str, Any]] = []

        valid_coord_rows = 0
        complete_rows = 0

        # Category-specific validation
        if dataset_category == "charging_stations":
            required_fields = ["name", "latitude", "longitude"]
        elif dataset_category == "ev_registrations":
            required_fields = ["district_code", "year", "vehicle_category", "registrations_count"]
        elif dataset_category == "connectors":
            required_fields = ["connector_type", "power_kw"]
        else:  # candidate_locations
            required_fields = ["name", "latitude", "longitude", "category"]

        # 1. Row-by-Row Checks
        for idx, row in df.iterrows():
            row_num = idx + 1
            has_error = False
            has_warning = False

            # Check required fields
            missing_cols = [col for col in required_fields if col not in df.columns or pd.isna(row.get(col))]
            if missing_cols:
                issues.append({
                    "row": row_num,
                    "type": "ERROR",
                    "field": ", ".join(missing_cols),
                    "message": f"Missing mandatory field(s): {', '.join(missing_cols)}"
                })
                has_error = True
            else:
                complete_rows += 1

            # Coordinate Checks (if spatial)
            if "latitude" in df.columns and "longitude" in df.columns:
                lat_val = row.get("latitude")
                lon_val = row.get("longitude")
                try:
                    lat = float(lat_val)
                    lon = float(lon_val)
                    if math.isnan(lat) or math.isnan(lon):
                        raise ValueError("NaN coordinates")
                    if not (INDIA_LAT_MIN <= lat <= INDIA_LAT_MAX and INDIA_LON_MIN <= lon <= INDIA_LON_MAX):
                        issues.append({
                            "row": row_num,
                            "type": "WARNING",
                            "field": "coordinates",
                            "message": f"Coordinates ({lat:.4f}, {lon:.4f}) outside standard India bounding box (Lat 6-38°, Lon 68-98°)."
                        })
                        has_warning = True
                    else:
                        valid_coord_rows += 1
                except (ValueError, TypeError):
                    issues.append({
                        "row": row_num,
                        "type": "ERROR",
                        "field": "coordinates",
                        "message": f"Invalid non-numeric coordinate values: lat='{lat_val}', lon='{lon_val}'"
                    })
                    has_error = True

            # Numeric Checks for counts
            if "registrations_count" in df.columns and not pd.isna(row.get("registrations_count")):
                try:
                    c = int(row.get("registrations_count"))
                    if c < 0:
                        issues.append({
                            "row": row_num,
                            "type": "ERROR",
                            "field": "registrations_count",
                            "message": "Registrations count cannot be negative."
                        })
                        has_error = True
                except (ValueError, TypeError):
                    issues.append({
                        "row": row_num,
                        "type": "ERROR",
                        "field": "registrations_count",
                        "message": "Registrations count must be an integer."
                    })
                    has_error = True

            if has_error:
                invalid_count += 1
            elif has_warning:
                warning_count += 1
                valid_count += 1
            else:
                valid_count += 1

        # 2. Duplicate Detection (Intra-file + against existing stations)
        if dataset_category in ["charging_stations", "candidate_locations"] and "latitude" in df.columns and "longitude" in df.columns:
            # Intra-file pairwise check
            coords_list = []
            for idx, row in df.iterrows():
                try:
                    lat = float(row.get("latitude"))
                    lon = float(row.get("longitude"))
                    name = str(row.get("name", ""))
                    op = str(row.get("operator", ""))
                    coords_list.append((idx + 1, lat, lon, name, op))
                except (ValueError, TypeError):
                    continue

            for i in range(len(coords_list)):
                for j in range(i + 1, len(coords_list)):
                    r1, lat1, lon1, name1, op1 = coords_list[i]
                    r2, lat2, lon2, name2, op2 = coords_list[j]
                    dist = haversine_distance_meters(lat1, lon1, lat2, lon2)
                    if dist <= self.dup_distance_thresh:
                        sim = fuzz.token_sort_ratio(name1.lower(), name2.lower())
                        if sim >= DEFAULT_NAME_SIMILARITY_THRESHOLD or dist < 20.0:
                            duplicate_candidates.append({
                                "type": "INTRA_DATASET_DUPLICATE",
                                "row_a": r1,
                                "row_b": r2,
                                "name_a": name1,
                                "name_b": name2,
                                "distance_meters": round(dist, 1),
                                "name_similarity_pct": round(sim, 1),
                                "recommendation": "Flagged for planner review (not automatically merged)"
                            })

            # Check against existing DB stations if provided
            if existing_stations:
                for r_idx, lat, lon, name, op in coords_list:
                    for ex in existing_stations:
                        dist = haversine_distance_meters(lat, lon, ex["latitude"], ex["longitude"])
                        if dist <= self.dup_distance_thresh:
                            sim = fuzz.token_sort_ratio(name.lower(), ex["name"].lower())
                            if sim >= DEFAULT_NAME_SIMILARITY_THRESHOLD or dist < 20.0:
                                duplicate_candidates.append({
                                    "type": "EXISTING_DATABASE_DUPLICATE",
                                    "uploaded_row": r_idx,
                                    "uploaded_name": name,
                                    "existing_id": ex["id"],
                                    "existing_name": ex["name"],
                                    "existing_operator": ex.get("operator"),
                                    "distance_meters": round(dist, 1),
                                    "name_similarity_pct": round(sim, 1),
                                    "recommendation": "Matches existing station in database within 100m"
                                })

        dup_count = len(duplicate_candidates)

        # 3. Quality Scores Calculation (0.0 to 100.0)
        has_coords = "latitude" in df.columns and "longitude" in df.columns
        coord_score = round((valid_coord_rows / total_rows) * 100.0, 1) if has_coords else 100.0
        completeness_score = round((complete_rows / total_rows) * 100.0, 1)
        dup_rate = round((dup_count / total_rows) * 100.0, 1) if total_rows > 0 else 0.0

        # Weighted quality score:
        # 40% Coordinates + 40% Completeness + 20% (100 - Duplicate Rate penalty)
        overall_score = round(
            (0.40 * coord_score) + (0.40 * completeness_score) + (0.20 * max(0.0, 100.0 - dup_rate * 2)), 1
        )

        overall_status = "VALIDATED"
        if invalid_count > total_rows * 0.30:
            overall_status = "FAILED"
        elif invalid_count > 0 or dup_count > 0 or warning_count > 0:
            overall_status = "NEEDS_REVIEW"

        # Generate sample preview (up to 15 rows)
        sample_preview = []
        preview_cols = [c for c in df.columns if not c.startswith("_")]
        for _, row in df.head(15).iterrows():
            item = {}
            for col in preview_cols:
                val = row[col]
                item[col] = None if pd.isna(val) else val
            sample_preview.append(item)

        return {
            "status": overall_status,
            "total_rows": total_rows,
            "valid_count": valid_count,
            "invalid_count": invalid_count,
            "warning_count": warning_count,
            "duplicate_count": dup_count,
            "detected_columns": list(df.columns),
            "quality_scores": {
                "coordinate_validity": coord_score,
                "completeness": completeness_score,
                "duplicate_rate": dup_rate,
                "overall_score": overall_score,
            },
            "issues": issues[:100],  # cap at 100 to keep responses snappy
            "duplicate_candidates": duplicate_candidates[:50],
            "sample_preview": sample_preview,
        }

