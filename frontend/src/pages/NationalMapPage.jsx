import React, { useState, useEffect } from 'react';
import { Map, Layers, Filter, Zap, ShieldCheck, Info, Car, Compass, ChevronRight } from 'lucide-react';
import { getVerifiedStations, getDistrictAnalysis, getPolicyCompliance } from '../services/api';
import MapLibreMap from '../components/common/MapLibreMap';

export const NationalMapPage = () => {
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [districtData, setDistrictData] = useState(null);
  const [policyData, setPolicyData] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapCenter, setMapCenter] = useState([78.9629, 20.5937]);
  const [mapZoom, setMapZoom] = useState(4.8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stRes, distRes, polRes] = await Promise.allSettled([
          getVerifiedStations(),
          getDistrictAnalysis(),
          getPolicyCompliance()
        ]);
        if (stRes.status === 'fulfilled') {
          const feats = stRes.value?.features || [];
          setStations(feats);
          if (feats.length > 0) {
            setSelectedStation(feats[0].properties);
          }
        }
        if (distRes.status === 'fulfilled') {
          setDistrictData(distRes.value);
        }
        if (polRes.status === 'fulfilled') {
          setPolicyData(polRes.value);
        }
      } catch (err) {
        console.error("Failed to fetch national map data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter stations by operator
  const filteredStations = stations.filter(f => {
    if (selectedOperator === 'ALL') return true;
    return f.properties.operator?.toLowerCase() === selectedOperator.toLowerCase();
  });

  const markers = React.useMemo(() => {
    return filteredStations.map(f => ({
      name: f.properties.name,
      operator: f.properties.operator,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      power_kw: f.properties.total_power_kw,
      points: f.properties.total_charging_points,
      color: '#3F7775' // Muted Teal marker
    }));
  }, [filteredStations]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#52765B]/15 text-[#86af8f] border border-[#52765B]/30">
              Level 1 Geographic Analysis
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
              National Public Charging Infrastructure Directory
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            National EV Infrastructure GIS Map
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Pan-India overview of verified public charging stations, state-level penetration, and spatial distribution.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMapCenter([78.9629, 20.5937]);
              setMapZoom(4.8);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              mapZoom <= 5 ? 'bg-accent-teal text-white border-accent-teal' : 'bg-navy-900 text-slate-300 border-slate-700/60'
            }`}
          >
            All India View
          </button>
          <button
            onClick={() => {
              setMapCenter([75.7139, 19.7515]);
              setMapZoom(6.4);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              mapZoom > 5 ? 'bg-slate-700 text-white border-slate-600' : 'bg-navy-900 text-slate-300 border-slate-700/60'
            }`}
          >
            Focus Maharashtra
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700/60 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-accent-teal" />
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            >
              <option value="ALL" className="bg-navy-900">All Operators</option>
              <option value="Tata Power" className="bg-navy-900">Tata Power</option>
              <option value="Jio-bp" className="bg-navy-900">Jio-bp pulse</option>
              <option value="Statiq" className="bg-navy-900">Statiq</option>
              <option value="ChargeZone" className="bg-navy-900">ChargeZone</option>
              <option value="Ather Energy" className="bg-navy-900">Ather Grid</option>
              <option value="BPCL" className="bg-navy-900">BPCL</option>
              <option value="HPCL" className="bg-navy-900">HPCL</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Public Stations</span>
            <Zap className="w-4 h-4 text-accent-green" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {filteredStations.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">BEE EV Yatra Verified Directory</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Primary Focus State EVs</span>
            <Car className="w-4 h-4 text-[#5fa3a0]" />
          </div>
          <div className="text-2xl font-bold text-[#5fa3a0] mt-2">
            {districtData ? districtData.total_ev_registered?.toLocaleString() : '886,752'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Maharashtra Cumulative (VAHAN 2024)</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Charging Gap Index (Avg)</span>
            <Compass className="w-4 h-4 text-accent-red" />
          </div>
          <div className="text-2xl font-bold text-accent-red mt-2">
            {districtData ? districtData.average_charging_gap_index : '99.1'}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </div>
          <div className="text-xs text-accent-red/90 mt-1">Severe Multi-Criteria Deficit</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Policy Framework</span>
            <Info className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="text-base font-bold text-accent-amber mt-2 truncate">
            MoP Guidelines 2024
          </div>
          <div className="text-xs text-slate-400 mt-1">Active National Norms</div>
        </div>
      </div>

      {/* Main Map + Station Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-navy-900/50 overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-700/60 bg-navy-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-accent-teal" />
              <span className="text-sm font-semibold text-white">National Spatial Station Map</span>
            </div>
            <div className="text-xs text-slate-300 font-mono">
              Showing {filteredStations.length} Stations &bull; CartoDB Dark Matter
            </div>
          </div>
          <div className="relative w-full h-[520px]">
            <MapLibreMap
              center={mapCenter}
              zoom={mapZoom}
              markers={markers}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Right Panel: Selected Station Inspector & Policy Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700/60 bg-navy-900/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#86af8f] font-semibold">
              <Zap className="w-4 h-4 text-accent-green" />
              <span>Verified Station Directory</span>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredStations.map(f => (
                <div
                  key={f.properties.station_id}
                  onClick={() => setSelectedStation(f.properties)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedStation?.station_id === f.properties.station_id
                      ? 'bg-accent-teal/15 border-accent-teal/60'
                      : 'bg-navy-950/60 border-slate-800 hover:bg-navy-800/70'
                  }`}
                >
                  <div className="text-xs font-bold text-white truncate">{f.properties.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{f.properties.operator}</span>
                    <span className="text-[#5fa3a0] font-mono font-semibold">{f.properties.total_power_kw} kW</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedStation && (
              <div className="p-3.5 rounded-xl bg-navy-950/60 border border-slate-700/60 text-xs space-y-2">
                <div className="font-bold text-white text-sm">{selectedStation.name}</div>
                <div className="text-slate-300">{selectedStation.address}</div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div><span className="text-slate-400">Operator:</span> <strong className="text-white">{selectedStation.operator}</strong></div>
                  <div><span className="text-slate-400">Power:</span> <strong className="text-accent-teal">{selectedStation.total_power_kw} kW</strong></div>
                  <div><span className="text-slate-400">Points:</span> <strong className="text-white">{selectedStation.total_charging_points}</strong></div>
                  <div><span className="text-slate-400">Status:</span> <strong className="text-[#86af8f]">{selectedStation.status}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Policy Compliance Framework Summary */}
          <div className="rounded-2xl border border-slate-700/60 bg-navy-900/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-amber font-semibold">
              <Info className="w-4 h-4 text-accent-amber" />
              <span>MoP 2024 Siting Guidelines</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-slate-800">
                <strong className="text-white">Urban Agglomerations:</strong> At least 1 station per 1km × 1km grid (Section 3.1a).
              </div>
              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-slate-800">
                <strong className="text-white">Highways & Expressways:</strong> At least 1 station every 20 km on both sides (Section 3.1b).
              </div>
              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-slate-800">
                <strong className="text-white">Heavy-Duty & Long-Range:</strong> Fast charger (&ge;100 kW) every 100 km (Section 3.1c).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalMapPage;
