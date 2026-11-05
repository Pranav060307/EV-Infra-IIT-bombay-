# CHARGEATLAS INDIA — SAMRUDDHI MAHAMARG CORRIDOR SPATIAL ANALYSIS
**Platform:** ChargeAtlas India | **Team:** SuperNova (Sanjivani University)  
**Corridor:** Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg  
**Statutory Length:** 701.0 km | **Interchanges:** 24 Planned (17 Operational Surveyed)  
**Geodesy:** WGS-84 Ellipsoidal Inverse Geodesy (PyProj) across UTM 43N / 44N  

---

## 1. Expressway Overview & Engineering Specifications

The Samruddhi Mahamarg connects Nagpur (Vidarbha) to Mumbai (MMR) across 10 districts:
- **Design Speed:** 120 km/h (Passenger Vehicles) / 80 km/h (Heavy Commercial Vehicles)
- **Total Transit Duration:** **5.84 hours** at continuous design speed
- **Access Control:** Fully grade-separated, access-controlled with toll plazas exclusively at interchanges. EV users cannot pull off arbitrarily; charging MUST be situated either at designated wayside amenities or accessible via interchanges.

---

## 2. Empirical Ground Truth: Mainline Charging Gap

A strict audit of the official BEE EV Yatra portal and MSRDC wayside concessionaire records reveals the central empirical finding:

> **CRITICAL CORRIDOR DEFICIT:** Currently, **0 operational public fast-charging stations** exist directly on the Samruddhi Mahamarg expressway mainline.

While off-corridor stations exist in nearby taluka headquarters (e.g., Jalna, Mehkar, Shirdi, Sinnar), accessing them requires exiting via toll booths, incurring additional toll re-entry fees and navigating rural secondary feeder roads ($d_{\text{feeder}} = 4 - 15\text{ km}$, circuity $1.25$).

---

## 3. Ministry of Power September 2024 Policy Provisions Audit

### Provision 1: 20 km Spacing on Both Sides (Clause 11(1)(b))
- **Mandate:** At least one charging station every 20 km on both sides of the highway.
- **Corridor Segments Evaluated:** 36 sequential 20 km blocks.
- **Compliant Segments (within 10 km buffer of chainage):** 6 segments (near Nagpur and Nashik/Thane ends).
- **Deficit Segments:** 30 segments (**83.3% spacing deficit**).
- **Longest Continuous Unserved Stretch:** **701.0 km** along the expressway mainline.

### Provision 2: Directional Carriageway Compliance
- **Mandate:** Both directions of travel served independently or via dedicated grade-separated overpass.
- **Audit Verdict:** `UNVERIFIED`
- **Technical Explanation:** The BEE EV Yatra directory records single GPS point coordinates without recording the physical carriageway side. Proximity to highway centerline does not prove access for both Mumbai-bound and Nagpur-bound carriageways.

### Provision 3: 100 km Heavy-Duty Fast-Charging Hubs (Clause 12(7))
- **Mandate:** Fast-charging stations every 100 km with $\ge 2 \times 240\text{ kW}$ CCS-2 chargers for long-distance electric buses and commercial trucks.
- **100 km Blocks Evaluated:** 8 sequential 100 km blocks.
- **Compliant Blocks ($\ge 240\text{ kW}$ present):** **0 blocks (0.0% compliance)**.
- **Verdict:** Severe structural deficit for heavy commercial fleet electrification.

---

## 4. Lateral Buffer Sensitivity Analysis

Evaluating charging stations across lateral distances from the expressway centerline:
- **Direct Wayside ($\le 3\text{ km}$):** 0 stations.
- **Interchange Reach ($\le 5\text{ km}$):** 3 stations (accessible via specific interchange connector roads).
- **Regional Corridor Reach ($\le 10\text{ km}$):** 7 stations.
- **Macro Corridor Reach ($\le 20\text{ km}$):** 16 stations (in nearby rural towns).

---

## 5. Strategic Siting Recommendations for MSRDC

To bridge the 701 km corridor gap, ChargeAtlas models the optimal deployment plan:
1. **Phase 1 Priority:** Immediate concessionaire installation of 50 kW CCS-2 DC dual chargers at all **16 planned MSRDC Wayside Amenities** (spaced every 40–50 km).
2. **Phase 2 Priority:** Deployment of **7 Megawatt Heavy-Duty Charging Hubs** (each with $4 \times 240\text{ kW}$ guns) at major logistics interchanges:
   - Chhatrapati Sambhajinagar Interchange (Ch. 275 km)
   - Jalna Interchange (Ch. 340 km)
   - Shirdi Interchange (Ch. 500 km)
   - Sinnar / Nashik Interchange (Ch. 580 km)
