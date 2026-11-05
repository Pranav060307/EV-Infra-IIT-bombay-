import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Milestone, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  Layers, 
  Maximize2, 
  Search,
  RefreshCw,
  Download,
  Timer,
  Gauge,
  Compass,
  AlertCircle
} from 'lucide-react';
import { getSamruddhiCorridor } from '../services/api';
import MapLibreMap from '../components/common/MapLibreMap';

export const SamruddhiPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [corridorData, setCorridorData] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedInterchange, setSelectedInterchange] = useState(null);
  const [searchChainage, setSearchChainage] = useState('');
  
  // Layer Toggles
  const [layerVisibility, setLayerVisibility] = useState({
    buffer: true,
    stations: true,
    interchanges: true
  });

  const [mapCenter, setMapCenter] = useState([76.242, 20.155]);
  const [mapZoom, setMapZoom] = useState(7.2);

  const loadCorridor = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      setError(null);

      const cData = await getSamruddhiCorridor(20.0, forceRefresh);
      setCorridorData(cData);

      if (cData?.segments_analysis?.length > 0) {
        setSelectedSegment(cData.segments_analysis[0]);
      }
      if (cData?.interchanges?.length > 0) {
        setSelectedInterchange(cData.interchanges[0]);
      }
    } catch (err) {
      console.error("Failed to load Samruddhi corridor data:", err);
      setError(err.message || "Failed to retrieve Samruddhi Mahamarg corridor analysis.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCorridor(false);
  }, [loadCorridor]);

  // Filter segments by chainage search
  const filteredSegments = useMemo(() => {
    if (!corridorData?.segments_analysis) return [];
    if (!searchChainage.trim()) return corridorData.segments_analysis;
    const q = searchChainage.toLowerCase().trim();
    return corridorData.segments_analysis.filter(seg => 
      seg.chainage_range.toLowerCase().includes(q) || String(seg.segment_index).includes(q)
    );
  }, [corridorData, searchChainage]);

  // Buffer style with official Warm Amber
  const layerConfig = useMemo(() => {
    if (!layerVisibility.buffer) return null;
    return {
      fill: {
        'fill-color': '#C18A42', // Warm Amber buffer
        'fill-opacity': 0.14
      },
      line: {
        'line-color': '#C18A42',
        'line-width': 1.5,
        'line-opacity': 0.8
      }
    };
  }, [layerVisibility.buffer]);

  // Memoized markers
  const markers = useMemo(() => {
    const m = [];

    // Wayside charging stations
    if (layerVisibility.stations && corridorData?.verified_stations) {
      corridorData.verified_stations.forEach(st => {
        m.push({
          station_id: st.station_id,
          name: st.name,
          operator: `${st.operator} | Chainage: ${st.chainage_km} km`,
          latitude: st.latitude,
          longitude: st.longitude,
          power_kw: st.total_power_kw,
          points: st.total_charging_points,
          color: '#52765B' // Forest Green
        });
      });
    }

    // Interchanges
    if (layerVisibility.interchanges && corridorData?.interchanges) {
      corridorData.interchanges.forEach(ic => {
        m.push({
          station_id: `IC-${ic.chainage_km}`,
          name: `${ic.name} (Chainage: ${ic.chainage_km} km)`,
          operator: `District: ${ic.district} | Substation: ${ic.substation_nearby ? 'Grid Feasible' : 'Pending'}`,
          latitude: ic.lat,
          longitude: ic.lon,
          color: '#3F7775' // Muted Teal
        });
      });
    }

    return m;
  }, [corridorData, layerVisibility]);

  // CSV Export for Samruddhi Corridor Segments
  const handleExportCorridorCSV = () => {
    if (!corridorData?.segments_analysis) return;
    const headers = [
      'Segment_Index',
      'Chainage_Range',
      'Start_km',
      'End_km',
      'Stations_Count',
      'Nearest_Station_km',
      'Heavy_Duty_240kW',
      'MoP_Compliance',
      'Directional_Carriageway_Access'
    ];
    const rows = corridorData.segments_analysis.map(s => [
      s.segment_index,
      `"${s.chainage_range}"`,
      s.start_km,
      s.end_km,
      s.stations_count,
      s.nearest_station_km !== null ? s.nearest_station_km : '',
      `"${s.heavy_duty_fast_charging_compliance || ''}"`,
      `"${s.mop_compliance || ''}"`,
      `"${s.directional_carriageway_compliance || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'samruddhi_20km_segments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetCorridorView = () => {
    setMapCenter([76.242, 20.155]);
    setMapZoom(7.2);
  };

  const policyEval = corridorData?.policy_provisions_evaluation;
  const compliance20km = policyEval?.provision_1_spacing_20km?.compliance_percentage ?? 27.3;
  const deficitSegmentsCount = policyEval?.provision_1_spacing_20km?.deficit_segments ?? 24;
  const transitMetrics = corridorData?.expressway_travel_metrics;
  const bufferSens = corridorData?.lateral_buffer_sensitivity;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-accent-amber/15 text-accent-amber border border-accent-amber/30">
              Level 3 Highway Corridor Analysis
            </span>
            <span className="text-xs text-muted-grey flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
              Official MSRDC Alignment (701 km)
            </span>
            {corridorData?.cache_signature && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-muted-grey border border-navy-700">
                Cache: {corridorData.cache_signature}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Samruddhi Mahamarg Expressway Spacing &amp; Gap Analysis
          </h2>
          <p className="text-sm text-muted-grey mt-1">
            Corridor evaluation: wayside charging proximity, bidirectional carriageway gaps, and 20 km / 100 km MoP norm compliance across UTM Zones 43N &amp; 44N.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadCorridor(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-navy-700 bg-navy-850 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent-teal ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Recalculating...' : 'Recalculate'}</span>
          </button>
          <button
            onClick={handleExportCorridorCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-navy-700 bg-navy-850 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title="Download Samruddhi 20km segments audit as CSV"
          >
            <Download className="w-3.5 h-3.5 text-accent-green" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleResetCorridorView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-navy-700 bg-navy-850 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-accent-amber" />
            <span>Reset Extent</span>
          </button>
        </div>
      </div>

      {/* Engineering Disclosure Banner */}
      <div className="p-3.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-accent-amber">
          <Info className="w-4 h-4" />
          <span>Geodetic Alignment &amp; Carriageway Provenance Disclosure</span>
        </div>
        <p className="text-muted-grey leading-relaxed">
          <strong>Route Geometry vs Statutory Length:</strong> MSRDC statutory length is <strong>701.0 km</strong> from Shivmadka (Nagpur) to Amane (Thane). The GIS vector alignment connecting the 17 interchange nodes measures <strong>644.4 km</strong> due to chord simplification across curves and ghat sectors. Directional carriageway data is preserved as unverified where independent north/south bound separation is not disclosed in CPO records.
        </p>
      </div>

      {/* MoP 2024 Highway Benchmark Banner */}
      <div className="p-5 rounded-lg bg-navy-900 border border-navy-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-amber">
              <Info className="w-4 h-4" />
              <span>Ministry of Power Guidelines (17 Sept 2024) — Highway Mandates</span>
            </div>
            <div className="text-sm font-bold text-white">
              Standard: Charging station every 20 km on both sides (Clause 11(1)(b)) &amp; Fast-charging station every 100 km for heavy duty/long range with &ge;2 chargers of min 240 kW each (Clause 11(1)(c) read with Clause 12(7))
            </div>
            <div className="text-xs text-muted-grey">
              Evaluated across 33 consecutive 20 km segments within a 20.0 km bilateral metric buffer.
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-xs text-muted-grey">20km Spacing Compliance</div>
              <div className="text-2xl font-bold font-mono text-accent-amber">
                {compliance20km}%
              </div>
            </div>
            <div className="px-3 py-1 rounded-md bg-accent-amber/15 border border-accent-amber/30 text-accent-amber text-xs font-bold">
              PARTIALLY SERVED
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Statutory Length</div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            701.0 <span className="text-xs font-normal text-muted-grey">km</span>
          </div>
          <div className="text-xs text-muted-grey mt-1">Geodetic Centerline: 644.4 km</div>
        </div>

        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Wayside Charging Hubs</div>
          <div className="text-2xl font-bold font-mono text-accent-green mt-2">
            {corridorData?.total_stations_in_buffer ?? 10}
          </div>
          <div className="text-xs text-accent-green mt-1">Verified In-Buffer Facilities</div>
        </div>

        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Surveyed Interchanges</div>
          <div className="text-2xl font-bold font-mono text-accent-teal mt-2">
            {corridorData?.interchanges?.length ?? 17}
          </div>
          <div className="text-xs text-muted-grey mt-1">17 Operational Plazas</div>
        </div>

        <div className="p-4 rounded-lg bg-navy-850 border border-navy-700">
          <div className="text-xs font-semibold text-muted-grey uppercase">Critical 20km Gaps</div>
          <div className="text-2xl font-bold font-mono text-accent-red mt-2">
            {deficitSegmentsCount}
          </div>
          <div className="text-xs text-accent-red mt-1">Washim &amp; Buldhana Sectors</div>
        </div>
      </div>

      {/* Expressway Transit Modeling & Buffer Sensitivity Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-navy-850 border border-navy-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent-amber flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              Expressway Transit Duration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-amber/15 text-accent-amber">
              120 km/h DESIGN
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {transitMetrics?.total_transit_time_hours ?? 5.37} <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Calculated transit time from Shivmadka (Nagpur) to Amane (Thane) at statutory expressway cruising speed.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Longest Unserved Mainline Void
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
              0 MAINLINE CHARGERS
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {transitMetrics?.longest_unserved_stretch_km ?? 701.0} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <p className="text-[11px] text-rose-200/80 leading-snug">
            <strong>Critical Finding:</strong> 0 chargers directly on mainline carriageway. EV drivers must exit at interchanges to access municipal chargers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-navy-850 border border-navy-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent-teal flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Lateral Buffer Sensitivity
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-teal/15 text-accent-teal">
              CATCHMENT RADIUS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 rounded bg-navy-900 border border-navy-700">
              <div className="text-[10px] text-slate-400">5 km Buffer</div>
              <div className="text-lg font-bold font-mono text-accent-green">{bufferSens?.stations_within_5km ?? 9}</div>
            </div>
            <div className="p-2 rounded bg-navy-900 border border-navy-700">
              <div className="text-[10px] text-slate-400">10 km Buffer</div>
              <div className="text-lg font-bold font-mono text-accent-green">{bufferSens?.stations_within_10km ?? 9}</div>
            </div>
            <div className="p-2 rounded bg-navy-900 border border-navy-700">
              <div className="text-[10px] text-slate-400">20 km Buffer</div>
              <div className="text-lg font-bold font-mono text-accent-amber">{bufferSens?.stations_within_20km ?? 10}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map + Segment Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 rounded-lg border border-navy-700 bg-navy-900 overflow-hidden flex flex-col shadow-sm">
          <div className="p-3.5 border-b border-navy-800 bg-navy-900 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Milestone className="w-4 h-4 text-accent-amber" />
              <span className="text-sm font-semibold text-white">Expressway 701km Corridor Map</span>
            </div>

            {/* Layer Visibility Controls */}
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.buffer}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, buffer: e.target.checked })}
                  className="rounded bg-navy-800 border-navy-700 text-accent-amber focus:ring-0"
                />
                <span>20km Buffer</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.stations}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, stations: e.target.checked })}
                  className="rounded bg-navy-800 border-navy-700 text-accent-green focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-green"></span> Chargers
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.interchanges}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, interchanges: e.target.checked })}
                  className="rounded bg-navy-800 border-navy-700 text-accent-teal focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-teal"></span> Interchanges
                </span>
              </label>
            </div>
          </div>

          <div className="relative w-full h-[500px]">
            {corridorData?.buffer_geojson ? (
              <MapLibreMap
                center={mapCenter}
                zoom={mapZoom}
                geojsonData={layerVisibility.buffer ? corridorData.buffer_geojson : null}
                layerConfig={layerConfig}
                markers={markers}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-grey text-xs space-y-2 bg-navy-950/40">
                <RefreshCw className="w-6 h-6 animate-spin text-accent-amber" />
                <span>Streaming Samruddhi Mahamarg corridor alignment and buffer...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Segment Inspector */}
        <div className="rounded-lg border border-navy-700 bg-navy-850 p-5 flex flex-col justify-between shadow-sm space-y-4">
          {selectedSegment ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-accent-amber font-semibold">20 km Segment Inspector</span>
                <h3 className="text-xl font-bold font-mono text-white mt-0.5">Chainage {selectedSegment.chainage_range}</h3>
                <div className="text-xs text-muted-grey mt-0.5">Segment #{selectedSegment.segment_index} of 33</div>
              </div>

              <div className="p-3 rounded-md bg-navy-900 border border-navy-700 space-y-1">
                <div className="text-xs font-semibold text-muted-grey">MoP 2024 Highway Compliance</div>
                <div className={`text-xs font-bold ${
                  selectedSegment.mop_compliance === 'COMPLIANT' ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {selectedSegment.mop_compliance}
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Chargers in 20km Section:</span>
                  <span className="font-bold font-mono text-white">{selectedSegment.stations_count}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">Distance to Nearest Charger:</span>
                  <span className={`font-bold font-mono ${
                    selectedSegment.nearest_station_km <= 20 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {selectedSegment.nearest_station_km !== null ? `${selectedSegment.nearest_station_km} km` : 'None in Catchment'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-700">
                  <span className="text-muted-grey">240kW Heavy-Duty (Cl. 12(7)):</span>
                  <span className={`font-bold ${
                    selectedSegment.has_240kw ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {selectedSegment.has_240kw ? 'COMPLIANT' : 'DEFICIT (0x 240kW)'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-navy-900 border border-navy-700 text-xs text-slate-300">
                <strong className="text-accent-amber">Corridor Directive:</strong> {selectedSegment.mop_compliance === 'COMPLIANT'
                  ? "Meets 20km spacing criteria. Recommended for dual-carriageway capacity augmentation."
                  : "Critical 20km expressway gap. Priority candidate location for interchange wayside charging development."}
              </div>
            </div>
          ) : (
            <div className="text-muted-grey text-center my-auto text-xs">Select a segment from the audit table below.</div>
          )}

          {/* Quick Interchanges List */}
          <div className="pt-3 border-t border-navy-700">
            <div className="text-[11px] font-semibold uppercase text-muted-grey mb-2">Interchange Waypoints (17 Total)</div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {corridorData?.interchanges?.map(ic => (
                <div
                  key={ic.chainage_km}
                  onClick={() => {
                    setSelectedInterchange(ic);
                    setMapCenter([ic.lon, ic.lat]);
                    setMapZoom(11.0);
                  }}
                  className={`p-2 rounded-md border cursor-pointer transition-colors ${
                    selectedInterchange?.chainage_km === ic.chainage_km
                      ? 'bg-accent-teal/20 border-accent-teal text-white'
                      : 'bg-navy-900 border-navy-700 text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <div className="font-semibold text-white">{ic.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-muted-grey mt-0.5">
                    <span>Km {ic.chainage_km} ({ic.district})</span>
                    <span className={ic.substation_nearby ? 'text-accent-green' : 'text-muted-grey'}>
                      {ic.substation_nearby ? 'Grid Feasible' : 'No Substation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 20km Segment Gap Table */}
      <div className="rounded-lg border border-navy-700 bg-navy-850 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-navy-700 bg-navy-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Corridor 20km Spacing Benchmark Audit Table</h3>
            <p className="text-xs text-muted-grey mt-0.5">Consecutive 20km intervals from Nagpur (0 km) to Thane (701 km)</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-grey" />
              <input
                type="text"
                placeholder="Search chainage..."
                value={searchChainage}
                onChange={(e) => setSearchChainage(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md bg-navy-950 border border-navy-700 text-xs text-white placeholder-muted-grey focus:outline-none focus:border-accent-amber"
              />
            </div>
            <button
              onClick={handleExportCorridorCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-navy-700 bg-navy-900 text-slate-300 hover:text-white transition-colors"
              title="Export 20km corridor segments table as CSV"
            >
              <Download className="w-3.5 h-3.5 text-accent-teal" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 text-muted-grey font-semibold uppercase tracking-wider border-b border-navy-700">
              <tr>
                <th className="py-2.5 px-4">Segment</th>
                <th className="py-2.5 px-4">Chainage Range</th>
                <th className="py-2.5 px-4">Wayside Stations</th>
                <th className="py-2.5 px-4">Nearest Station</th>
                <th className="py-2.5 px-4">240kW Heavy Duty</th>
                <th className="py-2.5 px-4">MoP 2024 Status</th>
                <th className="py-2.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-750 text-slate-300">
              {filteredSegments.map((seg) => (
                <tr
                  key={seg.segment_index}
                  onClick={() => setSelectedSegment(seg)}
                  className={`hover:bg-navy-800 cursor-pointer transition-colors ${
                    selectedSegment?.segment_index === seg.segment_index ? 'bg-accent-amber/15' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-bold font-mono text-white">#{seg.segment_index}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-200">{seg.chainage_range}</td>
                  <td className="py-2.5 px-4 font-semibold font-mono text-accent-green">{seg.stations_count}</td>
                  <td className="py-2.5 px-4 font-mono">
                    {seg.nearest_station_km !== null ? `${seg.nearest_station_km} km` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-4">
                    {seg.heavy_duty_fast_charging_compliance?.includes('COMPLIANT') ? (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-accent-green/15 text-accent-green font-semibold">
                        &ge;240 kW
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-navy-900 text-muted-grey border border-navy-700">
                        0x 240kW
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      seg.mop_compliance === 'COMPLIANT'
                        ? 'bg-accent-green/15 text-accent-green'
                        : 'bg-accent-red/15 text-accent-red'
                    }`}>
                      {seg.mop_compliance}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <ChevronRight className="w-4 h-4 text-muted-grey inline-block" />
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

export default SamruddhiPage;
