import datetime
import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

# ------------------------------------------------------------------------------
# 1. METADATA & DATA GOVERNANCE
# ------------------------------------------------------------------------------

class DatasetSource(Base):
    __tablename__ = "dataset_sources"

    id = Column(String(64), primary_key=True)  # e.g., 'vahan_dashboard', 'openchargemap', 'bee_evyatra'
    name = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    source_url = Column(Text, nullable=True)
    license_type = Column(String(100), default="Open Data")
    update_frequency = Column(String(50), default="Monthly")
    is_synthetic = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    imports = relationship("DatasetImport", back_populates="source")


class DatasetImport(Base):
    __tablename__ = "dataset_imports"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    source_id = Column(String(64), ForeignKey("dataset_sources.id"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_format = Column(String(20), nullable=False)  # csv, xlsx, xls, geojson
    dataset_category = Column(String(50), nullable=False)  # charging_stations, ev_registrations, connectors, candidate_locations
    total_rows_read = Column(Integer, default=0)
    valid_rows_imported = Column(Integer, default=0)
    rejected_rows_count = Column(Integer, default=0)
    warning_rows_count = Column(Integer, default=0)
    duplicate_candidates_count = Column(Integer, default=0)
    status = Column(String(30), default="UPLOADED", index=True)  # UPLOADED, PROCESSING, VALIDATED, IMPORTED, NEEDS_REVIEW, FAILED
    is_synthetic = Column(Boolean, default=False, index=True)
    file_path = Column(Text, nullable=True)
    error_summary = Column(JSON, nullable=True)
    preview_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    source = relationship("DatasetSource", back_populates="imports")
    quality_report = relationship("DataQualityReport", back_populates="import_record", uselist=False, cascade="all, delete-orphan")


class DataQualityReport(Base):
    __tablename__ = "data_quality_reports"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    import_id = Column(String(64), ForeignKey("dataset_imports.id"), nullable=False, unique=True)
    coordinate_validity_score = Column(Float, default=100.0)  # 0.0 to 100.0
    duplicate_rate = Column(Float, default=0.0)              # percentage
    completeness_score = Column(Float, default=100.0)        # percentage non-null required fields
    overall_confidence_score = Column(Float, default=100.0)  # weighted aggregate 0-100
    issues_summary = Column(JSON, nullable=True)             # structured breakdown of warnings and errors
    generated_at = Column(DateTime, default=utc_now)

    import_record = relationship("DatasetImport", back_populates="quality_report")


# ------------------------------------------------------------------------------
# 2. ADMINISTRATIVE BOUNDARIES & POPULATION
# ------------------------------------------------------------------------------

class State(Base):
    __tablename__ = "states"

    state_code = Column(String(10), primary_key=True)  # e.g., 'IN-MH'
    name = Column(String(100), nullable=False, index=True)
    lgd_code = Column(Integer, unique=True, nullable=True)
    is_synthetic = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    districts = relationship("District", back_populates="state")


class District(Base):
    __tablename__ = "districts"

    district_code = Column(String(20), primary_key=True)  # e.g., 'MH-PUN'
    state_code = Column(String(10), ForeignKey("states.state_code"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    lgd_code = Column(Integer, unique=True, nullable=True)
    area_sqkm = Column(Float, nullable=True)
    is_synthetic = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    state = relationship("State", back_populates="districts")
    stations = relationship("ChargingStation", back_populates="district")
    registrations = relationship("EVRegistration", back_populates="district")
    population_records = relationship("PopulationData", back_populates="district")


class PopulationData(Base):
    __tablename__ = "population_data"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    district_code = Column(String(20), ForeignKey("districts.district_code"), nullable=False, index=True)
    year = Column(Integer, nullable=False, default=2024)
    total_population = Column(Integer, nullable=False)
    urban_population = Column(Integer, nullable=True)
    density_sqkm = Column(Float, nullable=True)
    is_synthetic = Column(Boolean, default=False, index=True)
    source_id = Column(String(64), ForeignKey("dataset_sources.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    district = relationship("District", back_populates="population_records")


# ------------------------------------------------------------------------------
# 3. CHARGING INFRASTRUCTURE (DECOUPLED 3-TIER HIERARCHY)
# ------------------------------------------------------------------------------

class ChargingStation(Base):
    """
    Tier 1: Physical site / charging facility location
    """
    __tablename__ = "charging_stations"

    id = Column(String(64), primary_key=True)  # Unique Station ID, e.g., 'STN-MH-PUN-001'
    name = Column(String(255), nullable=False, index=True)
    operator = Column(String(150), nullable=True, index=True)  # CPO Name: Tata Power, Statiq, Jio-bp, etc.
    address = Column(Text, nullable=True)
    state_code = Column(String(10), ForeignKey("states.state_code"), nullable=True, index=True)
    district_code = Column(String(20), ForeignKey("districts.district_code"), nullable=True, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    access_type = Column(String(50), default="PUBLIC")  # PUBLIC, SEMI_PUBLIC, RESTRICTED
    total_points = Column(Integer, default=1)
    status = Column(String(50), default="OPERATIONAL", index=True)  # OPERATIONAL, OFFLINE, UNDER_MAINTENANCE, PLANNED
    amenities = Column(JSON, nullable=True)  # ['washroom', 'cafe', 'wifi', 'parking']
    confidence_score = Column(Float, default=100.0)  # 0.0 - 100.0
    is_synthetic = Column(Boolean, default=False, index=True)
    source_id = Column(String(64), ForeignKey("dataset_sources.id"), nullable=True)
    import_id = Column(String(64), ForeignKey("dataset_imports.id"), nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    district = relationship("District", back_populates="stations")
    points = relationship("ChargingPoint", back_populates="station", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_stations_coords", "latitude", "longitude"),
    )


class ChargingPoint(Base):
    """
    Tier 2: Physical EVSE charger box / pedestal
    """
    __tablename__ = "charging_points"

    id = Column(String(64), primary_key=True)  # e.g., 'EVSE-MH-PUN-001-A'
    station_id = Column(String(64), ForeignKey("charging_stations.id", ondelete="CASCADE"), nullable=False, index=True)
    evse_model = Column(String(150), nullable=True)
    rated_power_kw = Column(Float, nullable=False, default=30.0)  # 3.3, 7.4, 22, 30, 60, 120, 240
    supply_type = Column(String(50), default="DC_FAST")  # AC_SINGLE_PHASE, AC_THREE_PHASE, DC_FAST
    operational_status = Column(String(50), default="AVAILABLE")
    is_synthetic = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    station = relationship("ChargingStation", back_populates="points")
    connectors = relationship("ChargingConnector", back_populates="point", cascade="all, delete-orphan")


class ChargingConnector(Base):
    """
    Tier 3: Individual connector plug / gun
    """
    __tablename__ = "charging_connectors"

    id = Column(String(64), primary_key=True)  # e.g., 'CONN-PUN-001-A1'
    point_id = Column(String(64), ForeignKey("charging_points.id", ondelete="CASCADE"), nullable=False, index=True)
    connector_type = Column(String(50), nullable=False, index=True)  # CCS_2, TYPE_2_AC, BHARAT_AC_001, BHARAT_DC_001, CHADEMO
    power_kw = Column(Float, nullable=False, default=30.0)
    current_type = Column(String(20), default="DC")  # AC, DC
    vehicle_compatibility = Column(String(50), default="4W", index=True)  # 2W_3W, 4W, BUS, ALL
    is_synthetic = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    point = relationship("ChargingPoint", back_populates="connectors")


# ------------------------------------------------------------------------------
# 4. EV REGISTRATIONS (VAHAN FLEET DATA)
# ------------------------------------------------------------------------------

class EVRegistration(Base):
    __tablename__ = "ev_registrations"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    district_code = Column(String(20), ForeignKey("districts.district_code"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    month = Column(Integer, nullable=False, index=True)
    vehicle_category = Column(String(20), nullable=False, index=True)  # 2W, 3W, 4W, BUS
    vehicle_class = Column(String(100), nullable=True)
    registrations_count = Column(Integer, nullable=False, default=0)
    source_id = Column(String(64), ForeignKey("dataset_sources.id"), nullable=True)
    import_id = Column(String(64), ForeignKey("dataset_imports.id"), nullable=True)
    is_synthetic = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    district = relationship("District", back_populates="registrations")

    __table_args__ = (
        Index("idx_ev_reg_query", "district_code", "year", "vehicle_category"),
    )


# ------------------------------------------------------------------------------
# 5. GRID INFRASTRUCTURE & SITE RECOMMENDATIONS
# ------------------------------------------------------------------------------

class Substation(Base):
    """
    Distribution substations for power proximity & preliminary feasibility checks
    """
    __tablename__ = "substations"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    operator = Column(String(150), nullable=True)  # MSEDCL, MSETCL, etc.
    voltage_level_kv = Column(Float, nullable=False, default=33.0)  # 11.0, 22.0, 33.0, 132.0, 220.0
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district_code = Column(String(20), ForeignKey("districts.district_code"), nullable=True, index=True)
    capacity_mva = Column(Float, nullable=True)
    estimated_spare_capacity_mw = Column(Float, nullable=True)
    verified_feasibility_status = Column(String(50), default="UNVERIFIED_PROXY")  # UNVERIFIED_PROXY, FEASIBLE, CONSTRAINED
    is_synthetic = Column(Boolean, default=False, index=True)
    source_id = Column(String(64), ForeignKey("dataset_sources.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class CandidateLocation(Base):
    """
    Candidate sites for EV charging station installations (MCLP input & output)
    """
    __tablename__ = "candidate_locations"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # PETROL_PUMP, MALL_COMMERCIAL, BUS_DEPOT, RAILWAY_STATION, HIGHWAY_AMENITY, MUNICIPAL_PARKING
    district_code = Column(String(20), ForeignKey("districts.district_code"), nullable=True, index=True)
    corridor_name = Column(String(100), nullable=True, index=True)  # e.g., 'Samruddhi Mahamarg', 'Pune Urban Grid'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    nearest_charger_distance_km = Column(Float, nullable=True)
    nearest_substation_distance_km = Column(Float, nullable=True)
    nearest_substation_id = Column(String(64), ForeignKey("substations.id"), nullable=True)
    estimated_footfall = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, VERY_HIGH
    electrical_feasibility_status = Column(String(100), default="PRELIMINARY_SUITABILITY_ONLY - DISCOM_FEASIBILITY_REQUIRED")
    recommendation_score = Column(Float, nullable=True)
    recommendation_reason = Column(Text, nullable=True)
    is_synthetic = Column(Boolean, default=False, index=True)
    source_id = Column(String(64), ForeignKey("dataset_sources.id"), nullable=True)
    import_id = Column(String(64), ForeignKey("dataset_imports.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)



# ------------------------------------------------------------------------------
# 6. AUTHENTICATION & ACCESS CONTROL
# ------------------------------------------------------------------------------

class User(Base):
    """
    User accounts for authenticated administrative and analytical access
    """
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=True)
    role = Column(String(30), default="viewer", nullable=False)  # admin, analyst, viewer
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
