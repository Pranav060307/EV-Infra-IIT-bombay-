import React from 'react';
import { Crosshair } from 'lucide-react';

export const PuneAnalysisPage = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Level 3 Micro Geographic Analysis
            </span>
            <span className="text-xs text-slate-400">Urban Siting Compliance</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Pune Urban Region Grid Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            1 km × 1 km micro-grid spatial evaluation benchmarking against Ministry of Power (MoP) 2024 urban siting guidelines.
          </p>
        </div>
      </div>

      <div className="w-full h-96 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
          <Crosshair className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Pune 1km² Grid Engine</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          Identifies built-up urban cells devoid of a public charging station, computes travel time isochrones, and scores unserved demand.
        </p>
      </div>
    </div>
  );
};

export default PuneAnalysisPage;

