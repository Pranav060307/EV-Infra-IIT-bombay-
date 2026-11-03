"""
ChargeAtlas India — Synthetic Data Generator
Generates realistic, traceable demonstration records across India, Maharashtra,
Pune urban grid, and the Samruddhi Mahamarg corridor.

ALL GENERATED RECORDS HAVE `is_synthetic = True` AND CAN BE CLEARED WITHOUT
AFFECTING REAL GOVERNMENT DATASETS.
"""

import argparse
import datetime
import random
import sys
import os

# Ensure backend root is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, init_db
from app.models import (
    DatasetSource,
    State,
    District,
    PopulationData,
    ChargingStation,
    ChargingPoint,
    ChargingConnector,
    EVRegistration,
    Substation,
    CandidateLocation,
    utc_now
)

def clear_synthetic_data(db):
    """
    Clears ONLY records marked is_synthetic = True, preserving any imported real datasets.
    """
    print("Clearing existing synthetic data...")
    db.query(ChargingConnector).filter(ChargingConnector.is_synthetic == True).delete(synchronize_session=False)
    db.query(ChargingPoint).filter(ChargingPoint.is_synthetic == True).delete(synchronize_session=False)
    db.query(ChargingStation).filter(ChargingStation.is_synthetic == True).delete(synchronize_session=False)
    db.query(EVRegistration).filter(EVRegistration.is_synthetic == True).delete(synchronize_session=False)
    db.query(PopulationData).filter(PopulationData.is_synthetic == True).delete(synchronize_session=False)
    db.query(CandidateLocation).filter(CandidateLocation.is_synthetic == True).delete(synchronize_session=False)
    db.query(Substation).filter(Substation.is_synthetic == True).delete(synchronize_session=False)
    db.query(District).filter(District.is_synthetic == True).delete(synchronize_session=False)
    db.query(State).filter(State.is_synthetic == True).delete(synchronize_session=False)
    db.query(DatasetSource).filter(DatasetSource.id == "synthetic_demo_engine").delete(synchronize_session=False)
    db.commit()
    print("Synthetic records purged cleanly.")

