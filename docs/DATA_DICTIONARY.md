# ChargeAtlas India — Data Dictionary & Standardized Specifications

## 1. Standard Coordinate Reference System
- **CRS:** `EPSG:4326` (WGS 84 coordinate system).
- **Format:** Decimal degrees with minimum 6 decimal places (e.g., Latitude `18.520430`, Longitude `73.856743`).
- **Validation Rule:** Latitude must lie between `6.000000` and `38.000000`; Longitude between `68.000000` and `98.000000`.

---

## 2. Table & CSV Column Specifications

### 2.1 Charging Stations (`charging_stations.csv`)
| Column Name | Type | Nullable | Description / Standard Values | Example |
|---|---|---|---|---|
| `station_id` | String(64) | No | Unique alphanumeric identifier | `STN-MH-PUN-001` |
| `name` | String(255) | No | Publicly recognized name of location | `Shivajinagar EV Fast Charging Hub` |
| `operator` | String(150) | No | Charge Point Operator (CPO) | `Tata Power EZ Charge` |
| `latitude` | Decimal(10,7) | No | North latitude in decimal degrees | `18.531400` |
| `longitude` | Decimal(10,7) | No | East longitude in decimal degrees | `73.844600` |
| `state_code` | String(10) | No | Official state code | `IN-MH` |
| `district_code` | String(20) | No | Standard district code | `MH-PUN` |
| `address` | Text | Yes | Street address | `Near Pune Railway Station, Shivajinagar` |
| `access_type` | Enum | No | `PUBLIC`, `SEMI_PUBLIC`, `RESTRICTED` | `PUBLIC` |
| `total_points` | Integer | No | Count of distinct charging pedestals | `4` |
| `status` | Enum | No | `OPERATIONAL`, `OFFLINE`, `PLANNED` | `OPERATIONAL` |
| `source` | String(64) | No | Data origin | `BEE_EV_YATRA` |
| `is_synthetic` | Boolean | No | `TRUE` if mock data, `FALSE` if verified | `FALSE` |

### 2.2 Charging Points & Connectors (`charging_connectors.csv`)
| Column Name | Type | Nullable | Description / Standard Values | Example |
|---|---|---|---|---|
| `connector_id` | String(64) | No | Unique connector ID | `CONN-PUN-001-01` |
| `station_id` | String(64) | No | Foreign key to `charging_stations.station_id` | `STN-MH-PUN-001` |
| `connector_type` | Enum | No | `CCS_2`, `TYPE_2_AC`, `BHARAT_AC_001`, `BHARAT_DC_001`, `CHADEMO` | `CCS_2` |
| `power_kw` | Decimal(6,2) | No | Rated electrical capacity in kW | `60.00` |
| `current_type` | Enum | No | `AC`, `DC` | `DC` |
| `vehicle_compatibility`| String | No | Target segment (`2W_3W`, `4W`, `BUS`, `ALL`) | `4W` |

### 2.3 EV Registrations (`ev_registrations.csv`)
| Column Name | Type | Nullable | Description / Standard Values | Example |
|---|---|---|---|---|
| `record_id` | String(64) | No | Unique record identifier | `REG-MH-PUN-2024-01` |
| `district_code` | String(20) | No | Foreign key to district | `MH-PUN` |
| `year` | Integer | No | Calendar year | `2024` |
| `month` | Integer | No | Month (1 - 12) | `6` |
| `vehicle_category` | Enum | No | `2W`, `3W`, `4W`, `BUS` | `2W` |
| `registrations_count`| Integer | No | Number of new registrations logged | `1420` |
| `source` | String(64) | No | Source (e.g., `VAHAN_4`) | `VAHAN_4` |
| `is_synthetic` | Boolean | No | Synthetic flag | `FALSE` |

### 2.4 Candidate Locations (`candidate_locations.csv`)
| Column Name | Type | Nullable | Description / Standard Values | Example |
|---|---|---|---|---|
| `candidate_id` | String(64) | No | Unique site candidate ID | `CAND-PUN-042` |
| `name` | String(255) | No | Site landmark description | `Baner Indian Oil Petrol Pump` |
| `category` | Enum | No | `PETROL_PUMP`, `MALL`, `BUS_DEPOT`, `PARKING`, `HIGHWAY_AMENITY` | `PETROL_PUMP` |
| `latitude` | Decimal(10,7) | No | Latitude coordinate | `18.559100` |
| `longitude` | Decimal(10,7) | No | Longitude coordinate | `73.786800` |
| `district_code` | String(20) | No | Administrative district | `MH-PUN` |
| `estimated_footfall`| Enum | Yes | `LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH` | `HIGH` |
| `substation_distance_km`| Decimal(6,2)| Yes | Distance to nearest 11/33kV substation | `0.45` |
| `electrical_status`| Enum | No | `UNVERIFIED_PROXY`, `SURVEY_REQUIRED` | `UNVERIFIED_PROXY` |

