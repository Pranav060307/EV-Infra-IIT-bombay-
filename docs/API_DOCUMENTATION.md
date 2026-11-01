# ChargeAtlas India — REST API Specifications

## 1. Base URL & Protocol
- **Base URL:** `http://localhost:8000/api/v1`
- **Interactive OpenAPI Documentation:** `http://localhost:8000/docs` (Swagger UI)
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **Output Format:** JSON (Spatial endpoints return RFC 7946 GeoJSON)

---

## 2. Implemented Endpoints Matrix (Phase 1 & Phase 2)

| Module | Method | Endpoint | Description | Status |
|---|---|---|---|---|
| **System** | `GET` | `/health` | Service health, active database engine, PostGIS status, data mode | Active |
| **System** | `GET` | `/system-status` | High-level module statuses & geographic scope summary | Active |
| **Data Ingestion**| `GET` | `/datasets/metrics` | Ingestion KPI counts (uploaded, validated, imported, rejected) | Active |
| **Data Ingestion**| `POST` | `/datasets/upload` | Upload CSV / XLSX / XLS / GeoJSON with isolated staging | Active |
| **Data Ingestion**| `GET` | `/datasets/list` | List all staged, validated, and imported datasets | Active |
| **Data Ingestion**| `GET` | `/datasets/{dataset_id}` | Detailed dataset info, detected columns, sample preview | Active |
| **Data Ingestion**| `POST` | `/datasets/{dataset_id}/validate` | Run validation engine (coords, completeness, 100m duplicates) | Active |
| **Data Ingestion**| `GET` | `/datasets/{dataset_id}/report` | Detailed data quality report & duplicate candidates | Active |
| **Data Ingestion**| `POST` | `/datasets/{dataset_id}/import` | Approve & ingest validated records into production tables | Active |
| **Data Ingestion**| `DELETE` | `/datasets/{dataset_id}` | Delete staging file and associated records | Active |

---

## 3. Sample Payloads & Schemas

### `POST /api/v1/datasets/upload` (Multipart Form)
**Form Parameters:**
- `file`: Binary file (`.csv`, `.xlsx`, `.xls`, `.geojson`)
- `dataset_category`: `"charging_stations"`, `"ev_registrations"`, `"connectors"`, `"candidate_locations"`
- `source_name`: String (e.g., `"VAHAN Monthly Report"`, `"BEE EV Yatra Extract"`)
- `is_synthetic`: Boolean (`false` for real datasets, `true` for demonstration mocks)

**Response:**
```json
{
  "message": "Dataset uploaded and staged successfully.",
  "dataset_id": "IMP-b7e12f4a",
  "file_name": "pune_chargers_bee.csv",
  "format": "csv",
  "total_rows": 48,
  "detected_columns": ["station_id", "name", "operator", "latitude", "longitude", "total_points"],
  "status": "UPLOADED",
  "is_synthetic": false,
  "next_step": "Call POST /api/v1/datasets/IMP-b7e12f4a/validate to run validation and data quality checks."
}
```

### `POST /api/v1/datasets/{dataset_id}/validate`
**Response:**
```json
{
  "dataset_id": "IMP-b7e12f4a",
  "status": "VALIDATED",
  "total_rows": 48,
  "valid_count": 48,
  "invalid_count": 0,
  "warning_count": 0,
  "duplicate_count": 1,
  "quality_scores": {
    "coordinate_validity": 100.0,
    "completeness": 100.0,
    "duplicate_rate": 2.1,
    "overall_score": 95.8
  },
  "issues_count": 0,
  "duplicate_candidates": [
    {
      "type": "INTRA_DATASET_DUPLICATE",
      "row_a": 12,
      "row_b": 13,
      "name_a": "Wakad Fast Charger",
      "name_b": "Wakad Fast Charger Hub",
      "distance_meters": 18.4,
      "name_similarity_pct": 82.5,
      "recommendation": "Flagged for planner review (not automatically merged)"
    }
  ],
  "can_import": true
}
```

### `POST /api/v1/datasets/{dataset_id}/import`
**Response:**
```json
{
  "message": "Successfully imported 48 records into production database.",
  "dataset_id": "IMP-b7e12f4a",
  "status": "IMPORTED",
  "imported_count": 48,
  "is_synthetic": false
}
```
