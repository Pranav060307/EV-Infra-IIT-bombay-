"""
ChargeAtlas India - MCDA Site Recommender & MCLP Optimization Automated Test Suite (Phase 5)
Tests:
- Geospatial candidates retrieval across Pune Urban, Samruddhi Corridor, and District HQs.
- 6-Criteria MCDA scoring formula, normalization, and weight sensitivity.
- Priority classification (HIGH_PRIORITY, MEDIUM_PRIORITY, LOW_PRIORITY, INSUFFICIENT_DATA).
- Missing data penalty handling (e.g. missing substation distance).
- Single candidate deep inspection with engineering limitations and justification.
- Maximum Covering Location Problem (MCLP) facility location optimization model.
- Substation list retrieval.
"""

import os
import sys
import pytest

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.recommender import recommender_engine
from app.api.v1.endpoints.recommendations import (
    get_candidates,
    rescore_mcda,
    get_candidate_details,
    optimize_siting,
    list_substations,
    MCDAWeightsRequest,
    MCLPOptimizationRequest
)


def test_candidates_retrieval_and_filtering():
    """Verify candidate locations retrieval across scopes and categories."""
    # All candidates
    all_cands = get_candidates(scope="ALL")
    assert len(all_cands) >= 20, "Expected at least 20 authentic candidate sites."
    
    # Pune scope
    pune_cands = get_candidates(scope="PUNE")
    assert len(pune_cands) >= 7
    for c in pune_cands:
        assert c["scope"] == "PUNE"

    # Samruddhi corridor scope
    sam_cands = get_candidates(scope="SAMRUDDHI")
    assert len(sam_cands) >= 6
    for c in sam_cands:
        assert c["scope"] == "SAMRUDDHI"

    # Filter by category
    bus_cands = get_candidates(category="BUS_DEPOT")
    assert len(bus_cands) > 0
    for c in bus_cands:
        assert c["category"] == "BUS_DEPOT"


def test_mcda_scoring_formula_and_weights():
    """Verify MCDA composite score calculation and weight normalization."""
    cands = get_candidates(scope="ALL")
    
    for c in cands:
        assert 0.0 <= c["total_mcda_score"] <= 100.0, f"Score {c['total_mcda_score']} out of range."
        assert c["priority_classification"] in [
            "HIGH_PRIORITY_CANDIDATE",
            "MEDIUM_PRIORITY_CANDIDATE",
            "LOW_PRIORITY_CANDIDATE",
            "INSUFFICIENT_DATA"
        ]
        
        # Check all 6 criteria are present in breakdown
        cb = c["mcda_criteria_breakdown"]
        assert "ev_demand_potential" in cb
        assert "distance_from_chargers" in cb
        assert "infrastructure_gap_severity" in cb
        assert "road_accessibility" in cb
        assert "electrical_proximity" in cb
        assert "land_suitability" in cb

        # Verify weights sum to ~1.0
        total_w = sum(v["weight"] for v in cb.values())
        assert 0.99 <= total_w <= 1.01

    # Verify ranking is strictly descending
    scores = [c["total_mcda_score"] for c in cands]
    assert scores == sorted(scores, reverse=True)


def test_dynamic_mcda_weight_rescoring():
    """Verify dynamic re-scoring when a user adjusts criteria weights."""
    req = MCDAWeightsRequest(
        ev_demand_potential=0.50,         # Heavy weight on EV demand
        distance_from_chargers=0.10,
        infrastructure_gap_severity=0.10,
        road_accessibility=0.10,
        electrical_proximity=0.10,
        land_suitability=0.10,
        scope="ALL"
    )
    rescored = rescore_mcda(req)
    assert len(rescored) >= 20
    
    # Candidate with the highest unserved EV demand should be near the top
    top_cand = rescored[0]
    assert top_cand["demand_indicators"]["unserved_ev_catchment"] >= 15000


def test_candidate_single_inspection():
    """Verify single candidate lookup endpoint with limitations and justifications."""
    cand = get_candidate_details("CAND-PUN-001")
    assert cand["id"] == "CAND-PUN-001"
    assert cand["district"] == "Pune"
    assert "coordinates" in cand
    assert "nearby_infrastructure" in cand
    assert "justification_for_recommendation" in cand
    assert "engineering_limitations" in cand
    assert "disclaimer" in cand


def test_mclp_optimization():
    """Verify Maximum Covering Location Problem facility-location solver."""
    req = MCLPOptimizationRequest(
        p_stations=5,
        service_radius_km=3.0,
        scope="PUNE"
    )
    res = optimize_siting(req)
    
    assert res["budget_p_stations"] == 5
    assert res["selected_optimal_locations_count"] == 5
    assert res["total_demand_coverage_pct"] > 50.0
    assert len(res["selected_sites"]) == 5
    assert "mathematical_formulation" in res
    assert "constraints" in res["mathematical_formulation"]


def test_substations_endpoint():
    """Verify electrical substations list endpoint."""
    subs = list_substations()
    assert len(subs) >= 10
    for s in subs:
        assert "id" in s
        assert "name" in s
        assert "voltage_kv" in s
        assert s["voltage_kv"] in [11.0, 22.0, 33.0, 132.0]
        assert "latitude" in s
        assert "longitude" in s

