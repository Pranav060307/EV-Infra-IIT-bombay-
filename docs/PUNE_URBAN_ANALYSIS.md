# CHARGEATLAS INDIA — PUNE URBAN AGGLOMERATION SPATIAL ANALYSIS
**Platform:** ChargeAtlas India | **Team:** SuperNova (Sanjivani University)  
**Territory:** Pune Municipal Corporation (PMC) & Pimpri-Chinchwad (PCMC)  
**Statutory Area:** 516.18 km² | **Grid Resolution:** 1 km × 1 km Metric Cells  
**Local Coordinate System:** EPSG:32643 (UTM Zone 43N)

---

## 1. Executive Summary & Geographic Context

Pune is Maharashtra's premier EV adoption hotspot, accounting for over **110,000 registered electric vehicles** (with 2W scooters comprising >78% of the fleet). However, spatial deployment of public charging infrastructure is highly asymmetric:
- **Core Corridor Clusters:** High concentration along Old Mumbai-Pune Highway, Hinjawadi IT Park, and Baner/Balewadi.
- **Peripheral & Eastern Voids:** Severe charging deficits across Hadapsar, Wagholi, Katraj, and outer PCMC industrial zones.

---

## 2. 1 km × 1 km Metric Grid Generation & Clipping

The micro-grid is generated using PostGIS `ST_SquareGrid` and Shapely 2.0 in projected metric space (EPSG:32643):
- **Raw Bounding Box Extent:** MinX: 366,000m, MinY: 2,040,000m, MaxX: 400,000m, MaxY: 2,075,000m.
- **Prepared Geometry Clipping:** Using `shapely.prepared.prep` against the official 516.18 km² municipal boundary polygon.
- **Sliver Removal:** Cells with clipped area $< 0.05\text{ km}^2$ (<5% of full 1 km² cell) are discarded to avoid edge artifacts.
- **Total Valid Evaluated Cells:** **431 micro-grid cells**.

---

## 3. Road-Network Circuity & Accessibility Tiers

Rather than naive straight-line Euclidean measurements, ChargeAtlas applies an empirical **1.32 circuity factor** calibrated against Pune's topological road network (accounting for Mula-Mutha river crossings, NH-48 ring bypass, and arterial railway flyovers).

### Multi-Level Accessibility Breakdown across 431 Cells:
| Accessibility Tier | Road Distance | Grid Cells | Area (km²) | Percentage (%) | Planning Action |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Direct Walking (<1km)** | $\le 1.0\text{ km}$ | 32 | 31.8 | 7.4% | Satisfies immediate walking / AC slow charging needs. |
| **Urban Neighborhood (1-3km)** | $1.0 - 3.0\text{ km}$ | 98 | 97.4 | 22.7% | Accessible within 5–8 minutes driving time. |
| **Extended Transit (3-5km)** | $3.0 - 5.0\text{ km}$ | 146 | 145.2 | 33.9% | Requires dedicated journey to charge (10–14 min). |
| **Severe Charging Desert (>5km)** | $> 5.0\text{ km}$ | 155 | 154.6 | 36.0% | **High-priority municipal investment priority**. |

### Vehicular Travel Times:
- **Peak Hours (22 km/h average speed):** Average road transit time for unserved cells is **14.8 minutes**.
- **Off-Peak Hours (35 km/h average speed):** Average road transit time is **9.3 minutes**.

---

## 4. Ministry of Power 2024 Urban Benchmark Audit

Under Clause 11(1)(a) of the **Ministry of Power Charging Infrastructure Guidelines (17 Sept 2024)**:
> *"In urban areas, at least one charging station shall be provided in a grid of 3 km × 3 km."*

### Compliance Audit Results:
- **Statutory Target Date:** FY 2029–30 (Progressive municipal rollout).
- **Direct Station Cells (1 km²):** 25 cells (5.8% of urban territory).
- **Adjacent Buffer Coverage (<1 km proximity):** 68 cells (15.8% of urban territory).
- **Total Served Urban Area:** 93 cells (**21.6% effective coverage**).
- **Unserved Planning Deficit:** 338 cells (**78.4% investment deficit**).

### Legal / Planning Disclaimer:
*Cells lacking a charger represent municipal capital investment targets for the FY2030 vision rather than immediate legal violations.*
