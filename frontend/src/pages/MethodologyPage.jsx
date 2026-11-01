import React from 'react';
import { BookOpen, FileCheck, CheckCircle2 } from 'lucide-react';

export const MethodologyPage = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Methodology & Standards
          </span>
          <span className="text-xs text-slate-400">MoP 2024 & PM E-DRIVE Aligned</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
          Analytical Formulations & Engineering Principles
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Comprehensive, mathematically transparent formulations powering ChargeAtlas India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Charging Gap Index (CGI) Formula</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300">
            CGI(d) = 100 × Σ [ wᵢ × sᵢ(d) ]
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Composite percentile index ranging from 0 (adequately served) to 100 (critical infrastructure gap). 
            Evaluates EV-to-charger ratio, installed power deficit, spatial distance, and MoP 2024 urban grid compliance.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <FileCheck className="w-4 h-4" />
            <span>Daily Charging Energy & Charger Demand</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
            E = N × D × e × p<br />
            C_demand = ⌈ k × E / (P × H × η) ⌉
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Converts circulating fleet (N) into daily charging energy (E in kWh) and required physical charge points (C_demand) 
            incorporating vehicle segments, rated power (P in kW), daily operating hours (H), and grid efficiency (η).
          </p>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPage;

