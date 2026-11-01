import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const SiteRecommendationsPage = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Module 4: Smart Siting
            </span>
            <span className="text-xs text-slate-400">Maximal Covering Location Problem (MCLP)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Smart Charging Site Recommendation Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Mathematically ranked candidate locations (petrol pumps, transit hubs, malls, wayside amenities) with explainable reasons and electrical grid feasibility checks.
          </p>
        </div>
      </div>

      <div className="w-full h-96 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">MCLP Optimization & Ranking Service</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          Ranks candidate sites to maximize covered unserved EV demand within set distance thresholds. Includes 11kV/33kV substation proximity audit.
        </p>
      </div>
    </div>
  );
};

export default SiteRecommendationsPage;

