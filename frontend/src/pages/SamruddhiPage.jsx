import React from 'react';
import { Milestone } from 'lucide-react';

export const SamruddhiPage = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Level 3 Micro Geographic Analysis
            </span>
            <span className="text-xs text-slate-400">701 km Super Communication Expressway</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Samruddhi Mahamarg Corridor Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Highway corridor evaluation: station spacing, bidirectional carriageway gaps, and 20km / 100km MoP norm compliance.
          </p>
        </div>
      </div>

      <div className="w-full h-96 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
          <Milestone className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Expressway Corridor Spacing Engine</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          Maps wayside amenities, petrol pumps, interchanges, and flags stretches with &gt;20km gaps between fast chargers.
        </p>
      </div>
    </div>
  );
};

export default SamruddhiPage;

