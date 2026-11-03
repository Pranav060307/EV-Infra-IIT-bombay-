import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Compass, 
  Info, 
  Search, 
  ExternalLink,
  ChevronRight,
  Download,
  Share2,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getDistrictAnalysis, getBoundaryGeoJSON, getVerifiedStations } from '../services/api';
import MapLibreMap from '../components/common/MapLibreMap';

// Helper to normalize district name strings for flexible matching
const normalizeName = (str = '') => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Calculate 2D bounding box from GeoJSON geometry coordinates
const computeBounds = (geometry) => {
  if (!geometry) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  const traverse = (coords) => {
    if (typeof coords[0] === 'number') {
      const [lng, lat] = coords;
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    } else {
      coords.forEach(traverse);
    }
  };

  traverse(geometry.coordinates);
  if (minLng === Infinity) return null;
  return [minLng, minLat, maxLng, maxLat];
};

export const DistrictDetailPage = () => {
  const { districtName } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDistricts, setAllDistricts] = useState([]);
  const [districtSummary, setDistrictSummary] = useState(null);
  const [boundaryGeoJSON, setBoundaryGeoJSON] = useState(null);
  const [districtBoundary, setDistrictBoundary] = useState(null);
  const [stations, setStations] = useState([]);
  const [searchDistrict, setSearchDistrict] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDistrictData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytical summary and district boundaries with Promise.allSettled
        const [analysisResult, boundaryResult] = await Promise.allSettled([
          getDistrictAnalysis(),
          getBoundaryGeoJSON('maharashtra_districts')
        ]);

        if (!isMounted) return;

        let dList = [];
        if (analysisResult.status === 'fulfilled') {
          dList = Array.isArray(analysisResult.value?.districts) ? analysisResult.value.districts : [];
        } else {
          throw new Error(analysisResult.reason?.response?.data?.detail || analysisResult.reason?.message || "Failed to load district metrics");
        }

        setAllDistricts(dList);

        let boundaryRes = null;
        if (boundaryResult.status === 'fulfilled') {
          boundaryRes = boundaryResult.value;
          setBoundaryGeoJSON(boundaryRes);
        }

        // Match requested district from URL with historical alias support
        const normTarget = normalizeName(districtName);
        const matched = dList.find(d => {
          const dNorm = normalizeName(d.district);
          return dNorm === normTarget ||
            (normTarget.includes('aurangabad') && dNorm.includes('sambhajinagar')) ||
            (normTarget.includes('osmanabad') && dNorm.includes('dharashiv')) ||
            (normTarget === 'mumbai' && dNorm.includes('mumbai'));
        });

        if (!matched) {
          setDistrictSummary(null);
          setLoading(false);
          return;
        }

        setDistrictSummary(matched);

        // Find boundary polygon in GeoJSON
        if (boundaryRes?.features) {
          const bMatch = boundaryRes.features.find(f => {
            const bNorm = normalizeName(f.properties?.district || f.properties?.dt_nm || f.properties?.NAME_2);
            const mNorm = normalizeName(matched.district);
            return bNorm === mNorm ||
              (mNorm.includes('sambhajinagar') && bNorm.includes('aurangabad')) ||
              (mNorm.includes('dharashiv') && bNorm.includes('osmanabad')) ||
              (mNorm.includes('mumbai') && bNorm.includes('mumbai')) ||
              (mNorm === 'palghar' && bNorm === 'thane');
          });
          if (bMatch) {
            setDistrictBoundary({
              type: 'FeatureCollection',
              features: [bMatch]
            });
          }
        }

        // Fetch stations filtered by district
        try {
          const stationsRes = await getVerifiedStations({ district: matched.district });
          if (isMounted) {
            setStations(Array.isArray(stationsRes?.features) ? stationsRes.features : []);
          }
        } catch (stErr) {
          console.warn("Could not load district stations:", stErr);
          if (isMounted) setStations([]);
        }

      } catch (err) {
        console.error("Failed loading district detail:", err);
        if (isMounted) setError(err.message || 'Failed to load district data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDistrictData();

    return () => {
      isMounted = false;
    };
  }, [districtName]);

  // Compute map bounds for the selected district boundary
  const fitBounds = useMemo(() => {
    if (districtBoundary?.features?.[0]?.geometry) {
      return computeBounds(districtBoundary.features[0].geometry);
    }
    return null;
  }, [districtBoundary]);

  // Station markers for MapLibre
  const markers = useMemo(() => {
    return stations.map(f => ({
      name: f.properties?.name || 'Public Charging Station',
      operator: f.properties?.operator || 'Unknown CPO',
      latitude: f.geometry?.coordinates?.[1],
      longitude: f.geometry?.coordinates?.[0],
      power_kw: f.properties?.total_power_kw,
      points: f.properties?.total_charging_points,
      status: f.properties?.status || 'OPERATIONAL',
      is_synthetic: f.properties?.is_synthetic || false,
      source_name: f.properties?.source_name || 'BEE EV Yatra',
      address: f.properties?.address,
      color: f.properties?.is_synthetic ? '#f59e0b' : '#10b981'
    }));
  }, [stations]);

  // Copy URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded"></div>
        <div className="h-12 w-96 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
          Loading district GIS metrics & spatial boundary...
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-xl font-bold text-white">District GIS Data Unavailable</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
          <Link
            to="/maharashtra"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Districts</span>
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 404 / NOT FOUND STATE FOR INVALID DISTRICT
  // ---------------------------------------------------------------------------
  if (!districtSummary) {
    const validFiltered = allDistricts.filter(d => 
      d.district.toLowerCase().includes(searchDistrict.toLowerCase())
    );

    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-rose-400" />
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              DISTRICT NOT FOUND
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              No Administrative District Matches "{districtName}"
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Maharashtra comprises 36 official revenue districts. Please select from the verified administrative list below:
            </p>
          </div>

          {/* Quick search */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search 36 Maharashtra districts..."
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* District grid picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-left max-h-72 overflow-y-auto p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            {validFiltered.map(d => (
              <button
                key={d.district}
                onClick={() => navigate(`/districts/${d.district.toLowerCase().replace(/\s+/g, '-')}`)}
                className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>{d.district}</span>
                <span className="text-[10px] text-slate-500 font-mono">CGI: {d.cgi_score}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-center gap-3">
            <Link
              to="/maharashtra"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Maharashtra Analysis</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VALID DISTRICT DETAIL VIEW
  // ---------------------------------------------------------------------------
  const d = districtSummary;
  const isThanePalghar = ['thane', 'palghar'].includes(d.district.toLowerCase());
  const fleetTotal = d.total_ev || 1;
  const twPct = Math.round(((d.ev_2w || 0) / fleetTotal) * 100);
  const thwPct = Math.round(((d.ev_3w || 0) / fleetTotal) * 100);
  const fwPct = Math.round(((d.ev_4w || 0) / fleetTotal) * 100);
  const busPct = Math.round(((d.ev_bus || 0) / fleetTotal) * 100);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/" className="hover:text-slate-200">Overview</Link>
            <span>/</span>
            <Link to="/maharashtra" className="hover:text-slate-200">Maharashtra Analysis</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">{d.district}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {d.district} District Profile
            </h2>
            <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
              d.cgi_score > 80 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
              d.cgi_score > 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              CGI Score: {d.cgi_score} / 100
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
              {d.cgi_category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy shareable link"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>
          <Link
            to="/maharashtra"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>&larr; All 36 Districts</span>
          </Link>
        </div>
      </div>

      {/* Special Census 2011 Thane-Palghar Bifurcation Notice */}
      {isThanePalghar && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Census Bifurcation Note (Thane &amp; Palghar):</strong> Palghar district was carved out of Thane on 1 August 2014. Census 2011 administrative shapefiles define the combined boundary envelope. In our database, VAHAN registrations are individually recorded for {d.district}, and public chargers are geolocated precisely by their physical coordinates.
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cumulative EVs</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {d.total_ev?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">VAHAN 4 (Oct 2024 Baseline)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Public Stations</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {d.verified_stations}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">BEE EV Yatra Verified Sites</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Charging Points / Guns</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {d.verified_charging_points}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{d.total_power_kw || 0} kW Total Capacity</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>EV-to-Charger Ratio</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {d.ev_to_charger_ratio ? `${d.ev_to_charger_ratio}:1` : 'No Chargers'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target Norm: 20-30:1</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Population &amp; Urban %</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {d.urban_pct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{d.projected_2024_pop?.toLocaleString()} Projected Pop</div>
        </div>
      </div>

      {/* Main Grid: Interactive District Map (Left) + Vehicle Segment & MoP Standards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Boundary Map */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">
                {d.district} Spatial Boundary &amp; Public Chargers
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {stations.length} Public Sites
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">CRS: EPSG:4326</span>
            </div>
          </div>

          <div className="relative w-full h-[420px]">
            <MapLibreMap
              fitBounds={fitBounds}
              geojsonData={districtBoundary}
              layerConfig={{
                id: 'district-polygon',
                type: 'fill',
                paint: {
                  'fill-color': '#0ea5e9',
                  'fill-opacity': 0.15
                }
              }}
              markers={markers}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Vehicle Segment Breakdown & Policy Benchmarking */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-lg space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Fleet Category Distribution (VAHAN 2024)
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>2-Wheelers (2W):</span>
                  <span className="font-bold text-white">{d.ev_2w?.toLocaleString()} ({twPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${twPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>4-Wheelers (LMV):</span>
                  <span className="font-bold text-white">{d.ev_4w?.toLocaleString()} ({fwPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${fwPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>3-Wheelers (3W):</span>
                  <span className="font-bold text-white">{d.ev_3w?.toLocaleString()} ({thwPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${thwPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Commercial Buses:</span>
                  <span className="font-bold text-white">{d.ev_bus?.toLocaleString()} ({busPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${busPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* MoP Siting Compliance Evaluation Box */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>MoP 2024 Siting Norm Benchmark</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {d.verified_stations > 0 ? (
                <>
                  {d.district} has <strong>{d.verified_stations} public stations</strong> serving <strong>{d.total_ev?.toLocaleString()} EVs</strong>. To achieve the MoP urban guideline of 1 station per 1 km² and 25:1 vehicle ratio, an estimated <strong>{Math.max(1, Math.round((d.total_ev || 1) / 25 - d.verified_charging_points))} additional charging points</strong> are required.
                </>
              ) : (
                <>
                  <strong className="text-rose-400">Total Infrastructure Void:</strong> 0 public charging stations currently operating. Urgent deployment required to serve {d.total_ev?.toLocaleString()} registered EVs.
                </>
              )}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Audit: MoRTH &amp; BEE EV Yatra</span>
            <span className="text-cyan-400 font-mono">EPSG:4326</span>
          </div>
        </div>
      </div>

      {/* Public Charging Stations in this District */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Registered Public Charging Stations in {d.district}</span>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {stations.length} Sites
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified operational facilities registered in BEE EV Yatra &amp; OpenChargeMap directories
            </p>
          </div>
        </div>

        {stations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Station Name</th>
                  <th className="py-3 px-4">CPO / Operator</th>
                  <th className="py-3 px-4">Address / Sub-district</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Rated Power</th>
                  <th className="py-3 px-4">Access &amp; Pricing</th>
                  <th className="py-3 px-4">Source Provenance</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stations.map((st, idx) => {
                  const p = st.properties || {};
                  return (
                    <tr key={p.station_id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {p.name || 'Public Charging Station'}
                        {p.station_id && <div className="text-[10px] font-mono text-slate-500">{p.station_id}</div>}
                      </td>
                      <td className="py-3 px-4 font-medium text-cyan-400">{p.operator || 'Not available'}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{p.address || `${d.district}, Maharashtra`}</td>
                      <td className="py-3 px-4 font-semibold text-white">{p.total_charging_points || 'Not available'}</td>
                      <td className="py-3 px-4 font-mono text-amber-400">{p.total_power_kw ? `${p.total_power_kw} kW` : 'Not available'}</td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className="capitalize">{p.access_type?.toLowerCase() || 'Public'}</span> &bull; <span className="capitalize">{p.pricing_type?.toLowerCase() || 'Paid'}</span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">{p.source_name || 'BEE EV Yatra'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status || 'OPERATIONAL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-500">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-white">
              No Public Charging Stations Registered in {d.district}
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              According to the official BEE EV Yatra directory, there are zero active public charging stations recorded in {d.district} district. This represents an acute infrastructure void for its {d.total_ev?.toLocaleString()} registered EVs.
            </p>
            <div className="pt-2">
              <Link
                to="/site-recommendations"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View Recommended Siting Candidates</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistrictDetailPage;

