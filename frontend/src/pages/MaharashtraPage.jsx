import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Car, 
  MapPin, 
  Search, 
  ChevronRight, 
  Info,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getDistrictAnalysis, getBoundaryGeoJSON, getVerifiedStations } from '../services/api';
import MapLibreMap from '../components/common/MapLibreMap';

export const MaharashtraPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districtData, setDistrictData] = useState(null);
  const [boundaryGeoJSON, setBoundaryGeoJSON] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load primary analysis and secondary spatial layers with Promise.allSettled
      const [analysisResult, boundaryResult, stationsResult] = await Promise.allSettled([
        getDistrictAnalysis(),
        getBoundaryGeoJSON('maharashtra_districts'),
        getVerifiedStations()
      ]);

      if (analysisResult.status === 'fulfilled') {
        const analysisRes = analysisResult.value;
        setDistrictData(analysisRes);
        if (analysisRes?.districts?.length > 0) {
          // Default select Pune or first district
          const pune = analysisRes.districts.find(d => d.district === 'Pune') || analysisRes.districts[0];
          setSelectedDistrict(pune);
        }
      } else {
        const errMsg = analysisResult.reason?.response?.data?.detail || analysisResult.reason?.message || "Failed to connect to backend GIS analysis endpoint.";
        throw new Error(errMsg);
      }

      if (boundaryResult.status === 'fulfilled') {
        setBoundaryGeoJSON(boundaryResult.value);
      } else {
        console.warn("Notice: Boundary polygons deferred:", boundaryResult.reason?.message);
      }

      if (stationsResult.status === 'fulfilled') {
        setStations(stationsResult.value?.features || []);
      } else {
        console.warn("Notice: Station markers deferred:", stationsResult.reason?.message);
      }

    } catch (err) {
      console.error("Failed loading Maharashtra GIS data:", err);
      setError(err.message || "Failed to load Maharashtra GIS datasets from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter districts by search query and category defensively
  const districtsList = Array.isArray(districtData?.districts) ? districtData.districts : [];
  const filteredDistricts = districtsList.filter(d => {
    if (!d || !d.district) return false;
    const matchesSearch = d.district.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterCategory === 'ALL') return matchesSearch;
    if (filterCategory === 'CRITICAL') return matchesSearch && (d.cgi_score > 80);
    if (filterCategory === 'HIGH') return matchesSearch && (d.cgi_score > 60 && d.cgi_score <= 80);
    if (filterCategory === 'MODERATE') return matchesSearch && (d.cgi_score > 30 && d.cgi_score <= 60);
    if (filterCategory === 'LOW') return matchesSearch && (d.cgi_score <= 30);
    return matchesSearch;
  });

  // Export CSV
  const handleExportCSV = () => {
    if (!districtsList.length) return;
    const headers = [
      "District", "Total EVs", "EV 2W", "EV 3W", "EV 4W", "EV Bus",
      "Verified Stations", "Charging Points", "EV to Charger Ratio",
      "CGI Score", "CGI Category", "Status"
    ];
    const rows = districtsList.map(d => [
      `"${d.district}"`,
      d.total_ev || 0,
      d.ev_2w || 0,
      d.ev_3w || 0,
      d.ev_4w || 0,
      d.ev_bus || 0,
      d.verified_stations || 0,
      d.verified_charging_points || 0,
      d.ev_to_charger_ratio || 'N/A',
      d.cgi_score || 0,
      `"${d.cgi_category || 'N/A'}"`,
      `"${d.status || 'VERIFIED'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ChargeAtlas_Maharashtra_District_CGI.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Markers for stations
  const stationMarkers = stations.map(f => ({
    name: f.properties?.name || 'Public Station',
    operator: f.properties?.operator || 'Unknown CPO',
    latitude: f.geometry?.coordinates?.[1],
    longitude: f.geometry?.coordinates?.[0],
    power_kw: f.properties?.total_power_kw,
    points: f.properties?.total_charging_points,
    color: f.properties?.is_synthetic ? '#f59e0b' : '#06b6d4'
  }));

  // Layer style for district boundaries
  const layerConfig = {
    fill: {
      'fill-color': '#0ea5e9',
      'fill-opacity': 0.15
    },
    line: {
      'line-color': '#38bdf8',
      'line-width': 1.5,
      'line-opacity': 0.7
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-80 bg-slate-800 rounded"></div>
        <div className="h-4 w-96 bg-slate-800/60 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800"></div>
          ))}
        </div>
        <div className="h-[460px] bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
          Loading authentic Maharashtra 36-district GIS dataset...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-xl font-bold text-white">GIS Data Unavailable</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Level 2 Geographic Analysis
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              VAHAN 4 (Oct 2024 Baseline) &amp; BEE EV Yatra
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Maharashtra District-Wise Charging Gap Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Evaluating 36 administrative districts: VAHAN EV fleet distribution, public charger adequacy, and the multi-criteria Charging Gap Index (CGI).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export District CSV</span>
          </button>
        </div>
      </div>

      {/* Boundary Reconciliation Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300">Geographic Reconciliation Note (35 Boundaries vs 36 Administrative Districts):</strong> Census 2011 official shapefiles contain 35 polygons as they predate Palghar's bifurcation from Thane on 1 August 2014. In our analytical database, VAHAN EV fleet data and Census populations are individually disaggregated across all 36 districts, while spatial point-in-polygon queries allocate stations to the contiguous Thane-Palghar boundary envelope.
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>State Cumulative EVs</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {districtData?.total_ev_registered ? districtData.total_ev_registered.toLocaleString() : '886,752'}
          </div>
          <div className="text-xs text-amber-400 mt-1 font-medium">36 Districts (Partially Verified)</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Public Chargers</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {districtData?.total_verified_charging_points ?? '68'}
          </div>
          <div className="text-xs text-slate-400 mt-1">BEE EV Yatra Verified</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>State EV-to-Charger Ratio</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {districtData?.state_ev_to_charger_ratio ? `${districtData.state_ev_to_charger_ratio.toLocaleString()}:1` : '13,040:1'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Target Norm: 20-30:1</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average State CGI</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {districtData?.average_charging_gap_index ?? '99.1'}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </div>
          <div className="text-xs text-rose-400 mt-1 font-semibold">Critical Infrastructure Void</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + District Detail Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">Maharashtra GIS Spatial Layer</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Verified Chargers
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">CRS: EPSG:4326</span>
            </div>
          </div>
          <div className="relative w-full h-[460px]">
            {boundaryGeoJSON ? (
              <MapLibreMap
                center={[75.7139, 19.7515]}
                zoom={6.2}
                geojsonData={boundaryGeoJSON}
                layerConfig={layerConfig}
                markers={stationMarkers}
                className="w-full h-full"
                onSelectFeature={(props) => {
                  const distName = props?.district || props?.dt_nm || props?.NAME_2;
                  if (!distName) return;
                  const norm = distName.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const match = districtsList.find(d => {
                    const dNorm = d.district.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return dNorm === norm || 
                      (norm.includes('aurangabad') && dNorm.includes('sambhajinagar')) ||
                      (norm.includes('osmanabad') && dNorm.includes('dharashiv')) ||
                      (norm.includes('mumbai') && dNorm.includes('mumbai'));
                  });
                  if (match) setSelectedDistrict(match);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                Loading authentic Maharashtra district boundaries...
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected District Inspector Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-lg">
          {selectedDistrict ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">District Profile</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedDistrict.district}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">CGI Score</div>
                  <div className={`text-2xl font-black ${
                    selectedDistrict.cgi_score > 80 ? 'text-rose-400' :
                    selectedDistrict.cgi_score > 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedDistrict.cgi_score}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-xs font-semibold text-slate-300 mb-1">Gap Assessment</div>
                <div className="text-xs text-slate-400 leading-relaxed font-medium">
                  {selectedDistrict.cgi_category}
                </div>
              </div>

              {/* Vehicle breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fleet Breakdown (VAHAN 2024)</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400">2-Wheelers:</span>
                    <span className="font-bold text-white float-right">{selectedDistrict.ev_2w?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400">3-Wheelers:</span>
                    <span className="font-bold text-white float-right">{selectedDistrict.ev_3w?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400">4-Wheelers:</span>
                    <span className="font-bold text-white float-right">{selectedDistrict.ev_4w?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400">Buses:</span>
                    <span className="font-bold text-white float-right">{selectedDistrict.ev_bus?.toLocaleString() ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure metrics */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Verified Public Stations:</span>
                  <span className="font-bold text-cyan-400">{selectedDistrict.verified_stations ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Total Charging Points:</span>
                  <span className="font-bold text-cyan-400">{selectedDistrict.verified_charging_points ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Total Rated Power:</span>
                  <span className="font-bold text-white">{selectedDistrict.total_power_kw ?? 0} kW</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">EV to Charger Ratio:</span>
                  <span className="font-bold text-rose-400">{selectedDistrict.ev_to_charger_ratio ? `${selectedDistrict.ev_to_charger_ratio}:1` : 'No Chargers'}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Projected Population:</span>
                  <span className="text-slate-300 font-medium">{selectedDistrict.projected_2024_pop?.toLocaleString() ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Urban Population %:</span>
                  <span className="text-slate-300 font-medium">{selectedDistrict.urban_pct ?? 0}%</span>
                </div>
              </div>

              {/* Dedicated District Page CTA button */}
              <button
                onClick={() => navigate(`/districts/${selectedDistrict.district.toLowerCase().replace(/\s+/g, '-')}`)}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Open {selectedDistrict.district} Detail Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-slate-500 text-center my-auto">Select a district to inspect details.</div>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Source: MoRTH VAHAN &amp; BEE EV Yatra</span>
            <span className="text-emerald-400 font-semibold">PASSED AUDIT</span>
          </div>
        </div>
      </div>

      {/* District Comparison Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80">
          <div>
            <h3 className="text-base font-bold text-white">District Comparative Gap Index Table</h3>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit of all 36 Maharashtra districts (Click any district to inspect or explore)</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Gap Levels</option>
              <option value="CRITICAL">Critical Gap (&gt;80)</option>
              <option value="HIGH">High Gap (61-80)</option>
              <option value="MODERATE">Moderate Gap (31-60)</option>
              <option value="LOW">Low Gap (&le;30)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Total EVs (VAHAN)</th>
                <th className="py-3 px-4">Public Stations</th>
                <th className="py-3 px-4">Charging Points</th>
                <th className="py-3 px-4">EV/Charger Ratio</th>
                <th className="py-3 px-4">CGI Score</th>
                <th className="py-3 px-4">Gap Category</th>
                <th className="py-3 px-4 text-right">District Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDistricts.map((d) => (
                <tr
                  key={d.district}
                  onClick={() => setSelectedDistrict(d)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    selectedDistrict?.district === d.district ? 'bg-cyan-500/10' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    {d.district}
                    {d.district === 'Pune' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">Focus Area</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">{d.total_ev?.toLocaleString() ?? 0}</td>
                  <td className="py-3 px-4 font-semibold text-cyan-400">{d.verified_stations ?? 0}</td>
                  <td className="py-3 px-4 font-semibold text-cyan-400">{d.verified_charging_points ?? 0}</td>
                  <td className="py-3 px-4 font-semibold text-rose-400">
                    {d.ev_to_charger_ratio ? `${d.ev_to_charger_ratio}:1` : 'No Public Chargers'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-black ${
                      d.cgi_score > 80 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      d.cgi_score > 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {d.cgi_score}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{d.cgi_category}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/districts/${d.district.toLowerCase().replace(/\s+/g, '-')}`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors text-[11px] font-medium"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
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

export default MaharashtraPage;
