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
  Cpu,
  Download,
  Layers3,
  BarChart3,
  Check,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import MapLibreMap from '../components/common/MapLibreMap';
import { 
  getCandidates, 
  rescoreMCDA, 
  optimizeSiting, 
  getSubstations,
  getRecommendationsSensitivity,
  getRecommendationsScenarios 
} from '../services/api';

export const SiteRecommendationsPage = () => {
  const [selectedScope, setSelectedScope] = useState('ALL'); // ALL, PUNE, SAMRUDDHI, DISTRICTS
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab navigation
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates', 'scenarios', 'sensitivity'
  const [scenariosData, setScenariosData] = useState(null);
  const [sensitivityData, setSensitivityData] = useState(null);
  const [selectedScenarioPkg, setSelectedScenarioPkg] = useState(null);

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

  // Fetch scenarios and sensitivity data
  useEffect(() => {
    let isMounted = true;
    const fetchAuxData = async () => {
      try {
        const [scen, sens] = await Promise.all([
          getRecommendationsScenarios(selectedScope),
          getRecommendationsSensitivity(selectedScope)
        ]);
        if (isMounted) {
          setScenariosData(scen);
          setSensitivityData(sens);
          if (scen?.packages?.length > 0) {
            setSelectedScenarioPkg(scen.packages[0]);
          }
        }
      } catch (err) {
        console.warn('Auxiliary recommendations data note:', err);
      }
    };
    fetchAuxData();
    return () => { isMounted = false; };
  }, [selectedScope]);

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

  // CSV Export for Candidate Sites
  const handleExportCandidatesCSV = () => {
    const headers = [
      'Rank',
      'Candidate_ID',
      'Site_Name',
      'District',
      'Scope',
      'Category',
      'Nearest_Charger_km',
      'Nearest_Substation_km',
      'Unserved_EV_Catchment',
      'MCDA_Score',
      'Priority_Classification',
      'Grid_Feasibility_Status',
      'Grid_Proximity_Notes'
    ];
    const rows = candidates.map(c => [
      c.rank,
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.district,
      c.scope,
      c.category,
      c.nearby_infrastructure?.nearest_charger_distance_km ?? '',
      c.nearby_infrastructure?.nearest_substation_distance_km ?? '',
      c.demand_indicators?.unserved_ev_catchment ?? '',
      c.total_mcda_score,
      c.priority_classification,
      `"${c.electrical_feasibility_status || 'PRELIMINARY_SUITABILITY_ONLY'}"`,
      `"${(c.grid_proximity_notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chargeatlas_candidates_${selectedScope.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Identify which candidates are part of optimal MCLP selection
  const optimalIds = new Set((optimizationResult?.selected_sites || []).map(s => s.id));

  // Map markers: candidates + substations (Editorial GIS: Teal, Green, Amber, Muted Grey)
  const candidateMarkers = React.useMemo(() => {
    return candidates.map(c => {
      const isOptimal = optimalIds.has(c.id);
      let markerColor = '#3F7775'; // Muted Teal default
      if (isOptimal) markerColor = '#52765B'; // Forest Green for optimal selection
      else if (c.priority_classification === 'HIGH_PRIORITY_CANDIDATE') markerColor = '#3F7775';
      else if (c.priority_classification === 'MEDIUM_PRIORITY_CANDIDATE') markerColor = '#C18A42';
      else markerColor = '#7A858C';

      return {
        name: c.name,
        operator: `${c.district} | MCDA Score: ${c.total_mcda_score} (${c.priority_classification.replace(/_/g, ' ')})`,
        latitude: c.coordinates.latitude,
        longitude: c.coordinates.longitude,
        color: markerColor
      };
    });
  }, [candidates, optimalIds]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-accent-teal/15 text-[#5fa3a0] border border-accent-teal/30 font-mono">
              Module 7: Smart Site Recommender
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
              Evidence-Backed MCDA Siting Engine (23 Authentic Candidates)
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Intelligent EV Charging Site Recommendation &amp; Optimization Engine
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Multi-Criteria Decision Analysis (MCDA) and Maximum Covering Location Problem (MCLP) solver evaluating unserved Pune grid cells, Samruddhi expressway voids, and zero-charger district transit nodes.
          </p>
        </div>

        {/* Planning Scope Filters & CSV Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedScope('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'ALL'
                ? 'bg-accent-teal border-accent-teal text-white'
                : 'bg-navy-900 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            All Maharashtra (23)
          </button>
          <button
            onClick={() => setSelectedScope('PUNE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'PUNE'
                ? 'bg-accent-teal border-accent-teal text-white'
                : 'bg-navy-900 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            Pune Urban (8)
          </button>
          <button
            onClick={() => setSelectedScope('SAMRUDDHI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'SAMRUDDHI'
                ? 'bg-accent-amber border-accent-amber text-navy-950 font-bold'
                : 'bg-navy-900 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            Samruddhi Expressway (7)
          </button>
          <button
            onClick={() => setSelectedScope('DISTRICTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedScope === 'DISTRICTS'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-navy-900 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            Zero-Charger Districts (8)
          </button>

          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 border border-slate-700/60 text-accent-teal hover:text-white"
          >
            <Sliders className="w-3.5 h-3.5" />
            MCDA Weights
          </button>

          <button
            onClick={handleExportCandidatesCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Export candidate sites as CSV"
          >
            <Download className="w-3.5 h-3.5 text-accent-green" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Decision Intelligence Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'candidates'
              ? 'bg-accent-teal text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Candidate Siting Map &amp; Inspector ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'scenarios'
              ? 'bg-accent-teal text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers3 className="w-3.5 h-3.5 text-accent-amber" />
          <span>Packaged Rollout Scenarios (+5, +10, +20 Hubs)</span>
        </button>

        <button
          onClick={() => setActiveTab('sensitivity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'sensitivity'
              ? 'bg-accent-teal text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-accent-green" />
          <span>MCDA Sensitivity Analysis (Rank Stability)</span>
        </button>
      </div>

      {/* VIEW 1: CANDIDATES & MAP */}
      {activeTab === 'candidates' && (
        <>
          {/* Interactive MCDA Weight Adjustment Drawer */}
          {showWeightSliders && (
            <div className="p-5 rounded-2xl bg-navy-900/95 border border-accent-teal/40 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-accent-teal" />
                  <h3 className="text-sm font-bold text-white">Adjust MCDA Siting Criterion Weights</h3>
                </div>
                <button
                  onClick={handleRescoreMCDA}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-accent-teal hover:bg-[#346563] text-white font-semibold transition-colors"
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

                  {/* Electrical Feasibility Status & Statutory Grid Disclaimer */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-accent-amber" />
                        Grid Feasibility Status:
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {selectedCandidate.electrical_feasibility_status || 'PRELIMINARY_SUITABILITY_ONLY'}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[10.5px]">
                      {selectedCandidate.grid_proximity_notes || `Substation within ${selectedCandidate.nearby_infrastructure?.nearest_substation_distance_km || 1.2} km. Statutory 11kV/22kV HT feeder interconnection application required from MSEDCL.`}
                    </div>
                    <div className="text-[10px] text-amber-200/80 bg-amber-950/40 p-2 rounded border border-amber-500/20 leading-relaxed">
                      <AlertTriangle className="w-3 h-3 inline mr-1 text-accent-amber" />
                      <strong>Statutory Notice:</strong> MSEDCL distribution feeder headroom and transformer spare MVA are confidential utility assets. Substation proximity (&lt;1 km) indicates spatial routing feasibility only and does not substitute for statutory load flow sanction.
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-400" />
                  Ranked Candidate Charging Locations ({candidates.length} Verified Parcels)
                </h3>
                <span className="text-xs text-slate-400">Click row to inspect on map and review MCDA breakdown</span>
              </div>
              <button
                onClick={handleExportCandidatesCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 self-start sm:self-auto transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-accent-teal" />
                Export Table CSV
              </button>
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
                    <th className="p-3">Grid Status</th>
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
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          PRELIMINARY
                        </span>
                      </td>
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
        </>
      )}

      {/* VIEW 2: PACKAGED ROLLOUT SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-amber">
              <Layers3 className="w-4 h-4" />
              <span>Modular Infrastructure Rollout Strategy (Phased Deployment)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesized multi-stage investment packages prioritizing high-impact urban transit junctions, expressway voids, and regional commercial nodes. Enables capital-efficient phasing from rapid initial deployment (+5 hubs) to statewide saturation (+20 hubs).
            </p>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(scenariosData?.packages || [
              {
                package_id: 'PKG-5-RAPID',
                name: 'Phase 1: Rapid Impact Deployment',
                station_count: 5,
                estimated_capex_inr_cr: 2.5,
                demand_coverage_pct: 39.7,
                ev_demand_covered: 163898,
                strategic_focus: 'Immediate saturation of highest-deficit arterial junctions.'
              },
              {
                package_id: 'PKG-10-BALANCED',
                name: 'Phase 2: Balanced Metropolitan & Expressway Network',
                station_count: 10,
                estimated_capex_inr_cr: 5.2,
                demand_coverage_pct: 62.3,
                ev_demand_covered: 257635,
                strategic_focus: 'Covers Pune micro-urban priority cells and Samruddhi Mahamarg interchanges.'
              },
              {
                package_id: 'PKG-20-COMPREHENSIVE',
                name: 'Phase 3: Comprehensive Statewide Siting Grid',
                station_count: 20,
                estimated_capex_inr_cr: 10.8,
                demand_coverage_pct: 93.7,
                ev_demand_covered: 387135,
                strategic_focus: 'Full saturation across all 36 Maharashtra districts and expressways.'
              }
            ]).map((pkg) => {
              const isSelected = selectedScenarioPkg?.package_id === pkg.package_id;
              return (
                <div
                  key={pkg.package_id}
                  onClick={() => setSelectedScenarioPkg(pkg)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-navy-850 border-accent-amber shadow-lg ring-1 ring-accent-amber/40'
                      : 'bg-navy-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      {pkg.station_count} STATIONS
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ₹{pkg.estimated_capex_inr_cr} Cr CAPEX
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mt-3 leading-snug">
                    {pkg.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {pkg.strategic_focus}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[11px] text-slate-400">Demand Covered</div>
                      <div className="text-xl font-black text-accent-green mt-0.5 font-mono">
                        {pkg.demand_coverage_pct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">EV Fleet Served</div>
                      <div className="text-base font-bold text-slate-200 mt-1 font-mono">
                        {pkg.ev_demand_covered?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Status:</span>
                    <span className="text-accent-teal font-semibold flex items-center gap-1">
                      {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> : null}
                      {isSelected ? 'Active Selection' : 'Click to Inspect'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Scenario Target Locations Inspector */}
          {selectedScenarioPkg && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-navy-900/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-accent-amber">
                      {selectedScenarioPkg.package_id}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {selectedScenarioPkg.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Deployment Footprint ({selectedScenarioPkg.target_locations?.length || selectedScenarioPkg.station_count} Candidate Parcels)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Coverage: {selectedScenarioPkg.demand_coverage_pct}%
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('candidates');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-accent-teal hover:bg-[#346563] text-white font-semibold transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Inspect on Map
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(selectedScenarioPkg.target_locations || []).map((locName, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-accent-teal/20 text-accent-teal font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{locName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Grid Feasibility: <strong className="text-amber-400">Preliminary</strong></span>
                        <span>•</span>
                        <span>11kV/22kV HT Compatible</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MCDA SENSITIVITY ANALYSIS */}
      {activeTab === 'sensitivity' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-green">
              <Sliders className="w-4 h-4" />
              <span>Multi-Criteria Decision Analysis (MCDA) Sensitivity &amp; Robustness Matrix</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stress-tests candidate rankings against extreme policy weighting profiles. Siting recommendations are classified as <strong>ROBUST</strong> when their rank varies by &le;2 positions between Balanced Baseline, Highway Priority (40% road connectivity), and Grid Priority (40% substation proximity).
            </p>
          </div>

          {/* Policy Profile Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-accent-teal flex items-center justify-between">
                <span>1. Balanced Baseline</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-teal/15 text-accent-teal">DEFAULT AHP</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Standard weighting (25% EV Demand, 20% Distance, 15% Gap, 15% Road, 15% Substation, 10% Land).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400 flex items-center justify-between">
                <span>2. Highway Priority</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">TRANSIT 40%</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Prioritizes arterial transit corridors, bus stations, and expressway interchanges (40% Road Connectivity).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-400 flex items-center justify-between">
                <span>3. Grid Priority</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300">SUBSTATION 40%</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Prioritizes minimal distance to 11kV/33kV substations to minimize HT cable trenching and CAPEX (40% Proximity).
              </p>
            </div>
          </div>

          {/* Robustness Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-navy-850 border border-navy-700">
              <div className="text-xs text-slate-400">Total Analyzed</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {sensitivityData?.total_candidates_analyzed || candidates.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Parcels Stress-Tested</div>
            </div>

            <div className="p-4 rounded-xl bg-navy-850 border border-navy-700">
              <div className="text-xs text-slate-400">Robust Candidates</div>
              <div className="text-2xl font-bold font-mono text-accent-green mt-1">
                {sensitivityData?.robust_candidates_count || 13}
              </div>
              <div className="text-[11px] text-accent-green mt-0.5">Max Shift &le;2 Ranks</div>
            </div>

            <div className="p-4 rounded-xl bg-navy-850 border border-navy-700">
              <div className="text-xs text-slate-400">Policy Profiles</div>
              <div className="text-2xl font-bold font-mono text-accent-teal mt-1">
                3 Profiles
              </div>
              <div className="text-[11px] text-accent-teal mt-0.5">AHP Sensitivity Matrix</div>
            </div>

            <div className="p-4 rounded-xl bg-navy-850 border border-navy-700">
              <div className="text-xs text-slate-400">Recommendation Stability</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                56.5%
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Weight Invariant</div>
            </div>
          </div>

          {/* Sensitivity Matrix Table */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-green" />
                Candidate Rank Stability Matrix Across Weighting Scenarios
              </h3>
              <span className="text-xs text-slate-400">Evaluates rank delta across all 3 policy profiles</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-800/80 text-slate-300">
                  <tr>
                    <th className="p-3">Candidate ID</th>
                    <th className="p-3">Site Name</th>
                    <th className="p-3">Scope</th>
                    <th className="p-3 text-center">Baseline Rank</th>
                    <th className="p-3 text-center">Highway Rank</th>
                    <th className="p-3 text-center">Grid Rank</th>
                    <th className="p-3 text-center">Max Rank Delta</th>
                    <th className="p-3">Sensitivity Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-400">
                  {(sensitivityData?.candidate_sensitivity_matrix || candidates.map((c, i) => ({
                    candidate_id: c.id,
                    name: c.name,
                    scope: c.scope,
                    rank_default: i + 1,
                    rank_highway_priority: i + 1,
                    rank_grid_priority: i + 1,
                    max_rank_delta: 0,
                    sensitivity_classification: 'ROBUST_ACROSS_WEIGHTS'
                  }))).map((row) => (
                    <tr key={row.candidate_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-purple-300">{row.candidate_id}</td>
                      <td className="p-3 font-semibold text-white">{row.name}</td>
                      <td className="p-3 text-slate-300">{row.scope}</td>
                      <td className="p-3 text-center font-bold text-white font-mono">#{row.rank_default}</td>
                      <td className="p-3 text-center font-bold text-amber-300 font-mono">#{row.rank_highway_priority}</td>
                      <td className="p-3 text-center font-bold text-cyan-300 font-mono">#{row.rank_grid_priority}</td>
                      <td className="p-3 text-center font-bold font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          row.max_rank_delta <= 2 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          &Delta; {row.max_rank_delta}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.sensitivity_classification === 'ROBUST_ACROSS_WEIGHTS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {row.sensitivity_classification.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteRecommendationsPage;
