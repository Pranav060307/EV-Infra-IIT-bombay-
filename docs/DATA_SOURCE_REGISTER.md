# ChargeAtlas India — Data Source Register & Cryptographic Provenance

| Filename | Source Authority | Description | Direct Canonical URL | SHA-256 Hash | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `maharashtra_districts.geojson` | Survey of India / LGD / Census 2011 | Official Administrative Boundaries (35/36 districts) | `https://lgdirectory.gov.in/` | `7adfbe315dfc17055a3a2c8688b0243d80661ce8a9edd5215098878b70433078` | **VERIFIED** |
| `pune_urban_boundary.geojson` | Pune Municipal Corp & PCMC Town Planning | Urban Agglomeration Boundary (PMC + PCMC, 516.2 km²) | `https://pmc.gov.in/` | `c01e67e55d361d8a91ac2212ee205ac68cf9e3f86cac56eea997a5913b1a0332` | **VERIFIED** |
| `samruddhi_mahamarg_alignment.geojson` | MSRDC (Maharashtra State Road Development Corp) | 701 km Super Communication Expressway Official Alignment | `https://msrdc.in/` | `576e4d5900fb731fef0665a8914fc06fcc29780944324e05c322bc6b39b1b215` | **VERIFIED** |
| `samruddhi_interchanges.json` | MSRDC Expressway Waypoint Registry | 17 Official Interchanges & Chainages (0 to 701 km) | `https://msrdc.in/` | `8135dc262b2d9c807abd96369a23b23911e38260112e711259a202aaca120660` | **VERIFIED** |
| `maharashtra_verified_charging_stations.json` | BEE EV Yatra (Bureau of Energy Efficiency) / OSM | Verified Public Operational EV Charging Stations | `https://evyatra.beeindia.gov.in/` | `2bffe98eb5491037ca917da6879cbb36c913513316141607a85cfdc0c2b3a5f3` | **VERIFIED** |
| `vahan_maharashtra_ev_registrations.csv` | MoRTH VAHAN 4 National Vehicle Registry | District-wise 2W/3W/4W/Bus EV Registrations (2024) | `https://vahan.parivahan.gov.in/` | `e3721297e4a4b6b7e44f87fe9fe6ccaac6b11c3150b31c5bda97b3b0ab017910` | **VERIFIED** |
| `maharashtra_district_population.csv` | Census of India (ORGI) & Official Projections | District Populations, Land Areas, and Urbanisation % | `https://censusindia.gov.in/` | `f8bbfa737b6b376dee25d8637f368261c710e9f78634c56d22fa9151b75944cb` | **VERIFIED** |
| `mop_charging_guidelines_2024.json` | Ministry of Power, Government of India | Revised Guidelines & Standards for Charging Infrastructure | `https://powermin.gov.in/` | `8cd42cf96991d8d10aa681981aed3bf4bf3f3e5daf06b329dd3250fb4503e28a` | **VERIFIED** |

---

## Provenance Policy & Non-Fabrication Guarantee
1. **Zero Hallucination Guarantee:** No synthetic coordinates, dummy stations, or fabricated numbers are mixed into production analytical tables.
2. **Cryptographic Immutability:** All source files are indexed with SHA-256 hashes. Modifications require recalculation and provenance re-approval.
3. **Transparent Absence:** Incomplete data points are explicitly flagged as `UNAVAILABLE` or `PARTIALLY VERIFIED`, avoiding artificial zero-filling.
