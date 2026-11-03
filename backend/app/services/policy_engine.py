"""
ChargeAtlas India - Government Policy Benchmark Engine
Evaluates observed infrastructure against the Ministry of Power (MoP)
September 2024 Revised Guidelines & Standards for EV Charging Infrastructure.
"""

import os
import json
from typing import Dict, Any, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
POLICY_PATH = os.path.join(BASE_DIR, "data", "processed", "mop_charging_guidelines_2024.json")

class PolicyBenchmarkEngine:
    def __init__(self):
        self.policy_data = self._load_policy()

    def _load_policy(self) -> Dict[str, Any]:
        if os.path.exists(POLICY_PATH):
            with open(POLICY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "title": "MoP EV Charging Guidelines 2024",
            "issuing_authority": "Ministry of Power, GoI",
            "benchmarks": {}
        }

    def evaluate_urban_compliance(self, grid_feature_collection: Dict[str, Any]) -> Dict[str, Any]:
        """
        MoP September 2024 Clause 11(1)(a): At least 1 public charging station in a 1km x 1km grid in urban areas by FY 2029-30.
        """
        features = grid_feature_collection.get("features", [])
        total_cells = len(features)
        if total_cells == 0:
            return {
                "standard": "MoP 2024 Urban Standard — Clause 11(1)(a) (1 station / 1 km² by FY2030)",
                "status": "UNAVAILABLE — NO GRID DATA",
                "compliance_pct": 0.0
            }

        compliant_cells = sum(1 for f in features if f.get("properties", {}).get("station_count", 0) >= 1)
        adjacent_cells = sum(1 for f in features if f.get("properties", {}).get("nearest_station_distance_m", 99999) <= 1000 and f.get("properties", {}).get("station_count", 0) == 0)
        unserved_cells = total_cells - (compliant_cells + adjacent_cells)

        pct_direct = round((compliant_cells / total_cells) * 100.0, 1)
        pct_effective = round(((compliant_cells + adjacent_cells) / total_cells) * 100.0, 1)

        return {
            "policy_title": self.policy_data.get("title"),
            "issuing_authority": self.policy_data.get("issuing_authority"),
            "standard_clause": "Clause 11(1)(a) — Urban 1km x 1km Grid Density Target (by FY 2029-30)",
            "mandate": "At least 1 charging station within a 1 km x 1 km grid in urban areas by FY 2029-30 (FY 2030)",
            "target_deadline": "FY 2029-30 (FY 2030)",
            "total_urban_grid_cells_evaluated": total_cells,
            "cells_with_charging_station": compliant_cells,
            "cells_with_adjacent_charger_under_1km": adjacent_cells,
            "unserved_cells_over_1km": unserved_cells,
            "strict_compliance_pct": pct_direct,
            "effective_service_radius_compliance_pct": pct_effective,
            "compliance_verdict": "PARTIALLY COMPLIANT — URBAN EXPANSION REQUIRED TO MEET FY2030 TARGET" if pct_effective < 80 else "HIGHLY COMPLIANT"
        }

    def evaluate_corridor_compliance(self, corridor_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        MoP September 2024 Guidelines:
        - Clause 11(1)(b): Highway/expressway spacing: charging stations every 20 km on both sides.
        - Clause 11(1)(c) & Clause 12(7): Fast charging station every 100 km on each side for long-range and heavy-duty EVs, with at least two chargers of minimum 240 kW each.
        """
        segments = corridor_analysis.get("segments_analysis", [])
        total_segs = len(segments)
        if total_segs == 0:
            return {
                "standard": "MoP 2024 Highway Spacing Standard — Clause 11(1)(b) & Clause 12(7)",
                "status": "UNAVAILABLE"
            }

        compliant_segs = sum(1 for s in segments if s.get("mop_compliance") == "COMPLIANT")
        fast_240kw_segs = sum(1 for s in segments if s.get("fast_charger_240kw_present", False))

        compliance_pct = round((compliant_segs / total_segs) * 100.0, 1)

        return {
            "policy_title": self.policy_data.get("title"),
            "standard_clause": "Clause 11(1)(b), Clause 11(1)(c) & Clause 12(7) — Highway Spacing & Heavy-Duty Norms",
            "highway_spacing_standard": "Clause 11(1)(b): At least one charging station every 20 km on both sides of highways and expressways",
            "heavy_duty_standard": "Clause 11(1)(c) read with Clause 12(7): At least one fast-charging station every 100 km on each side, equipped with at least two chargers of minimum 240 kW each",
            "corridor_length_km": corridor_analysis.get("total_length_km", 701.0),
            "total_20km_segments": total_segs,
            "compliant_segments": compliant_segs,
            "deficit_segments_gap": total_segs - compliant_segs,
            "highway_spacing_compliance_pct": compliance_pct,
            "segments_with_240kw_heavy_duty_fast_charger": fast_240kw_segs,
            "compliance_verdict": "PARTIALLY COMPLIANT — 20KM SPACING GAPS IN CENTRAL CORRIDOR (WASHIM/BULDHANA); 0% COMPLIANT ON 240KW HEAVY-DUTY CHARGERS" if compliance_pct < 70 else "COMPLIANT"
        }

# Global instance
policy_engine = PolicyBenchmarkEngine()
