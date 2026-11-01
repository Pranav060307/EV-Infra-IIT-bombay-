import React from 'react';
import { Compass, Filter, Download } from 'lucide-react';

export const MaharashtraPage = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Level 2 Geographic Analysis
            </span>
            <span className="text-xs text-slate-400">Primary Demonstration State</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Maharashtra District-Wise Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            In-depth evaluation of 36 districts: VAHAN EV fleet distribution, public charger adequacy, and the Charging Gap Index (CGI).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export District CSV</span>
          </button>
        </div>
      </div>

      <div className="w-full h-96 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Maharashtra 36-District Spatial Module</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          District-level choropleths and ranked comparison tables will render here following the Phase 2 & 3 analytical ingestion.
        </p>
      </div>
    </div>
  );
};

export default MaharashtraPage;

