import React from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';

export const DataStatusBadge = ({ isSynthetic = false, qualityScore = 98 }) => {
  return (
    <div className="flex items-center gap-2">
      {isSynthetic ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-accent-amber/15 text-accent-amber border border-accent-amber/30">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>DEMO MODE (SYNTHETIC)</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-accent-green/15 text-accent-green border border-accent-green/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>AUTHENTIC GOVT DATA</span>
        </div>
      )}
      <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-grey bg-navy-800 px-2.5 py-1 rounded-md border border-navy-700">
        <Database className="w-3 h-3 text-accent-teal" />
        <span>Quality: <span className="text-slate-200 font-semibold font-mono">{qualityScore}%</span></span>
      </div>
    </div>
  );
};

export default DataStatusBadge;
