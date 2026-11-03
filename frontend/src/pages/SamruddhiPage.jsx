import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { getSamruddhiCorridor, getPolicyCompliance } from '../services/api';
import MapLibreMap from '../components/common/MapLibreMap';

export const SamruddhiPage = () => {
  const [loading, setLoading] = useState(true);
  const [corridorData, setCorridorData] = useState(null);
  const [policyEval, setPolicyEval] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedInterchange, setSelectedInterchange] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchChainage, setSearchChainage] = useState('');
  
  // Layer Toggles
  const [layerVisibility, setLayerVisibility] = useState({
    buffer: true,
    stations: true,
    interchanges: true
  });

  const [mapCenter, setMapCenter] = useState([76.242, 20.155]);
  const [mapZoom, setMapZoom] = useState(7.2);

  useEffect(() => {
    const fetchCorridorData = async () => {
      try {
        setLoading(true);
        const [corridorRes, policyRes] = await Promise.allSettled([
          getSamruddhiCorridor(20.0),
          getPolicyCompliance()
        ]);
        if (corridorRes.status === 'fulfilled') {
          const cData = corridorRes.value;
          setCorridorData(cData);
          if (cData?.policy_compliance_evaluation) {
            setPolicyEval(cData.policy_compliance_evaluation);
          }
          if (cData?.segments_analysis?.length > 0) {
            setSelectedSegment(cData.segments_analysis[0]);
          }
          if (cData?.interchanges?.length > 0) {
            setSelectedInterchange(cData.interchanges[0]);
          }
        }
        if (policyRes.status === 'fulfilled' && !corridorData?.policy_compliance_evaluation) {
          setPolicyEval(prev => prev || policyRes.value?.expressway_evaluation);
        }
      } catch (err) {
        console.error("Failed to load Samruddhi corridor data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCorridorData();
  }, []);

  // Filter segments by chainage search
  const filteredSegments = corridorData?.segments_analysis?.filter(seg => {
    if (!searchChainage) return true;
    return seg.chainage_range.includes(searchChainage) || String(seg.segment_index).includes(searchChainage);
  }) || [];

  // Buffer style
  const layerConfig = layerVisibility.buffer ? {
    fill: {
      'fill-color': '#f59e0b',
      'fill-opacity': 0.14
    },
    line: {
      'line-color': '#d97706',
      'line-width': 2,
      'line-opacity': 0.8
    }
  } : null;

  // Station and interchange markers
  const markers = React.useMemo(() => {
    const m = [];

    // Wayside charging stations
    if (layerVisibility.stations && corridorData?.verified_stations) {
      corridorData.verified_stations.forEach(st => {
        m.push({
          name: st.name,
          operator: `${st.operator} | Chainage: ${st.chainage_km} km`,
          latitude: st.latitude,
          longitude: st.longitude,
          power_kw: st.total_power_kw,
          points: st.total_charging_points,
          color: '#10b981' // Green for active charger
        });
      });
    }

    // Interchanges
    if (layerVisibility.interchanges && corridorData?.interchanges) {
      corridorData.interchanges.forEach(ic => {
        m.push({
          name: `${ic.name} (Chainage: ${ic.chainage_km} km)`,
          operator: `District: ${ic.district} | Substation: ${ic.substation_nearby ? 'Grid Feasible' : 'Pending'}`,
          latitude: ic.lat,
          longitude: ic.lon,
          color: '#3b82f6' // Blue for interchange
        });
      });
    }

    return m;
  }, [corridorData, layerVisibility]);

  // Reset map view to full 701km corridor
  const handleResetCorridorView = () => {
    setMapCenter([76.242, 20.155]);
    setMapZoom(7.2);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Level 3 Highway Corridor Analysis
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Official MSRDC Expressway Alignment (701 km)
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Samruddhi Mahamarg Expressway Spacing & Gap Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Highway corridor evaluation: station proximity, bidirectional carriageway gaps, and 20 km / 100 km MoP norm compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetCorridorView}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Corridor Extent</span>
          </button>
        </div>
      </div>

      {/* Reconciled Data & Engineering Disclosure Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <Info className="w-4 h-4" />
          <span>Data Provenance & Geometrical Reconciliation Notice</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          <strong>Route Geometry vs Statutory Length:</strong> MSRDC statutory project length is <strong>701.0 km</strong> from Shivmadka (Nagpur) to Amane (Thane). The GIS vector centerline connecting the 17 surveyed interchange nodes measures <strong>644.4 km</strong> due to chord simplification across curves and ghat sectors.
          Directional carriageway data is preserved as unverified where separate north/south bounds are not explicitly exposed.
        </p>
      </div>

      {/* MoP 2024 Highway Benchmark Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900/40 border border-amber-500/20 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Info className="w-4 h-4" />
              <span>Ministry of Power Guidelines (17 Sept 2024) — Highway Mandates</span>
            </div>
            <div className="text-sm font-bold text-white">
              Standard: Charging station every 20 km on both sides (Clause 11(1)(b)) &amp; Fast-charging station every 100 km for heavy duty/long range with &ge;2 chargers of min 240 kW each (Clause 11(1)(c) read with Clause 12(7))
            </div>
            <div className="text-xs text-slate-400">
              Evaluated across 33 consecutive 20 km segments within a 20.0 km bilateral metric buffer.
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400">Corridor 20km Spacing Compliance</div>
              <div className="text-2xl font-black text-amber-400">
                {corridorData?.corridor_compliance_percentage || 27.3}%
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              PARTIALLY SERVED
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Expressway Statutory Length</div>
          <div className="text-2xl font-bold text-white mt-2">
            701.0 <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">GIS Centerline (17 Nodes): 644.4 km</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Wayside Charging Hubs</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {corridorData?.total_stations_in_buffer || 8}
          </div>
          <div className="text-xs text-emerald-400/80 mt-1">8 Verified Operational | 2 Planned</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Surveyed Interchanges</div>
          <div className="text-2xl font-bold text-cyan-400 mt-2">
            {corridorData?.interchanges?.length || 17}
          </div>
          <div className="text-xs text-cyan-400/80 mt-1">17 Operational Plazas (24 Planned)</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Critical 20km Gap Segments</div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {policyEval?.deficit_segments_gap || 24}
          </div>
          <div className="text-xs text-rose-400/80 mt-1">Washim &amp; Buldhana Agrarian Stretches</div>
        </div>
      </div>

      {/* Main Map + Segment Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Milestone className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Expressway 701km Corridor Map</span>
            </div>

            {/* Layer Visibility Controls */}
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={layerVisibility.buffer}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, buffer: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>20km Buffer</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={layerVisibility.stations}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, stations: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Chargers
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={layerVisibility.interchanges}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, interchanges: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Interchanges
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
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Loading Samruddhi Mahamarg corridor alignment and buffer...
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Segment Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-lg space-y-4">
          {selectedSegment ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">20 km Segment Inspector</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Chainage {selectedSegment.chainage_range}</h3>
                <div className="text-xs text-slate-400 mt-1">Segment #{selectedSegment.segment_index} of 33</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                <div className="text-xs font-semibold text-slate-300">MoP 2024 Highway Compliance</div>
                <div className={`text-xs font-bold ${
                  selectedSegment.mop_compliance === 'COMPLIANT' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedSegment.mop_compliance}
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Chargers in 20km Section:</span>
                  <span className="font-bold text-white">{selectedSegment.stations_count}</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Distance to Nearest Charger:</span>
                  <span className={`font-bold ${
                    selectedSegment.nearest_station_km <= 20 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedSegment.nearest_station_km !== null ? `${selectedSegment.nearest_station_km} km` : 'None in Catchment'}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">100kW+ Fast Charger Present:</span>
                  <span className={`font-bold ${
                    selectedSegment.fast_charger_100kw_present ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedSegment.fast_charger_100kw_present ? 'YES' : 'NO (Heavy-Duty Deficit)'}
                  </span>
                </div>
              </div>

              {/* Highway recommendation */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <strong>Corridor Directive:</strong> {selectedSegment.mop_compliance === 'COMPLIANT'
                  ? "Meets the 20km inter-station spacing standard. Recommended for dual-carriageway capacity expansion."
                  : "Critical 20km highway gap! High priority for interchange wayside charging development under Phase 5."}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center my-auto">Select a segment from the table below.</div>
          )}

          {/* Quick Interchanges Carousel/List */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">Interchange Waypoints (17 Total)</div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {corridorData?.interchanges?.map(ic => (
                <div
                  key={ic.chainage_km}
                  onClick={() => {
                    setSelectedInterchange(ic);
                    setMapCenter([ic.lon, ic.lat]);
                    setMapZoom(11.0);
                  }}
                  className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedInterchange?.chainage_km === ic.chainage_km
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="font-semibold text-white">{ic.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                    <span>Km {ic.chainage_km} ({ic.district})</span>
                    <span className={ic.substation_nearby ? 'text-emerald-400' : 'text-slate-500'}>
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Corridor 20km Spacing Benchmark Audit Table</h3>
            <p className="text-xs text-slate-400 mt-0.5">Consecutive 20km intervals from Nagpur (0 km) to Thane (701 km)</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chainage..."
              value={searchChainage}
              onChange={(e) => setSearchChainage(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Segment #</th>
                <th className="py-3 px-4">Chainage Range</th>
                <th className="py-3 px-4">Wayside Stations</th>
                <th className="py-3 px-4">Nearest Station Distance</th>
                <th className="py-3 px-4">240kW Heavy Duty (Cl. 12(7))</th>
                <th className="py-3 px-4">MoP 2024 Compliance</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSegments.map((seg) => (
                <tr
                  key={seg.segment_index}
                  onClick={() => {
                    setSelectedSegment(seg);
                  }}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    selectedSegment?.segment_index === seg.segment_index ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-white">#{seg.segment_index}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{seg.chainage_range}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">{seg.stations_count}</td>
                  <td className="py-3 px-4 font-medium">
                    {seg.nearest_station_km !== null ? `${seg.nearest_station_km} km` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {seg.fast_charger_240kw_present ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">&ge;240 kW</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">DEFICIT (&lt;240kW)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      seg.mop_compliance === 'COMPLIANT'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {seg.mop_compliance}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-500 inline-block" />
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
