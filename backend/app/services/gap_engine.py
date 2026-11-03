"""
ChargeAtlas India - Charging Gap Index (CGI) Analytical Engine
Phase 4: Transparent Multi-Criteria Siting & Prioritization Formulation

Audits and computes the Charging Gap Index (CGI, scale 0-100) across all geographic entities.
Every input, normalization formula, weight, and component contribution is explicitly exposed.

Mathematical Formulation:
    CGI = w1 * S_ratio + w2 * S_spatial + w3 * S_percapita + w4 * S_policy

Where:
    w1 = 0.35 (EV-to-Charger Ratio Gap: Higher ratio = greater congestion and charging deficit)
    w2 = 0.25 (Spatial Density Gap: Lower chargers per 1,000 km² = greater geographic void)
    w3 = 0.20 (Per-Capita Availability Gap: Lower chargers per 100k people = greater public deficit)
    w4 = 0.20 (MoP 2024 Urban Policy Shortfall: Shortfall against urban baseline recommended minimum)
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional

class ChargingGapEngine:
    """
    Computes Charging Gap Index (CGI) across geographic entities.
    Weights are configurable, documented, and fully explainable.
    """
    DEFAULT_WEIGHTS = {
        "ev_to_charger_ratio": 0.35,     # Higher EV/charger ratio = greater deficit
        "spatial_coverage": 0.25,        # Lower chargers/1000 km² = greater deficit
        "per_capita_availability": 0.20, # Lower chargers/100k pop = greater deficit
        "mop_policy_deficit": 0.20        # Shortfall against MoP 2024 urban recommendation
    }

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS
        total_w = sum(self.weights.values())
        if not (0.99 <= total_w <= 1.01):
            raise ValueError(f"CGI weights must sum to 1.0, got {total_w}")

    def compute_district_cgi(self, district_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculates CGI scores for all 36 Maharashtra districts.
        Exposes every sub-component and its weighted contribution for full explainability.
        """
        if not district_data:
            return []

        df = pd.DataFrame(district_data)

        # ----------------------------------------------------------------------
        # 1. Normalize EV-to-Charger Ratio Gap (Weight: 35%)
        # Input: total_ev / verified_charging_points
        # Normalization: If 0 chargers, score = 100.0 (maximum deficit).
        # Otherwise, scale 0 to 300 EVs/charger linearly to 0-100 score.
        # ----------------------------------------------------------------------
        gap_ev_ratios = []
        raw_ratios = []
        for _, row in df.iterrows():
            evs = row.get("total_ev", 0)
            cps = row.get("verified_charging_points", 0)
            if cps == 0:
                raw_ratios.append(None)
                gap_ev_ratios.append(100.0) # Maximum gap when 0 public chargers exist
            else:
                ratio = round(evs / cps, 1)
                raw_ratios.append(ratio)
                score = min(100.0, (ratio / 300.0) * 100.0)
                gap_ev_ratios.append(round(score, 2))

        df["raw_ev_to_charger_ratio"] = raw_ratios
        df["gap_ev_ratio_score"] = gap_ev_ratios

        # ----------------------------------------------------------------------
        # 2. Normalize Spatial Coverage Gap (Weight: 25%)
        # Input: chargers_per_1000_sqkm = (verified_charging_points / area_sq_km) * 1000
        # Normalization: Lower density = higher gap. Benchmark target: 10 chargers / 1,000 km².
        # ----------------------------------------------------------------------
        gap_spatial_scores = []
        raw_densities = []
        for _, row in df.iterrows():
            density = row.get("chargers_per_1000_sqkm")
            raw_densities.append(density)
            if density is None or density == 0:
                gap_spatial_scores.append(100.0)
            else:
                score = max(0.0, 100.0 - (float(density) / 10.0) * 100.0)
                gap_spatial_scores.append(round(score, 2))

        df["raw_chargers_per_1000_sqkm"] = raw_densities
        df["gap_spatial_score"] = gap_spatial_scores

        # ----------------------------------------------------------------------
        # 3. Normalize Per-Capita Availability Gap (Weight: 20%)
        # Input: chargers_per_100k_pop = (verified_charging_points / pop) * 100,000
        # Normalization: Lower per-capita = higher gap. Benchmark target: 5 chargers / 100k pop.
        # ----------------------------------------------------------------------
        gap_per_capita_scores = []
        raw_per_capitas = []
        for _, row in df.iterrows():
            per_cap = row.get("chargers_per_100k_pop")
            raw_per_capitas.append(per_cap)
            if per_cap is None or per_cap == 0:
                gap_per_capita_scores.append(100.0)
            else:
                score = max(0.0, 100.0 - (float(per_cap) / 5.0) * 100.0)
                gap_per_capita_scores.append(round(score, 2))

        df["raw_chargers_per_100k_pop"] = raw_per_capitas
        df["gap_per_capita_score"] = gap_per_capita_scores

        # ----------------------------------------------------------------------
        # 4. Normalize MoP 2024 Urban Policy Shortfall (Weight: 20%)
        # Input: Shortfall between observed chargers and recommended minimum
        # Baseline: At least 1 public charger per 20,000 urban population (minimum 5).
        # ----------------------------------------------------------------------
        gap_policy_scores = []
        rec_chargers = []
        for _, row in df.iterrows():
            cps = row.get("verified_charging_points", 0)
            pop = row.get("projected_2024_pop") or row.get("census_2011_pop") or 1000000
            urban_pct = row.get("urban_pct", 30.0) or 30.0
            urban_pop = pop * (urban_pct / 100.0)
            rec_min = max(5, int(urban_pop / 20000.0))
            rec_chargers.append(rec_min)

            if cps >= rec_min:
                gap_policy_scores.append(10.0) # MoP compliant tier
            else:
                shortfall = (rec_min - cps) / rec_min
                gap_policy_scores.append(round(min(100.0, shortfall * 100.0), 2))

        df["recommended_min_chargers"] = rec_chargers
        df["gap_policy_score"] = gap_policy_scores

        # ----------------------------------------------------------------------
        # 5. Composite Weighted Charging Gap Index (0.0 to 100.0)
        # ----------------------------------------------------------------------
        w1 = self.weights["ev_to_charger_ratio"]
        w2 = self.weights["spatial_coverage"]
        w3 = self.weights["per_capita_availability"]
        w4 = self.weights["mop_policy_deficit"]

        df["weighted_ratio_score"] = (w1 * df["gap_ev_ratio_score"]).round(2)
        df["weighted_spatial_score"] = (w2 * df["gap_spatial_score"]).round(2)
        df["weighted_per_capita_score"] = (w3 * df["gap_per_capita_score"]).round(2)
        df["weighted_policy_score"] = (w4 * df["gap_policy_score"]).round(2)

        df["cgi_score"] = (
            df["weighted_ratio_score"] +
            df["weighted_spatial_score"] +
            df["weighted_per_capita_score"] +
            df["weighted_policy_score"]
        ).round(1)

        # Categorize
        def categorize_cgi(score):
            if score <= 30.0:
                return "LOW GAP — ADEQUATE INFRASTRUCTURE"
            elif score <= 60.0:
                return "MODERATE GAP — EXPANSION RECOMMENDED"
            elif score <= 80.0:
                return "HIGH GAP — URGENT PUBLIC SITING REQUIRED"
            else:
                return "CRITICAL GAP — SEVERE INFRASTRUCTURE VOID"

        df["cgi_category"] = df["cgi_score"].apply(categorize_cgi)

        # Rank districts: Rank 1 = Highest gap (greatest infrastructure deficit)
        df["cgi_rank"] = df["cgi_score"].rank(ascending=False, method="min").astype(int)

        # Structured component breakdowns for explainability
        enriched_records = []
        for _, row in df.iterrows():
            rec = {k: (None if pd.isna(v) else v) for k, v in row.items()}
            rec["confidence_status"] = rec.get("status", "VERIFIED")
            rec["cgi_components_breakdown"] = {
                "ev_to_charger_ratio": {
                    "raw_value": rec.get("raw_ev_to_charger_ratio"),
                    "normalized_gap_score": rec.get("gap_ev_ratio_score"),
                    "weight": w1,
                    "weighted_contribution": rec.get("weighted_ratio_score"),
                    "influence": "Higher ratio indicates charging congestion and queues."
                },
                "spatial_coverage": {
                    "raw_value": rec.get("raw_chargers_per_1000_sqkm"),
                    "normalized_gap_score": rec.get("gap_spatial_score"),
                    "weight": w2,
                    "weighted_contribution": rec.get("weighted_spatial_score"),
                    "influence": "Lower chargers per 1,000 km² indicates geographic range-anxiety zones."
                },
                "per_capita_availability": {
                    "raw_value": rec.get("raw_chargers_per_100k_pop"),
                    "normalized_gap_score": rec.get("gap_per_capita_score"),
                    "weight": w3,
                    "weighted_contribution": rec.get("weighted_per_capita_score"),
                    "influence": "Lower chargers per 100,000 population indicates public accessibility shortfall."
                },
                "mop_policy_deficit": {
                    "recommended_min_chargers": rec.get("recommended_min_chargers"),
                    "observed_chargers": rec.get("verified_charging_points", 0),
                    "normalized_gap_score": rec.get("gap_policy_score"),
                    "weight": w4,
                    "weighted_contribution": rec.get("weighted_policy_score"),
                    "influence": "Shortfall against MoP 2024 urban municipal guideline minimum."
                }
            }
            rec["analytical_disclaimer"] = (
                "The Charging Gap Index (CGI) is an analytical multi-criteria prioritization indicator "
                "for planning and investment allocation; it does NOT constitute an official statutory legal finding."
            )
            enriched_records.append(rec)

        return enriched_records

    def compute_grid_cgi(self, grid_feature_collection: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates CGI for urban 1km x 1km grid cells."""
        features = grid_feature_collection.get("features", [])
        if not features:
            return grid_feature_collection

        for f in features:
            props = f.get("properties", {})
            st_count = props.get("station_count", 0)
            nearest_dist_m = props.get("nearest_station_distance_m")

            if st_count >= 1:
                cgi = 15.0
                cat = "LOW GAP (STATION PRESENT)"
            elif nearest_dist_m is not None:
                if nearest_dist_m <= 1000.0:
                    cgi = round(30.0 + (nearest_dist_m / 1000.0) * 30.0, 1)
                    cat = "MODERATE GAP (<1KM TO CHARGER)"
                elif nearest_dist_m <= 3000.0:
                    cgi = round(60.0 + ((nearest_dist_m - 1000.0) / 2000.0) * 20.0, 1)
                    cat = "HIGH GAP (1KM - 3KM TO CHARGER)"
                else:
                    cgi = 95.0
                    cat = "CRITICAL GAP (>3KM TO CHARGER)"
            else:
                cgi = 100.0
                cat = "CRITICAL GAP (UNCONNECTED)"

            props["cgi_score"] = cgi
            props["cgi_category"] = cat

        return grid_feature_collection

# Global gap engine
gap_engine = ChargingGapEngine()