def generate_synthetic_data(seed=42):
    random.seed(seed)
    db = SessionLocal()

    try:
        print(f"Initializing database tables and synthetic generator (seed={seed})...")
        init_db()

        # 1. Dataset Source
        source = db.query(DatasetSource).filter_by(id="synthetic_demo_engine").first()
        if not source:
            source = DatasetSource(
                id="synthetic_demo_engine",
                name="ChargeAtlas Synthetic Demonstration Engine",
                organization="ChargeAtlas Planning Team (SuperNova)",
                source_url="http://localhost:8000/api/v1/datasets/templates",
                license_type="CC-BY-4.0 (Synthetic Mock)",
                update_frequency="On-Demand Demonstration",
                is_synthetic=True
            )
            db.add(source)
            db.flush()

        # 2. States (Level 1 Scope)
        states_data = [
            ("IN-MH", "Maharashtra", 27),
            ("IN-DL", "Delhi", 7),
            ("IN-KA", "Karnataka", 29),
            ("IN-TN", "Tamil Nadu", 33),
            ("IN-GJ", "Gujarat", 24),
            ("IN-UP", "Uttar Pradesh", 9),
            ("IN-RJ", "Rajasthan", 8),
            ("IN-KL", "Kerala", 32),
            ("IN-TG", "Telangana", 36),
            ("IN-WB", "West Bengal", 19),
            ("IN-MP", "Madhya Pradesh", 23),
            ("IN-HR", "Haryana", 6),
            ("IN-PB", "Punjab", 3),
            ("IN-AP", "Andhra Pradesh", 28),
            ("IN-BR", "Bihar", 10),
            ("IN-OR", "Odisha", 21),
            ("IN-AS", "Assam", 18),
            ("IN-JH", "Jharkhand", 20),
            ("IN-CT", "Chhattisgarh", 22),
            ("IN-UT", "Uttarakhand", 5),
            ("IN-HP", "Himachal Pradesh", 2),
            ("IN-GA", "Goa", 30),
            ("IN-TR", "Tripura", 16),
            ("IN-ML", "Meghalaya", 17),
            ("IN-MN", "Manipur", 14),
            ("IN-NL", "Nagaland", 13),
            ("IN-MZ", "Mizoram", 15),
            ("IN-AR", "Arunachal Pradesh", 12),
            ("IN-SK", "Sikkim", 11),
            ("IN-JK", "Jammu and Kashmir", 1),
            ("IN-LA", "Ladakh", 37),
            ("IN-CH", "Chandigarh", 4),
            ("IN-PY", "Puducherry", 34),
            ("IN-AN", "Andaman and Nicobar Islands", 35),
            ("IN-DN", "Dadra and Nagar Haveli and Daman and Diu", 26),
            ("IN-LD", "Lakshadweep", 31)
        ]

        for code, name, lgd in states_data:
            st = db.query(State).filter_by(state_code=code).first()
            if not st:
                db.add(State(state_code=code, name=name, lgd_code=lgd, is_synthetic=True))
        db.flush()

        # 3. Districts (Level 2: All 36 Districts of Maharashtra + Metros)
        mh_districts = [
            ("MH-PUN", "Pune", 521, 15643.0, 9429408, 5500000),
            ("MH-MUM", "Mumbai", 518, 157.0, 3145966, 3145966),
            ("MH-MSU", "Mumbai Suburban", 519, 446.0, 9356962, 9356962),
            ("MH-THN", "Thane", 517, 4214.0, 11060148, 8500000),
            ("MH-NAG", "Nagpur", 505, 9892.0, 4653570, 3100000),
            ("MH-NSK", "Nashik", 516, 15530.0, 6107187, 2600000),
            ("MH-AUR", "Chhatrapati Sambhajinagar", 515, 10107.0, 3701282, 1650000),
            ("MH-KOL", "Kolhapur", 530, 7685.0, 3876001, 1300000),
            ("MH-SOL", "Solapur", 526, 14895.0, 4317756, 1400000),
            ("MH-AMR", "Amravati", 503, 12210.0, 2888445, 1050000),
            ("MH-JAL", "Jalgaon", 514, 11765.0, 4229917, 1350000),
            ("MH-AHM", "Ahilyanagar (Ahmednagar)", 522, 17048.0, 4543159, 920000),
            ("MH-SAT", "Satara", 527, 10480.0, 3003741, 600000),
            ("MH-SAN", "Sangli", 531, 8572.0, 2822143, 720000),
            ("MH-RAI", "Raigad", 520, 7152.0, 2634200, 970000),
            ("MH-PAL", "Palghar", 665, 5344.0, 2990116, 1450000),
            ("MH-NAN", "Nanded", 511, 10528.0, 3361292, 910000),
            ("MH-DHU", "Dhule", 513, 8095.0, 2050862, 570000),
            ("MH-PAR", "Parbhani", 510, 6511.0, 1836086, 570000),
            ("MH-JLN", "Jalna", 512, 7718.0, 1959046, 380000),
            ("MH-BEE", "Beed", 523, 10693.0, 2585049, 510000),
            ("MH-LAT", "Latur", 524, 7157.0, 2455543, 620000),
            ("MH-OSM", "Dharashiv (Osmanabad)", 525, 7569.0, 1659915, 280000),
            ("MH-BUL", "Buldhana", 500, 9661.0, 2586258, 550000),
            ("MH-AKO", "Akola", 501, 5429.0, 1813906, 720000),
            ("MH-WAS", "Washim", 502, 5155.0, 1197160, 210000),
            ("MH-YAV", "Yavatmal", 504, 13582.0, 2772348, 600000),
            ("MH-WAR", "Wardha", 506, 6309.0, 1300774, 420000),
            ("MH-CHA", "Chandrapur", 508, 11443.0, 2204307, 780000),
            ("MH-GAD", "Gadchiroli", 509, 14412.0, 1072942, 120000),
            ("MH-GON", "Gondia", 507, 5431.0, 1322507, 230000),
            ("MH-BHA", "Bhandara", 636, 3895.0, 1200334, 230000),
            ("MH-RAT", "Ratnagiri", 528, 8208.0, 1615069, 265000),
            ("MH-SIN", "Sindhudurg", 529, 5207.0, 849651, 110000),
            ("MH-NDB", "Nandurbar", 637, 5055.0, 1648295, 280000),
            ("MH-HIN", "Hingoli", 638, 4526.0, 1177345, 180000),
        ]

        for d_code, d_name, lgd, area, pop, urban_pop in mh_districts:
            dist = db.query(District).filter_by(district_code=d_code).first()
            if not dist:
                dist = District(
                    district_code=d_code,
                    state_code="IN-MH",
                    name=d_name,
                    lgd_code=lgd,
                    area_sqkm=area,
                    is_synthetic=True
                )
                db.add(dist)
                db.flush()

                # Population
                db.add(PopulationData(
                    id=f"POP-{d_code}-2024",
                    district_code=d_code,
                    year=2024,
                    total_population=pop,
                    urban_population=urban_pop,
                    density_sqkm=round(pop / area, 1),
                    is_synthetic=True,
                    source_id="synthetic_demo_engine"
                ))

        db.commit()

        # 4. EV Registrations (Monthly 2022-2024 by Segment: 2W, 3W, 4W, BUS)
        print("Generating realistic synthetic EV registration histories...")
        reg_count = 0
        categories = ["2W", "3W", "4W", "BUS"]
        weights = {"2W": 0.65, "3W": 0.18, "4W": 0.16, "BUS": 0.01}

        for d_code, _, _, _, pop, _ in mh_districts:
            base_rate = max(100, int(pop / 15000))
            for year in [2022, 2023, 2024]:
                year_growth = (1.0 + (year - 2022) * 0.40)
                for month in range(1, 13):
                    if year == 2024 and month > 10:
                        continue  # Current year cutoff
                    for cat in categories:
                        monthly_vol = int(base_rate * weights[cat] * year_growth * random.uniform(0.85, 1.25))
                        reg_id = f"REG-{d_code}-{year}-{month:02d}-{cat}"
                        if not db.query(EVRegistration).filter_by(id=reg_id).first():
                            db.add(EVRegistration(
                                id=reg_id,
                                district_code=d_code,
                                year=year,
                                month=month,
                                vehicle_category=cat,
                                vehicle_class=f"Electric {cat}",
                                registrations_count=max(1, monthly_vol),
                                source_id="synthetic_demo_engine",
                                is_synthetic=True
                            ))
                            reg_count += 1
        db.commit()
        print(f"Generated {reg_count} monthly EV registration records.")

        # 5. Substations (Pune & Samruddhi Corridor Nodes)
        print("Generating electrical distribution substations...")
        substations_data = [
            ("SUB-PUN-01", "Shivajinagar 33kV GIS Substation", "MSEDCL", 33.0, 18.5320, 73.8450, "MH-PUN", 20.0, 4.5),
            ("SUB-PUN-02", "Hinjawadi Phase 1 22kV Feeder", "MSEDCL", 22.0, 18.5910, 73.7380, "MH-PUN", 15.0, 2.0),
            ("SUB-PUN-03", "Kothrud 11kV Distribution Substation", "MSEDCL", 11.0, 18.5080, 73.8070, "MH-PUN", 10.0, 1.2),
            ("SUB-PUN-04", "Viman Nagar 33kV Substation", "MSEDCL", 33.0, 18.5670, 73.9140, "MH-PUN", 25.0, 6.0),
            ("SUB-PUN-05", "Hadapsar Magarpatta 33kV Substation", "MSEDCL", 33.0, 18.5130, 73.9280, "MH-PUN", 20.0, 3.5),
            ("SUB-SAM-01", "Igatpuri Interchange 33kV Substation", "MSEDCL", 33.0, 19.6970, 73.5640, "MH-NSK", 15.0, 5.0),
            ("SUB-SAM-02", "Sinnar Industrial 33kV Substation", "MSEDCL", 33.0, 19.8450, 73.9980, "MH-NSK", 20.0, 7.5),
            ("SUB-SAM-03", "Kopargaon Bypass 33kV Substation", "MSEDCL", 33.0, 19.8890, 74.4750, "MH-AHM", 15.0, 3.2),
            ("SUB-SAM-04", "Aurangabad West Expressway 33kV", "MSEDCL", 33.0, 19.8760, 75.3430, "MH-AUR", 25.0, 8.0),
            ("SUB-SAM-05", "Jalna MIDC 33kV Substation", "MSEDCL", 33.0, 19.8410, 75.8820, "MH-JLN", 20.0, 4.0),
            ("SUB-SAM-06", "Karanja Lad Toll 22kV Substation", "MSEDCL", 22.0, 20.4840, 77.4910, "MH-WAS", 10.0, 2.5),
            ("SUB-SAM-07", "Wardha Outer 33kV Substation", "MSEDCL", 33.0, 20.7450, 78.6020, "MH-WAR", 15.0, 4.0),
            ("SUB-SAM-08", "Nagpur MIHAN Terminal 33kV Substation", "MSEDCL", 33.0, 21.0550, 79.0520, "MH-NAG", 30.0, 9.0),
        ]

        for s_id, s_name, s_op, kv, lat, lon, d_code, mva, mw in substations_data:
            if not db.query(Substation).filter_by(id=s_id).first():
                db.add(Substation(
                    id=s_id,
                    name=s_name,
                    operator=s_op,
                    voltage_level_kv=kv,
                    latitude=lat,
                    longitude=lon,
                    district_code=d_code,
                    capacity_mva=mva,
                    estimated_spare_capacity_mw=mw,
                    verified_feasibility_status="UNVERIFIED_PROXY",
                    is_synthetic=True,
                    source_id="synthetic_demo_engine"
                ))
        db.commit()

        # 6. Charging Stations, Points, and Connectors (Tier 1 -> 2 -> 3)
        print("Generating 3-tier charging infrastructure (stations, points, connectors)...")
        stations_spec = [
            # Pune Urban Hubs
            ("STN-PUN-001", "Shivajinagar EV Fast Charging Hub", "Tata Power EZ Charge", 18.5314, 73.8446, "MH-PUN", "Near Pune Central Shivajinagar", 4),
            ("STN-PUN-002", "Kothrud Paud Road Municipal Charger", "Statiq", 18.5074, 73.8077, "MH-PUN", "Paud Road Kothrud Pune", 2),
            ("STN-PUN-003", "Hinjawadi Phase 1 Tech Park Fast Hub", "Jio-bp pulse", 18.5912, 73.7389, "MH-PUN", "MIDC Tech Park Hinjawadi", 4),
            ("STN-PUN-004", "Viman Nagar Phoenix Mall EV Park", "Kazam", 18.5620, 73.9160, "MH-PUN", "Viman Nagar Airport Road", 3),
            ("STN-PUN-005", "Hadapsar Magarpatta Cybercity Hub", "Tata Power EZ Charge", 18.5140, 73.9290, "MH-PUN", "Magarpatta City Hadapsar", 4),
            ("STN-PUN-006", "Baner Aundh High Street Fast Station", "ChargeZone", 18.5590, 73.7870, "MH-PUN", "Baner Road Aundh", 2),
            ("STN-PUN-007", "Katraj Snake Park Municipal Charger", "MSEDCL Green", 18.4550, 73.8580, "MH-PUN", "Katraj Ghat Pune", 2),
            ("STN-PUN-008", "Wakad Dange Chowk Public Charging", "Statiq", 18.6010, 73.7710, "MH-PUN", "Dange Chowk Wakad", 2),
            # Near-Duplicate pair for Testing Deduplication Engine (<100m)
            ("STN-PUN-009", "Tata Power EZ Charge - Wakad Dange Chowk", "Tata Power EZ Charge", 18.6012, 73.7714, "MH-PUN", "Near Dange Chowk Flyover", 2),

            # Samruddhi Mahamarg Corridor Waypoints
            ("STN-SAM-001", "Samruddhi Mahamarg KM 45 Wayside Oasis", "Jio-bp pulse", 19.6980, 73.5650, "MH-NSK", "Igatpuri Corridor Node", 4),
            ("STN-SAM-002", "Samruddhi Sinnar Expressway Plaza", "Tata Power EZ Charge", 19.8460, 73.9990, "MH-NSK", "Sinnar Interchange KM 110", 4),
            ("STN-SAM-003", "Kopargaon Shirdi Junction EV Hub", "Statiq", 19.8900, 74.4760, "MH-AHM", "Kopargaon Toll KM 180", 2),
            ("STN-SAM-004", "Chhatrapati Sambhajinagar West Hub", "ChargeZone", 19.8770, 75.3440, "MH-AUR", "Waluj Interchange KM 280", 4),
            ("STN-SAM-005", "Jalna Bypass Freight & EV Hub", "Tata Power EZ Charge", 19.8420, 75.8830, "MH-JLN", "Jalna Interchange KM 340", 2),
            ("STN-SAM-006", "Karanja Lad Expressway Transit Hub", "Jio-bp pulse", 20.4850, 77.4920, "MH-WAS", "Karanja Lad Node KM 510", 4),
            ("STN-SAM-007", "Wardha Expressway Service Area", "Statiq", 20.7460, 78.6030, "MH-WAR", "Wardha Bypass KM 630", 2),
            ("STN-SAM-008", "Nagpur Zero Mile Expressway Terminal", "Tata Power EZ Charge", 21.0560, 79.0530, "MH-NAG", "Nagpur Terminal KM 701", 6),

            # Mumbai & Metros
            ("STN-MUM-001", "Bandra Kurla Complex High Power Hub", "Jio-bp pulse", 19.0657, 72.8688, "MH-MUM", "G Block BKC Bandra East", 6),
            ("STN-MUM-002", "Nariman Point Business District Fast Hub", "Tata Power EZ Charge", 18.9260, 72.8230, "MH-MUM", "Free Press Journal Marg", 4),
            ("STN-THN-001", "Thane Viviana Mall Fast Charging Oasis", "Statiq", 19.2090, 72.9720, "MH-THN", "Eastern Express Highway Thane", 4),
            ("STN-NAG-001", "Nagpur Sitabuldi Interchange Hub", "MSEDCL Green", 21.1440, 79.0830, "MH-NAG", "Sitabuldi Metro Station", 4),
        ]

        stn_added = 0
        point_added = 0
        conn_added = 0

        for stn_id, name, op, lat, lon, d_code, addr, pts in stations_spec:
            if not db.query(ChargingStation).filter_by(id=stn_id).first():
                db.add(ChargingStation(
                    id=stn_id,
                    name=name,
                    operator=op,
                    address=addr,
                    state_code="IN-MH",
                    district_code=d_code,
                    latitude=lat,
                    longitude=lon,
                    access_type="PUBLIC",
                    total_points=pts,
                    status="OPERATIONAL",
                    amenities=["washroom", "food_court", "parking", "wifi"],
                    confidence_score=95.0,
                    is_synthetic=True,
                    source_id="synthetic_demo_engine",
                    last_verified_at=utc_now()
                ))
                stn_added += 1

                # Generate Points & Connectors
                for p_idx in range(1, pts + 1):
                    p_id = f"EVSE-{stn_id}-{p_idx:02d}"
                    power = 60.0 if p_idx % 2 == 1 else 30.0
                    db.add(ChargingPoint(
                        id=p_id,
                        station_id=stn_id,
                        evse_model="Delta Dual Gun DC Fast",
                        rated_power_kw=power,
                        supply_type="DC_FAST",
                        operational_status="AVAILABLE",
                        is_synthetic=True
                    ))
                    point_added += 1

                    # Connectors
                    c1_id = f"CONN-{p_id}-1"
                    db.add(ChargingConnector(
                        id=c1_id,
                        point_id=p_id,
                        connector_type="CCS_2",
                        power_kw=power,
                        current_type="DC",
                        vehicle_compatibility="4W",
                        is_synthetic=True
                    ))
                    conn_added += 1

                    if power <= 30.0:
                        c2_id = f"CONN-{p_id}-2"
                        db.add(ChargingConnector(
                            id=c2_id,
                            point_id=p_id,
                            connector_type="TYPE_2_AC",
                            power_kw=7.4,
                            current_type="AC",
                            vehicle_compatibility="2W_3W",
                            is_synthetic=True
                        ))
                        conn_added += 1

        db.commit()
        print(f"Added {stn_added} stations, {point_added} charging points, {conn_added} connectors.")

        # 7. Candidate Locations (MCLP Inputs)
        print("Generating candidate siting locations...")
        candidates = [
            ("CAND-PUN-001", "Baner Indian Oil Petrol Pump", "PETROL_PUMP", 18.5591, 73.7868, "MH-PUN", "Pune Urban Grid", "HIGH", 0.45, "SUB-PUN-01", 88.5, "Closes 2.8km coverage gap in West Baner with 1,850 surrounding EVs"),
            ("CAND-PUN-002", "Pimpri Chinchwad Municipal Bus Depot", "BUS_DEPOT", 18.6270, 73.8050, "MH-PUN", "Pune Urban Grid", "VERY_HIGH", 0.60, "SUB-PUN-02", 92.0, "High fleet density for e-3Ws and feeder electric buses"),
            ("CAND-PUN-003", "Khadki Railway Station Public Parking", "RAILWAY_STATION", 18.5630, 73.8340, "MH-PUN", "Pune Urban Grid", "HIGH", 0.75, "SUB-PUN-01", 84.0, "Intermodal transit node connecting old highway to Pune metro"),
            ("CAND-PUN-004", "Hadapsar Gadital Transit Hub", "MUNICIPAL_PARKING", 18.4980, 73.9310, "MH-PUN", "Pune Urban Grid", "VERY_HIGH", 0.35, "SUB-PUN-05", 90.5, "Dense commercial e-3W passenger hub with no fast DC charger within 3km"),
            ("CAND-SAM-001", "Igatpuri Hillways Wayside Food Oasis", "HIGHWAY_AMENITY", 19.7020, 73.5700, "MH-NSK", "Samruddhi Mahamarg", "HIGH", 1.20, "SUB-SAM-01", 94.0, "Eliminates 38km expressway fast charger gap on Nagpur-bound carriageway"),
            ("CAND-SAM-002", "Mehkar Toll Plaza Amenity Park", "HIGHWAY_AMENITY", 20.1550, 76.5750, "MH-BUL", "Samruddhi Mahamarg", "MEDIUM", 1.80, "SUB-SAM-05", 89.0, "Fulfills MoP 2024 20km spacing mandate in Buldhana stretch"),
            ("CAND-SAM-003", "Pulgaon Fuel & Rest Stop", "PETROL_PUMP", 20.7250, 78.3180, "MH-WAR", "Samruddhi Mahamarg", "HIGH", 0.95, "SUB-SAM-07", 91.5, "Serves heavy intercity EV commercial transport between Amravati and Wardha"),
        ]

        cand_added = 0
        for c_id, c_name, c_cat, lat, lon, d_code, corr, footfall, sub_dist, sub_id, score, reason in candidates:
            if not db.query(CandidateLocation).filter_by(id=c_id).first():
                db.add(CandidateLocation(
                    id=c_id,
                    name=c_name,
                    category=c_cat,
                    district_code=d_code,
                    corridor_name=corr,
                    latitude=lat,
                    longitude=lon,
                    nearest_charger_distance_km=2.5,
                    nearest_substation_distance_km=sub_dist,
                    nearest_substation_id=sub_id,
                    estimated_footfall=footfall,
                    electrical_feasibility_status="PRELIMINARY_SUITABILITY_ONLY - DISCOM_FEASIBILITY_REQUIRED",
                    recommendation_score=score,
                    recommendation_reason=reason,
                    is_synthetic=True,
                    source_id="synthetic_demo_engine"
                ))
                cand_added += 1

        db.commit()
        print(f"Added {cand_added} candidate siting recommendations.")
        print("\n✅ Synthetic demonstration data generated successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during synthetic data generation: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ChargeAtlas Synthetic Data Generator")
    parser.add_argument("--clear", action="store_true", help="Clear existing synthetic records before generating")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducible mock records")
    args = parser.parse_args()

    if args.clear:
        db = SessionLocal()
        clear_synthetic_data(db)
        db.close()

    generate_synthetic_data(seed=args.seed)

