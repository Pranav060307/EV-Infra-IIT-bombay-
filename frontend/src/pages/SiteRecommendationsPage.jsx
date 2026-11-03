import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  Zap, 
  Filter, 
  Maximize2,
  Building2,
  Compass,
  Sliders,
  Target,
  Layers,
  RefreshCw,
  Cpu
} from 'lucide-react';
import MapLibreMap from '../components/common/MapLibreMap';
import { getCandidates, rescoreMCDA, optimizeSiting, getSubstations } from '../services/api';

export const SiteRecommendationsPage = () => {
  const [selectedScope, setSelectedScope] = useState('ALL'); // ALL, PUNE, SAMRUDDHI, DISTRICTS
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Optimization state (MCLP)
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [budgetP, setBudgetP] = useState(5);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(3.0);

  // Custom MCDA Weights Drawer / Sliders
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [weights, setWeights] = useState({
    ev_demand_potential: 0.25,
    distance_from_chargers: 0.20,
    infrastructure_gap_severity: 0.15,
    road_accessibility: 0.15,
    electrical_proximity: 0.15,
    land_suitability: 0.10
  });

  // Fetch initial candidates and substations
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cList, sList] = await Promise.all([
          getCandidates({ scope: selectedScope, ...(selectedCategory !== 'ALL' ? { category: selectedCategory } : {}) }),
          getSubstations()
        ]);
        if (isMounted) {
          setCandidates(cList);
          setSubstations(sList);
          if (cList.length > 0) {
            setSelectedCandidate(cList[0]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load candidate sites:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [selectedScope, selectedCategory]);

  // Handle dynamic MCDA weight change and rescoring
  const handleRescoreMCDA = async () => {
    try {
      setLoading(true);
      const rescored = await rescoreMCDA({
        ...weights,
        scope: selectedScope,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined
      });
      setCandidates(rescored);
      if (rescored.length > 0) {
        setSelectedCandidate(rescored[0]);
      }
      setLoading(false);
    } catch (err) {
      console.warn('Failed to re-score MCDA:', err);
      setLoading(false);
    }
  };

  // Handle MCLP Optimization solve
  const handleRunMCLP = async () => {
    try {
      setIsOptimizing(true);
      const opt = await optimizeSiting({
        p_stations: budgetP,
        service_radius_km: serviceRadiusKm,
        scope: selectedScope === 'ALL' ? 'PUNE' : selectedScope
      });
      setOptimizationResult(opt);
      setIsOptimizing(false);
    } catch (err) {
      console.warn('MCLP solve failed:', err);
      setIsOptimizing(false);
    }
  };

  // Identify which candidates are part of optimal MCLP selection
  const optimalIds = new Set((optimizationResult?.selected_sites || []).map(s => s.id));

  // Map markers: candidates + substations
  const candidateMarkers = candidates.map(c => {
    const isOptimal = optimalIds.has(c.id);
    let markerColor = '#8b5cf6'; // purple default
    if (isOptimal) markerColor = '#10b981'; // emerald for optimal
    else if (c.priority_classification === 'HIGH_PRIORITY_CANDIDATE') markerColor = '#8b5cf6';
    else if (c.priority_classification === 'MEDIUM_PRIORITY_CANDIDATE') markerColor = '#f59e0b';
    else markerColor = '#64748b';

    return {
      name: c.name,
      operator: `${c.district} | MCDA Score: ${c.total_mcda_score} (${c.priority_classification.replace(/_/g, ' ')})`,
      latitude: c.coordinates.latitude,
      longitude: c.coordinates.longitude,
      color: markerColor
    };
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Module 7: Smart Site Recommender
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Evidence-Backed MCDA Siting Engine (23 Authentic Candidates)
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Intelligent EV Charging Site Recommendation &amp; Optimization Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Multi-Criteria Decision Analysis (MCDA) and Maximum Covering Location Problem (MCLP) solver evaluating unserved Pune grid cells, Samruddhi expressway voids, and zero-charger district transit nodes.
          </p>
        </div>

        {/* Planning Scope Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedScope('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'ALL'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Maharashtra (23)
          </button>
          <button
            onClick={() => setSelectedScope('PUNE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'PUNE'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Pune Urban (8)
          </button>
          <button
            onClick={() => setSelectedScope('SAMRUDDHI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'SAMRUDDHI'
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Samruddhi Expressway (7)
          </button>
          <button
            onClick={() => setSelectedScope('DISTRICTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'DISTRICTS'
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Zero-Charger Districts (8)
          </button>

          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-purple-400 hover:text-white"
          >
            <Sliders className="w-3.5 h-3.5" />
            MCDA Weights
          </button>
        </div>
      </div>

      {/* Interactive MCDA Weight Adjustment Drawer */}
      {showWeightSliders && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Adjust MCDA Siting Criterion Weights</h3>
            </div>
            <button
              onClick={handleRescoreMCDA}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Apply &amp; Re-Rank
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>1. EV Demand Catchment (w1):</span>
                <span className="font-bold text-emerald-400">{Math.round(weights.ev_demand_potential * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.ev_demand_potential}
                onChange={(e) => setWeights({ ...weights, ev_demand_potential: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>2. Distance from Existing Chargers (w2):</span>
                <span className="font-bold text-cyan-400">{Math.round(weights.distance_from_chargers * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.distance_from_chargers}
                onChange={(e) => setWeights({ ...weights, distance_from_chargers: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>3. Regional CGI Gap Severity (w3):</span>
                <span className="font-bold text-amber-400">{Math.round(weights.infrastructure_gap_severity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.infrastructure_gap_severity}
                onChange={(e) => setWeights({ ...weights, infrastructure_gap_severity: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>4. Road Network Hierarchy (w4):</span>
                <span className="font-bold text-purple-400">{Math.round(weights.road_accessibility * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.road_accessibility}
                onChange={(e) => setWeights({ ...weights, road_accessibility: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>5. Substation Proximity (w5):</span>
                <span className="font-bold text-rose-400">{Math.round(weights.electrical_proximity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.electrical_proximity}
                onChange={(e) => setWeights({ ...weights, electrical_proximity: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>6. Land Suitability &amp; Footfall (w6):</span>
                <span className="font-bold text-blue-400">{Math.round(weights.land_suitability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.land_suitability}
                onChange={(e) => setWeights({ ...weights, land_suitability: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* MCLP Facility Location Optimizer Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Cpu className="w-4 h-4" />
            <span>MCLP Facility Location Optimizer (Maximum Covering Model)</span>
          </div>
          <p className="text-slate-400">
            Select top <strong>p</strong> locations that mathematically maximize covered unserved EV fleet within a <strong>R km</strong> service catchment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>Budget (p):</span>
            <select
              value={budgetP}
              onChange={(e) => setBudgetP(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
            >
              <option value="3">3 Stations</option>
              <option value="5">5 Stations</option>
              <option value="7">7 Stations</option>
              <option value="10">10 Stations</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span>Radius (R):</span>
            <select
              value={serviceRadiusKm}
              onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
            >
              <option value="2.0">2.0 km (Urban)</option>
              <option value="3.0">3.0 km (Standard)</option>
              <option value="5.0">5.0 km (Suburban)</option>
              <option value="25.0">25.0 km (Corridor)</option>
            </select>
          </div>

          <button
            onClick={handleRunMCLP}
            disabled={isOptimizing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
          >
            {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
            Solve MCLP
          </button>
        </div>
      </div>

      {/* MCLP Optimization Summary (if solved) */}
      {optimizationResult && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              MCLP Solution Verified: {optimizationResult.selected_optimal_locations_count} Stations Selected
            </span>
            <span className="text-emerald-400 font-extrabold text-sm">
              Demand Covered: {optimizationResult.total_demand_coverage_pct}% ({optimizationResult.total_ev_demand_covered?.toLocaleString()} EVs)
            </span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Selected Optimal Siting Network: {optimizationResult.selected_sites?.map(s => s.name).join(' • ')}
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Candidate Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Recommended Siting Candidates Map</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> MCLP Optimal ({optimalIds.size})
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> High Priority
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Priority
              </span>
            </div>
          </div>

          <div className="h-[460px] w-full relative">
            <MapLibreMap
              center={selectedCandidate ? [selectedCandidate.coordinates.longitude, selectedCandidate.coordinates.latitude] : [75.7139, 19.7515]}
              zoom={selectedScope === 'PUNE' ? 10.5 : 7}
              markers={candidateMarkers}
            />
          </div>
        </div>

        {/* Candidate Detail Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 shadow-lg flex flex-col justify-between">
          {selectedCandidate ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {selectedCandidate.id}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                    {selectedCandidate.name}
                  </h3>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {selectedCandidate.district} | {selectedCandidate.corridor_name}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-purple-400">
                    {selectedCandidate.total_mcda_score}
                  </div>
                  <div className="text-[10px] text-slate-400">MCDA Score / 100</div>
                </div>
              </div>

              {/* Priority Badge */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                optimalIds.has(selectedCandidate.id)
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : selectedCandidate.total_mcda_score >= 75
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <span className="font-bold">
                  {optimalIds.has(selectedCandidate.id) ? '★ MCLP OPTIMAL SELECTION' : selectedCandidate.priority_classification.replace(/_/g, ' ')}
                </span>
                <span className="font-semibold">Rank #{selectedCandidate.rank} of {candidates.length}</span>
              </div>

              {/* Criterion Breakdown Radar / Bars */}
              <div className="space-y-2 pt-1">
                <div className="font-bold text-white flex items-center justify-between text-[11px]">
                  <span>Criterion Breakdown:</span>
                  <span className="text-slate-400">Weighted Points</span>
                </div>

                {Object.entries(selectedCandidate.mcda_criteria_breakdown || {}).map(([critKey, crit]) => (
                  <div key={critKey} className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="capitalize">{critKey.replace(/_/g, ' ')} ({Math.round(crit.weight * 100)}%)</span>
                      <span className="text-slate-200 font-semibold">{crit.normalized_score} / 100 ({crit.weighted_score} pts)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full" 
                        style={{ width: `${crit.normalized_score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proximity Evidence */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="font-semibold text-white">Geographic &amp; Electrical Proximity:</div>
                <div className="flex justify-between text-slate-300">
                  <span>Nearest Public Charger:</span>
                  <span className="text-amber-400 font-bold">{selectedCandidate.nearby_infrastructure?.nearest_charger_distance_km} km</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Nearest Substation:</span>
                  <span className="text-cyan-400 font-semibold">{selectedCandidate.nearby_infrastructure?.nearest_substation_name} ({selectedCandidate.nearby_infrastructure?.nearest_substation_distance_km} km)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Unserved EV Catchment:</span>
                  <span className="text-emerald-400 font-bold">{selectedCandidate.demand_indicators?.unserved_ev_catchment?.toLocaleString()} EVs</span>
                </div>
              </div>

              {/* Justification & Limitations */}
              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                  <strong>Recommendation Rationale: </strong>
                  {selectedCandidate.justification_for_recommendation}
                </div>
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300">
                  <strong>Engineering Limitations: </strong>
                  {selectedCandidate.engineering_limitations}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a candidate site from the list below to inspect its detailed MCDA scoring reasoning.
            </div>
          )}

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 italic">
            *Planning recommendation only. Does NOT constitute statutory site sanction or DISCOM guarantee.
          </div>
        </div>
      </div>

      {/* Candidate Ranking Table */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            Ranked Candidate Charging Locations ({candidates.length} Verified Parcels)
          </h3>
          <span className="text-xs text-slate-400">Click row to inspect on map</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-800/80 text-slate-300">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Candidate ID</th>
                <th className="p-3">Site Name</th>
                <th className="p-3">District / Corridor</th>
                <th className="p-3">Category</th>
                <th className="p-3">Nearest Charger</th>
                <th className="p-3">Substation Dist</th>
                <th className="p-3">Unserved EVs</th>
                <th className="p-3">MCDA Score</th>
                <th className="p-3">Priority Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              {candidates.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedCandidate(c)}
                  className={`cursor-pointer transition-colors ${
                    selectedCandidate?.id === c.id ? 'bg-purple-900/30 text-white' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="p-3 font-bold text-purple-400">#{c.rank}</td>
                  <td className="p-3 font-mono text-[11px]">{c.id}</td>
                  <td className="p-3 font-semibold text-white">{c.name}</td>
                  <td className="p-3">{c.district} ({c.scope})</td>
                  <td className="p-3 text-slate-300">{c.category.replace(/_/g, ' ')}</td>
                  <td className="p-3 font-bold text-amber-400">{c.nearby_infrastructure?.nearest_charger_distance_km} km</td>
                  <td className="p-3 text-cyan-400">{c.nearby_infrastructure?.nearest_substation_distance_km} km</td>
                  <td className="p-3 font-bold text-emerald-400">{c.demand_indicators?.unserved_ev_catchment?.toLocaleString()}</td>
                  <td className="p-3 font-extrabold text-purple-300">{c.total_mcda_score}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      optimalIds.has(c.id)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : c.priority_classification === 'HIGH_PRIORITY_CANDIDATE'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {optimalIds.has(c.id) ? 'MCLP OPTIMAL' : c.priority_classification.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SiteRecommendationsPage;
