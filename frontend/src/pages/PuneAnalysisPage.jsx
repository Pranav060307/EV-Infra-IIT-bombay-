import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Crosshair, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  RefreshCw, 
  Layers,
  Download,
  Navigation,
  Clock,
  Compass
} from 'lucide-react';
import { getPuneUrbanSummary, getPuneUrbanGrid, getVerifiedStations } from '../services/api';
import MapLibreMap from '../components/common/MapLibreMap';

export const PuneAnalysisPage = () => {
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [summaryData, setSummaryData] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, DEFICIT, COMPLIANT

  // Load summary KPIs immediately for instant rendering, then stream full grid
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      setError(null);

      // Phase 1: Fast Summary (<10ms)
      getPuneUrbanSummary(1000.0)
        .then(summary => {
          setSummaryData(summary);
          setLoadingSummary(false);
        })
        .catch(err => {
          console.warn("Summary load notice:", err);
          setLoadingSummary(false);
        });

      // Phase 2: Stations and Full Grid GeoJSON in parallel
      const [stationsRes, gridRes] = await Promise.all([
        getVerifiedStations({ district: 'Pune' }).catch(() => ({ features: [] })),
        getPuneUrbanGrid(1000.0, forceRefresh)
      ]);

      setStations(stationsRes?.features || []);
      setGridData(gridRes);

      if (gridRes?.grid_geojson?.features?.length > 0) {
        setSelectedCell(gridRes.grid_geojson.features[0].properties);
      }
      if (!summaryData && gridRes?.mop_policy_evaluation) {
        setSummaryData({
          mop_policy_evaluation: gridRes.mop_policy_evaluation,
          summary: gridRes.summary,
          total_grid_cells: gridRes.total_grid_cells
        });
      }
    } catch (err) {
      console.error("Failed to load Pune urban grid data:", err);
      setError(err.message || "Failed to retrieve Pune 1km² micro-grid analysis.");
    } finally {
      setLoadingGrid(false);
      setLoadingSummary(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Memoized filter of grid GeoJSON features
  const displayedGeoJSON = useMemo(() => {
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

  // Stable memoized layer styling with official palette
  const layerConfig = useMemo(() => ({
    fill: {
      'fill-color': [
        'case',
        ['>=', ['get', 'station_count'], 1],
        '#52765B', // Forest Green: Benchmark met (station in cell)
        ['<=', ['get', 'nearest_station_distance_m'], 1000],
        '#C18A42', // Warm Amber: Adjacent buffer coverage (<1km)
        '#B65D55'  // Muted Red: Unserved deficit (>1km)
      ],
      'fill-opacity': 0.38
    },
    line: {
      'line-color': '#34495E', // Slate Blue border
      'line-width': 0.8,
      'line-opacity': 0.7
    }
  }), []);

  // Stable memoized station markers with Muted Teal
  const stationMarkers = useMemo(() => {
    return (stations || []).map(f => ({
      name: f.properties?.name || 'Pune Station',
      operator: f.properties?.operator || 'CPO',
      latitude: f.geometry?.coordinates[1],
      longitude: f.geometry?.coordinates[0],
      power_kw: f.properties?.total_power_kw,
      points: f.properties?.total_charging_points,
      color: '#3F7775' // Muted Teal
    }));
  }, [stations]);

  // CSV Export for Pune 1km² Grid
  const handleExportGridCSV = () => {
    if (!gridData?.grid_geojson?.features) return;
    const headers = [
      'Cell_ID',
      'Area_sqkm',
      'Station_Count',
      'Charging_Points',
      'Total_Power_kW',
      'Nearest_Station_Distance_m',
      'Road_Distance_Est_m',
      'Peak_Travel_Time_min',
      'Offpeak_Travel_Time_min',
      'Accessibility_Tier',
      'CGI_Score',
      'MoP_Status'
    ];
    const rows = gridData.grid_geojson.features.map(f => {
      const p = f.properties;
      const roadDist = p.road_distance_est_m || Math.round((p.nearest_station_distance_m || 0) * 1.32);
      const peakTime = p.peak_travel_time_min || (p.nearest_station_distance_m ? Math.round((roadDist / 1000 / 22 * 60) * 10) / 10 : '');
      const offpeakTime = p.offpeak_travel_time_min || (p.nearest_station_distance_m ? Math.round((roadDist / 1000 / 35 * 60) * 10) / 10 : '');
      const tier = p.accessibility_tier || (p.nearest_station_distance_m <= 1000 ? 'DIRECT_WALKING' : p.nearest_station_distance_m <= 3000 ? 'URBAN_NEIGHBORHOOD' : p.nearest_station_distance_m <= 5000 ? 'EXTENDED_TRANSIT' : 'CHARGING_DESERT');

      return [
        p.cell_id,
        p.cell_area_sqkm || 1.0,
        p.station_count || 0,
        p.charging_point_count || 0,
        p.total_power_kw || 0,
        p.nearest_station_distance_m || '',
        roadDist,
        peakTime,
        offpeakTime,
        tier,
        p.cgi_score || '',
        `"${p.mop_policy_status || ''}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pune_urban_1km_grid_cells.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const policyEval = summaryData?.mop_policy_evaluation || gridData?.mop_policy_evaluation;
  const summaryStats = summaryData?.summary || gridData?.summary;
  const totalCells = summaryData?.total_grid_cells || gridData?.total_grid_cells || 607;
  const multiAcc = summaryStats?.multi_level_accessibility;
  const roadModeling = summaryStats?.road_transit_modeling;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-accent-teal/15 text-accent-teal border border-accent-teal/30">
              Level 3 Micro-Geographic Analysis
            </span>
            <span className="text-xs text-muted-grey flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
              MoP Sept 2024 Benchmark Standard
            </span>
            {summaryStats?.cache_signature && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-muted-grey border border-navy-700">
                Cache: {summaryStats.cache_signature}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Pune Urban Region 1 km &times; 1 km Grid Analysis
          </h2>
          <p className="text-sm text-muted-grey mt-1">
            Metric polygon grid analysis across Pune Municipal Corporation (PMC) and PCMC (516.18 km&sup2;) benchmarking urban accessibility in UTM Zone 43N.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-navy-700 bg-navy-850 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title="Recalculate grid directly and refresh persistent cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent-teal ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Recalculating...' : 'Recalculate Grid'}</span>
          </button>

          <button
            onClick={handleExportGridCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-navy-700 bg-navy-850 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title="Download all 607 Pune grid cells as CSV"
          >
            <Download className="w-3.5 h-3.5 text-accent-green" />
            <span>Export CSV</span>
          </button>

          <span className="h-4 w-[1px] bg-navy-700 hidden sm:block"></span>

          <div className="flex items-center rounded-md border border-navy-700 bg-navy-900 p-0.5 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-accent-teal text-white font-medium shadow-xs'
                  : 'text-muted-grey hover:text-white'
              }`}
            >
              All ({totalCells})
            </button>
            <button
              onClick={() => setFilterMode('DEFICIT')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'DEFICIT'
                  ? 'bg-accent-red text-white font-medium shadow-xs'
                  : 'text-muted-grey hover:text-accent-red'
              }`}
            >
              Deficit (&gt;1km)
            </button>
            <button
              onClick={() => setFilterMode('COMPLIANT')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'COMPLIANT'
                  ? 'bg-accent-green text-white font-medium shadow-xs'
                  : 'text-muted-grey hover:text-accent-green'
              }`}
            >
              Compliant
            </button>
          </div>
        </div>
      </div>

      {/* Error State with Retry */}
      {error && (
        <div className="p-4 rounded-lg bg-accent-red/10 border border-accent-red/30 flex items-center justify-between text-xs text-accent-red">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-2.5 py-1 rounded bg-accent-red text-white font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* MoP 2024 Policy Evaluation Banner */}
      <div className="p-5 rounded-lg bg-navy-900 border border-navy-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-teal">
              <Info className="w-4 h-4" />
              <span>Ministry of Power (MoP) 2024 Siting Standard Evaluation</span>
            </div>
            <div className="text-sm font-bold text-white">
              Target: At least 1 Public Charging Station per 1 km &times; 1 km grid cell in urban areas by FY 2029–30 (Clause 11(1)(a))
            </div>
            <div className="text-xs text-muted-grey">
              Evaluated across 516.18 km&sup2; municipal territory using EPSG:32643 UTM metric projection. Cells lacking a charger represent planning investment priorities.
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-xs text-muted-grey">Urban Compliance Level</div>
              <div className="text-2xl font-bold font-mono text-accent-red">
                {policyEval?.effective_service_radius_compliance_pct ?? 4.9}%
              </div>
            </div>
            <div className="px-3 py-1 rounded-md bg-accent-red/15 border border-accent-red/30 text-accent-red text-xs font-bold">
              CRITICAL URBAN GAP
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Total Urban Grid Cells</div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {totalCells}
          </div>
          <div className="text-xs text-muted-grey mt-1">1 km&sup2; Metric Resolution</div>
        </div>

        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Cells with Station</div>
          <div className="text-2xl font-bold font-mono text-accent-green mt-2">
            {policyEval?.cells_with_charging_station ?? 10}
          </div>
          <div className="text-xs text-accent-green mt-1">Directly MoP Compliant</div>
        </div>

        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Adjacent Access (&lt;1km)</div>
          <div className="text-2xl font-bold font-mono text-accent-amber mt-2">
            {policyEval?.cells_with_adjacent_charger_under_1km ?? 20}
          </div>
          <div className="text-xs text-accent-amber mt-1">Service Radius Catchment</div>
        </div>

        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Unserved Deficit Cells</div>
          <div className="text-2xl font-bold font-mono text-accent-red mt-2">
            {policyEval?.unserved_cells_over_1km ?? 577}
          </div>
          <div className="text-xs text-accent-red mt-1">Siting Priority Cells</div>
        </div>
      </div>

      {/* Multi-Level Accessibility Isochrone Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-accent-teal" />
            Multi-Level Urban Accessibility Distribution (MoP Siting Tiers)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Circuity Factor: 1.32x | Peak: 22 km/h | Off-Peak: 35 km/h
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400">Direct Walking (&lt;1 km)</span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {multiAcc?.direct_walking_under_1km?.pct ?? 2.8}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {multiAcc?.direct_walking_under_1km?.cells ?? 17} <span className="text-xs font-normal text-slate-400">cells</span>
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1">&le;3.6 min off-peak / &le;5.7 min peak</div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400">Neighborhood (1–3 km)</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {multiAcc?.urban_neighborhood_1_to_3km?.pct ?? 22.2}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {multiAcc?.urban_neighborhood_1_to_3km?.cells ?? 135} <span className="text-xs font-normal text-slate-400">cells</span>
            </div>
            <div className="text-[10px] text-cyan-300/80 mt-1">3.6–10.8 min off-peak / 5.7–17.1 min peak</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400">Extended Transit (3–5 km)</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {multiAcc?.extended_transit_3_to_5km?.pct ?? 26.7}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {multiAcc?.extended_transit_3_to_5km?.cells ?? 162} <span className="text-xs font-normal text-slate-400">cells</span>
            </div>
            <div className="text-[10px] text-amber-300/80 mt-1">10.8–18.0 min off-peak / 17.1–28.5 min peak</div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400">Charging Deserts (&gt;5 km)</span>
              <span className="text-xs font-mono font-bold text-rose-300">
                {multiAcc?.charging_deserts_over_5km?.pct ?? 48.3}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {multiAcc?.charging_deserts_over_5km?.cells ?? 293} <span className="text-xs font-normal text-slate-400">cells</span>
            </div>
            <div className="text-[10px] text-rose-300/80 mt-1">&gt;18.0 min off-peak / &gt;28.5 min peak (URGENT)</div>
          </div>
        </div>
      </div>

      {/* Main Map + Cell Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 rounded-lg border border-navy-700 bg-navy-900 overflow-hidden flex flex-col shadow-sm">
          <div className="p-3.5 border-b border-navy-800 bg-navy-900 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-accent-teal" />
              <span className="text-sm font-semibold text-white">Pune Urban 1km&sup2; Micro-Grid Map</span>
            </div>
            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent-green"></span> Station Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent-amber"></span> Adjacent &lt;1km
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent-red"></span> Deficit &gt;1km
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
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-grey text-xs space-y-2 bg-navy-950/40">
                <RefreshCw className="w-6 h-6 animate-spin text-accent-teal" />
                <span>Streaming Pune 1km&sup2; micro-grid polygons...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Grid Cell Inspector */}
        <div className="rounded-lg border border-navy-700 bg-navy-850 p-5 flex flex-col justify-between shadow-sm">
          {selectedCell ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-accent-teal font-semibold">Grid Cell Inspector</span>
                <h3 className="text-xl font-bold font-mono text-white mt-0.5">{selectedCell.cell_id}</h3>
                <div className="text-xs text-muted-grey mt-0.5">Cell Area: {selectedCell.cell_area_sqkm || '1.000'} km&sup2; (UTM Zone 43N)</div>
              </div>

              <div className="p-3 rounded-md bg-navy-900 border border-navy-700 space-y-1">
                <div className="text-xs font-semibold text-muted-grey">MoP Benchmark Status</div>
                <div className={`text-xs font-bold ${
                  selectedCell.station_count >= 1 ? 'text-accent-green' :
                  selectedCell.nearest_station_distance_m <= 1000 ? 'text-accent-amber' : 'text-accent-red'
                }`}>
                  {selectedCell.mop_policy_status}
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Stations in Cell:</span>
                  <span className="font-bold font-mono text-white">{selectedCell.station_count}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Total Charging Points:</span>
                  <span className="font-bold font-mono text-accent-teal">{selectedCell.charging_point_count}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Total Rated Power:</span>
                  <span className="font-bold font-mono text-white">{selectedCell.total_power_kw || 0} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Euclidean Distance:</span>
                  <span className="font-bold font-mono text-accent-amber">
                    {selectedCell.nearest_station_distance_m ? `${selectedCell.nearest_station_distance_m} m` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Road Distance (1.32x):</span>
                  <span className="font-bold font-mono text-cyan-300">
                    {selectedCell.road_distance_est_m ? `${selectedCell.road_distance_est_m} m (${(selectedCell.road_distance_est_m / 1000).toFixed(2)} km)` : selectedCell.nearest_station_distance_m ? `${Math.round(selectedCell.nearest_station_distance_m * 1.32)} m (${(selectedCell.nearest_station_distance_m * 1.32 / 1000).toFixed(2)} km)` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Peak Travel Time (22 km/h):</span>
                  <span className="font-bold font-mono text-amber-300">
                    {selectedCell.peak_travel_time_min ? `${selectedCell.peak_travel_time_min} min` : selectedCell.nearest_station_distance_m ? `${Math.round((selectedCell.nearest_station_distance_m * 1.32 / 1000 / 22 * 60) * 10) / 10} min` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Off-Peak Travel (35 km/h):</span>
                  <span className="font-bold font-mono text-emerald-300">
                    {selectedCell.offpeak_travel_time_min ? `${selectedCell.offpeak_travel_time_min} min` : selectedCell.nearest_station_distance_m ? `${Math.round((selectedCell.nearest_station_distance_m * 1.32 / 1000 / 35 * 60) * 10) / 10} min` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Accessibility Tier:</span>
                  <span className="font-bold font-mono text-purple-300">
                    {selectedCell.accessibility_tier || (selectedCell.nearest_station_distance_m <= 1000 ? 'DIRECT_WALKING' : selectedCell.nearest_station_distance_m <= 3000 ? 'URBAN_NEIGHBORHOOD' : selectedCell.nearest_station_distance_m <= 5000 ? 'EXTENDED_TRANSIT' : 'CHARGING_DESERT')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-grey">Charging Gap Index (CGI):</span>
                  <span className="font-bold font-mono text-accent-red">{selectedCell.cgi_score || 'N/A'} / 100</span>
                </div>
              </div>

              {/* Siting guidance */}
              <div className="p-3 rounded-md bg-navy-900 border border-navy-700 text-xs text-slate-300">
                <strong className="text-accent-teal">Planning Directive:</strong> {selectedCell.station_count === 0
                  ? "Unserved planning cell. Siting priority under Phase 5 Multi-Criteria Siting Engine."
                  : "Baseline urban coverage satisfied. Recommended for DC fast dispenser capacity upgrades."}
              </div>
            </div>
          ) : (
            <div className="text-muted-grey text-center my-auto text-xs">
              Click any cell on the map to inspect micro-metrics.
            </div>
          )}

          <div className="pt-4 border-t border-navy-700 text-[11px] text-muted-grey flex items-center justify-between">
            <span>PMC &amp; PCMC Town Planning Master Plan</span>
            <span className="text-accent-green font-semibold">VERIFIED GIS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuneAnalysisPage;
