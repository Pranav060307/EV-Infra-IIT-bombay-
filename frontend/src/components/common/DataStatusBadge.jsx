import React from 'react';
import { AlertTriangle, Database, CheckCircle2 } from 'lucide-react';

export const DataStatusBadge = ({ isSynthetic = true, qualityScore = 92 }) => {
  return (
    <div className="flex items-center gap-2">
      {isSynthetic ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          <span>DEMO DATA (SYNTHETIC)</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>VERIFIED GOVT DATA</span>
        </div>
      )}
      <div className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
        <Database className="w-3 h-3 text-cyan-400" />
        <span>Quality: <span className="text-slate-200 font-semibold">{qualityScore}%</span></span>
      </div>
    </div>
  );
};

export default DataStatusBadge;

