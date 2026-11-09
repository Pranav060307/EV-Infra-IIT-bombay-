# CHARGEATLAS INDIA — PHASE 9 USER EXPERIENCE & CARTOGRAPHIC AUDIT
**Project:** ChargeAtlas India — Advanced EV Infrastructure Intelligence Platform  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Developer Lead:** Pranav Jadhav  
**Audit Timestamp:** 2026-11-06T18:58:00+05:30  
**Cartographic Standard:** WCAG 2.1 AA Accessibility & Professional Editorial Cartography  

---

## 1. Cartographic Visual Hierarchy & Editorial Theme

ChargeAtlas India features an editorial GIS aesthetic designed for government urban planning and policy evaluation:
- **Palette Standard:** High-contrast slate canvas (`#020617` Slate-950) with vibrant, semantically meaningful data accents:
  - **Emerald (`#10b981`):** Verified operational charging stations and compliant grid cells.
  - **Amber (`#f59e0b`):** Moderate gaps and interchange-vicinity charging points.
  - **Rose / Red (`#f43f5e`):** Severe charging deserts, infrastructure voids, and unserved planning zones.
  - **Indigo / Cyan (`#06b6d4`):** Boundary polygons and candidate siting parcels.
- **Typography:** `Inter` for crisp metric readouts and `JetBrains Mono` for coordinates, percentages, and data checksums.
- **Clutter Elimination:** WebGL dynamic clustering groups point features at high zoom levels, expanding into individual station pins with interactive tooltips upon zooming in.

---

## 2. Page-by-Page Usability & Component Audit

### 2.1 National EV Map View (`/`)
- **Controls:** Includes 1-click extent preset buttons (*All India*, *Maharashtra*, *Samruddhi Expressway*, *Pune Urban Grid*) that smoothly fly the MapLibre camera to standard bounding boxes.
- **Layers:** Displays high-level national state EV hubs (Delhi, Bengaluru, Chennai, Hyderabad, Mumbai, Pune, Kolkata, Ahmedabad) with total registered fleet summaries.
- **Search Bar:** Real-time filter allows users to quickly search districts and corridors with auto-focus.

### 2.2 Maharashtra 36-District View (`/maharashtra`)
- **Choropleth Rendering:** 36 district boundary polygons shaded smoothly by Charging Gap Index (CGI) vulnerability tiers:
  - Low Gap ($< 25$) $\rightarrow$ Dark Slate
  - Moderate Gap ($25 - 50$) $\rightarrow$ Navy / Blue
  - High Gap ($50 - 75$) $\rightarrow$ Purple / Violet
  - Severe Void ($> 75$) $\rightarrow$ Crimson / Rose
- **Interactivity:** Hovering over any district highlights its perimeter and displays an instant tooltip with EV count, station count, EV-to-charger ratio, and CGI rank.
- **Sidebar Integration:** Clicking a district populates the right-hand panel with detailed Census demographics, projected population, and recommended MoP minimum charger targets.

### 2.3 Pune 1 km² Micro-Grid View (`/pune`)
- **Grid Resolution:** 607 metric square cells ($1\text{ km} \times 1\text{ km}$) rendered with semi-transparent fill.
- **Accessibility Legend:**
  - Direct Walking ($\le 1\text{ km}$): Bright Emerald
  - Urban Neighborhood ($1 - 3\text{ km}$): Soft Teal
  - Extended Transit ($3 - 5\text{ km}$): Warning Amber
  - Charging Desert ($> 5\text{ km}$): Alert Red ($293$ cells)
- **Siting Benchmark Banner:** Prominently displays compliance against MoP Clause 11(1)(a) ($1.65\%$ strict direct coverage, $4.94\%$ effective buffer coverage).

### 2.4 Samruddhi Mahamarg Corridor View (`/samruddhi`)
- **Alignment:** Bold cyan LineString tracing the 701 km expressway centerline.
- **Multi-Level Buffers:** Concentric shaded polygons representing $5\text{ km}$ immediate zone, $10\text{ km}$ feeder zone, and $20\text{ km}$ statutory MoP benchmark zone.
- **Interchange Pins:** Exactly 17 circular markers indicating grade-separated trumpet/diamond interchanges. Clicking an interchange displays distance to nearest charger and estimated detour time ($18 - 25\text{ min}$).
- **Disclaimer Banner:** Clearly states: *"0 DC fast chargers operate directly on the mainline carriageway. Nearby chargers reside at interchange exits."*

### 2.5 Site Recommendations & MCDA View (`/recommendations`)
- **Candidate Pins:** 23 candidate parcel markers color-coded by Composite Suitability Score.
- **Interactive AHP Sliders:** Users can dynamically tweak weights (EV Demand, Substation Proximity, Highway Traffic, Station Separation) and observe candidate rank changes immediately.
- **Substation Layer:** Toggleable overlay of high-voltage substations with mandatory *Preliminary Suitability Only* disclaimer.

### 2.6 Data Trust & Provenance View (`/data-management`)
- **Registry Table:** Clean, tabular inspection view showing Dataset Name, Publisher, Official URL, Publication Date, Extraction Date, CRS, Quality Score, and SHA-256 Checksum.
- **Copy-to-Clipboard:** One-click button allows evaluators to copy file checksums and URLs for independent verification.

---

## 3. Responsive Design & Cross-Device Compatibility

The platform was tested across common viewport resolutions:
- **Desktop (1920 × 1080 & 1440 × 900):** Side-by-side split layout (Map on left $65\%$, analytical dashboard on right $35\%$).
- **Laptop (1280 × 800):** Adaptive layout with collapsible analytical sidebar.
- **Tablet (768 × 1024):** Touch-friendly controls with gesture zooming and bottom drawer details.
- **Mobile (375 × 667 & 412 × 915):** Stacked single-column view with full-width responsive map and swipeable KPI summary cards.

