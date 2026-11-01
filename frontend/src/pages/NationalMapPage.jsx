import React from 'react';
import { Map, Layers, Filter } from 'lucide-react';

export const NationalMapPage = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Level 1 Geographic Analysis
            </span>
            <span className="text-xs text-slate-400">All India (36 States & UTs)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            National EV Infrastructure GIS Map
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            State-wise choropleth layer displaying EV adoption intensity, public charging station density, and the national Charging Gap Index (CGI).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filter: All Segments</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Layer: Charging Gap Index</span>
          </div>
        </div>
      </div>

      {/* Map Container Area */}
      <div className="relative w-full h-[600px] rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <Map className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">Interactive MapLibre GL Layer</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          National GeoJSON layer ready for rendering. Interactive boundaries, station clusters, and choropleth color scales will be activated in Phase 3.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            🟢 Green: Low Gap (CGI &lt; 35)
          </span>
          <span className="px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            🟡 Yellow: Moderate Gap (35 - 70)
          </span>
          <span className="px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            🔴 Red: Critical Deficit (CGI &gt; 70)
          </span>
          <span className="px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-400">
            ⚪ Grey: Insufficient Data
          </span>
        </div>
      </div>
    </div>
  );
};

export default NationalMapPage;

