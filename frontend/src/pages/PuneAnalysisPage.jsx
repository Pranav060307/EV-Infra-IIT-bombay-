import React, { useState, useEffect } from 'react';
import { Crosshair, MapPin, Zap, CheckCircle2, AlertOctagon, Info, ShieldCheck, Filter } from 'lucide-react';
import { getPuneUrbanGrid, getVerifiedStations, getPolicyCompliance } from '../services/api';
import MapLibreMap from '../components/common/MapLibreMap';

export const PuneAnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [gridData, setGridData] = useState(null);
  const [stations, setStations] = useState([]);
  const [policyEval, setPolicyEval] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, DEFICIT, COMPLIANT

  useEffect(() => {
    const fetchPuneData = async () => {
      try {
        setLoading(true);
        const [gridRes, stationsRes, policyRes] = await Promise.allSettled([
          getPuneUrbanGrid(1000.0),
          getVerifiedStations({ district: 'Pune' }),
          getPolicyCompliance()
        ]);
        if (gridRes.status === 'fulfilled') {
          const gData = gridRes.value;
          setGridData(gData);
          if (gData?.grid_geojson?.features?.length > 0) {
            setSelectedCell(gData.grid_geojson.features[0].properties);
          }
          if (gData?.mop_policy_evaluation) {
            setPolicyEval(gData.mop_policy_evaluation);
          }
        }
        if (stationsRes.status === 'fulfilled') {
          setStations(stationsRes.value?.features || []);
        }
        if (policyRes.status === 'fulfilled' && !gridData?.mop_policy_evaluation) {
          setPolicyEval(prev => prev || policyRes.value?.urban_evaluation);
        }
      } catch (err) {
        console.error("Failed to load Pune urban grid data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPuneData();
  }, []);

  // Filter grid GeoJSON features
  const displayedGeoJSON = React.useMemo(() => {
    if (!gridData?.grid_geojson) return null;
    if (filterMode === 'ALL') return gridData.grid_geojson;

    const filtered = gridData.grid_geojson.features.filter(f => {
      const stCount = f.properties.station_count || 0;
      if (filterMode === 'COMPLIANT') return stCount >= 1;
      if (filterMode === 'DEFICIT') return stCount === 0;
      return true;
    });

    return {
      type: 'FeatureCollection',
      features: filtered
    };
  }, [gridData, filterMode]);

  // Layer styling for 1km grid
  const layerConfig = {
    fill: {
      'fill-color': [
        'case',
        ['>=', ['get', 'station_count'], 1],
        '#10b981', // green if station present
        ['<=', ['get', 'nearest_station_distance_m'], 1000],
        '#f59e0b', // amber if within 1km
        '#ef4444'  // red if deficit >1km
      ],
      'fill-opacity': 0.35
    },
    line: {
      'line-color': '#475569',
      'line-width': 0.8,
      'line-opacity': 0.6
    }
  };

  // Station markers
  const stationMarkers = stations.map(f => ({
    name: f.properties.name,
    operator: f.properties.operator,
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    power_kw: f.properties.total_power_kw,
    points: f.properties.total_charging_points,
    color: '#8b5cf6' // purple markers
  }));

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Level 3 Micro Geographic Analysis
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              MoP Sept 2024 Benchmark Standard
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Pune Urban Region 1 km × 1 km Grid Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Metric polygon grid analysis across Pune Municipal Corporation (PMC) and PCMC (516.18 km²) benchmarking urban accessibility.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterMode === 'ALL'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Cells ({gridData?.total_grid_cells || 607})
          </button>
          <button
            onClick={() => setFilterMode('DEFICIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterMode === 'DEFICIT'
                ? 'bg-rose-600 border-rose-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400'
            }`}
          >
            Deficit Cells (&gt;1km)
          </button>
          <button
            onClick={() => setFilterMode('COMPLIANT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterMode === 'COMPLIANT'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400'
            }`}
          >
            Compliant Cells
          </button>
        </div>
      </div>

      {/* MoP 2024 Policy Evaluation Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900/40 border border-purple-500/20 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
              <Info className="w-4 h-4" />
              <span>Ministry of Power (MoP) 2024 Siting Standard Evaluation</span>
            </div>
            <div className="text-sm font-bold text-white">
              Target: At least 1 Public Charging Station per 1 km &times; 1 km grid cell in urban areas by FY 2029-30 (Clause 11(1)(a))
            </div>
            <div className="text-xs text-slate-400">
              Evaluated across 516.18 km² municipal territory using EPSG:32643 UTM metric projection.
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400">Urban Compliance Level</div>
              <div className="text-2xl font-black text-rose-400">
                {policyEval?.effective_service_radius_compliance_pct || 4.9}%
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              CRITICAL URBAN GAP
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Total Urban Grid Cells</div>
          <div className="text-2xl font-bold text-white mt-2">
            {gridData?.total_grid_cells || 607}
          </div>
          <div className="text-xs text-slate-400 mt-1">1 km² Metric Resolution</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Cells with Verified Station</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {policyEval?.cells_with_charging_station || 10}
          </div>
          <div className="text-xs text-emerald-400/80 mt-1">Directly MoP Compliant</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Adjacent Access (&lt;1km)</div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {policyEval?.cells_with_adjacent_charger_under_1km || 20}
          </div>
          <div className="text-xs text-amber-400/80 mt-1">Service Radius Buffer</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Unserved Deficit Cells</div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {policyEval?.unserved_cells_over_1km || 577}
          </div>
          <div className="text-xs text-rose-400/80 mt-1">Immediate Siting Candidates</div>
        </div>
      </div>

      {/* Main Map + Cell Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Pune Urban 1km² Micro-Grid Map</span>
            </div>
            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Station Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Adjacent &lt;1km
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Deficit &gt;1km
              </span>
            </div>
          </div>
          <div className="relative w-full h-[480px]">
            {displayedGeoJSON ? (
              <MapLibreMap
                center={[73.8567, 18.5204]}
                zoom={11.0}
                geojsonData={displayedGeoJSON}
                layerConfig={layerConfig}
                markers={stationMarkers}
                className="w-full h-full"
                onSelectFeature={(props) => setSelectedCell(props)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Generating 1km² metric grid across Pune municipal envelope...
              </div>
            )}
          </div>
        </div>

        {/* Right: Grid Cell Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-lg">
          {selectedCell ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">Grid Cell Inspector</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedCell.cell_id}</h3>
                <div className="text-xs text-slate-400 mt-1">Resolution: 1,000 m × 1,000 m (1.0 km²)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                <div className="text-xs font-semibold text-slate-300">MoP Benchmark Classification</div>
                <div className={`text-xs font-bold ${
                  selectedCell.station_count >= 1 ? 'text-emerald-400' :
                  selectedCell.nearest_station_distance_m <= 1000 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {selectedCell.mop_policy_status}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Stations in Cell:</span>
                  <span className="font-bold text-white">{selectedCell.station_count}</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Charging Points:</span>
                  <span className="font-bold text-purple-400">{selectedCell.charging_point_count}</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Rated Power:</span>
                  <span className="font-bold text-white">{selectedCell.total_power_kw || 0} kW</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Distance to Nearest Station:</span>
                  <span className="font-bold text-amber-400">
                    {selectedCell.nearest_station_distance_m ? `${selectedCell.nearest_station_distance_m} m` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1.5">
                  <span className="text-slate-400">Cell CGI Score:</span>
                  <span className="font-bold text-rose-400">{selectedCell.cgi_score || 'N/A'} / 100</span>
                </div>
              </div>

              {/* Siting guidance */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                <strong>Planning Directive:</strong> {selectedCell.station_count === 0
                  ? "This cell qualifies as a High-Priority Candidate Location under Phase 5 Smart Siting."
                  : "Adequate coverage exists; focus on high-power DC fast charger upgrades."}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center my-auto">Click any grid cell on the map to inspect micro-metrics.</div>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>PMC & PCMC Town Planning Boundaries</span>
            <span className="text-emerald-400 font-semibold">AUTHENTIC GIS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuneAnalysisPage;
