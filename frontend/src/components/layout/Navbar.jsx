import React from 'react';
import { Zap, ShieldCheck, Activity, Award } from 'lucide-react';
import DataStatusBadge from '../common/DataStatusBadge';

export const Navbar = ({ backendStatus, isSynthetic = true }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Brand & Team Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
          <Zap className="w-5 h-5 fill-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white font-mono">
              CHARGEATLAS <span className="text-emerald-400">INDIA</span>
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              MHI & ICAT Challenge
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            EV Infrastructure Mapping, Gap Analysis & Smart Siting Engine
          </p>
        </div>
      </div>

      {/* Right Action & Status Bar */}
      <div className="flex items-center gap-4">
        {/* Synthetic vs Real Indicator */}
        <DataStatusBadge isSynthetic={isSynthetic} qualityScore={94} />

        {/* Backend Connectivity Status */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
          <Activity className={`w-3.5 h-3.5 ${backendStatus?.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-300">
            Engine: <span className="font-mono text-white">{backendStatus?.database?.engine || 'Checking...'}</span>
          </span>
        </div>

        {/* Team Tag */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Team SuperNova (Sanjivani Univ)</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

