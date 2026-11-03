# ChargeAtlas India — Data Gaps, Disclosures and Analytical Limitations

## 1. Geographical Boundary Disclosures
- **Palghar District Boundary:** In standard Census 2011 shapefiles, Palghar is represented as part of greater Thane district because its administrative bifurcation occurred in August 2014. Where separate cadastral boundaries for Palghar are absent, spatial queries allocate stations to Thane/Palghar contiguous polygon.
- **Urban Area Boundaries:** Pune Urban Agglomeration is represented by the combined official jurisdiction of Pune Municipal Corporation (PMC) and Pimpri Chinchwad Municipal Corporation (PCMC) covering 516.18 km². Pune Cantonment and Kirkee Cantonment lands are included within the contiguous envelope.

## 2. EV Registration Data Scope
- **VAHAN 4 Coverage:** VAHAN 4 covers vehicles registered across RTOs in Maharashtra. Vehicles registered in other states and operating inter-state in Maharashtra (e.g., commercial trucks, intercity fleet cars) are not captured in state RTO totals.
- **Reporting Frequency:** RTO statistics represent cumulative registrations published through 2024.

## 3. Public Charging Infrastructure Limitations
- **Private & Residential Chargers:** Captive home chargers (Level 1/Level 2 wallboxes) and private commercial fleet depots (e.g., private delivery hub chargers) are intentionally excluded. Only verified public and semi-public charging stations are mapped.
- **Real-time Occupancy / Uptime:** Live OCPP socket telemetry (occupied/available status) is not universally exposed by all commercial CPOs without proprietary API credentials. Stations are assessed on rated nameplate capacity and verified operational standing.

## 4. Policy Benchmark Assumptions
- **MoP 2024 Spatial Guidelines:** The Ministry of Power benchmark of 1 public charging station per 1 km × 1 km grid represents an urban planning objective. In suburban or agrarian fringe zones of municipal corporations, grid cells may have low population density, where lack of a charger represents lower urgency than high-density transit corridors. The Charging Gap Index (CGI) accounts for this by factoring population and EV registrations into the multi-criteria score.
