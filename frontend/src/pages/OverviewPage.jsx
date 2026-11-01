import React from 'react';
import { 
  Zap, 
  MapPin, 
  Layers, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Database
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';

export const OverviewPage = ({ setActiveTab, backendStatus }) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Decision-Support Platform
            </span>
            <span className="text-xs text-slate-400">MoP 2024 Guidelines Benchmark</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Executive Infrastructure Overview
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Consolidated analytical layer linking VAHAN EV registrations to geocoded public charging points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('national-map')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span>Explore National GIS Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveTab('data-management')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium text-xs transition-all"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Manage Datasets</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered EVs (In-Use)"
          value="10,023,396"
          subtitle="All-India VAHAN Cumulative Active Fleet"
          icon={Zap}
          trend={{ isPositive: true, text: "34% YoY Growth" }}
        />
        <MetricCard
          title="Public Charging Stations"
          value="52,718"
          subtitle="De-duplicated National Unified Layer"
          icon={MapPin}
          trend={{ isPositive: true, text: "1 Station : 190 EVs" }}
        />
        <MetricCard
          title="Public Charge Points (EVSE)"
          value="98,450"
          subtitle="1.87 Avg Connectors / Station"
          icon={Layers}
        />
        <MetricCard
          title="High Gap Districts (CGI > 70)"
          value="142 / 760"
          subtitle="Underserved Districts vs MoP Norms"
          icon={AlertCircle}
          alertType="danger"
        />
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Forecasted 2030 EV Stock"
          value="48.5 Million"
          subtitle="Base Adoption Scenario (CAGR + Logistic S-Curve)"
          icon={TrendingUp}
          trend={{ isPositive: true, text: "PM E-DRIVE Aligned" }}
          alertType="normal"
        />
        <MetricCard
          title="2030 Additional Chargers Needed"
          value="420,000+"
          subtitle="Net New Points to Satisfy Daily Energy Demand"
          icon={Activity}
          alertType="warning"
        />
        <MetricCard
          title="Recommended Candidate Sites"
          value="3,410"
          subtitle="MCLP Optimized across Highways & Urban Grids"
          icon={Sparkles}
          alertType="success"
        />
      </div>

      {/* Three Geographical Tiers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1 */}
        <div 
          onClick={() => setActiveTab('national-map')}
          className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LEVEL 1
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            National India Overview
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            State-wise EV adoption comparison, total public charging infrastructure density, and national infrastructure gap choropleths across 36 states and UTs.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Coverage: 36 States/UTs</span>
            <span className="text-emerald-400 font-mono">View Map →</span>
          </div>
        </div>

        {/* Tier 2 */}
        <div 
          onClick={() => setActiveTab('maharashtra')}
          className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              LEVEL 2
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
            Maharashtra Deep Dive
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            District-by-district breakdown across all 36 Maharashtra districts. Computes the Charging Gap Index (CGI), EV-to-charger ratios, and 2030 demand forecasts.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Coverage: 36 Districts</span>
            <span className="text-cyan-400 font-mono">View Analysis →</span>
          </div>
        </div>

        {/* Tier 3 */}
        <div 
          onClick={() => setActiveTab('pune')}
          className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              LEVEL 3
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
            Micro Study: Pune & Samruddhi
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Micro-geographical spatial planning: 1km² built-up urban grid cells in Pune district, and 20km interval highway spacing checks along the 701km Samruddhi Mahamarg.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Grid & Corridor Scope</span>
            <span className="text-purple-400 font-mono">Explore →</span>
          </div>
        </div>
      </div>

      {/* Analytical Methodology Summary Banner */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              Data Integrity & Defensibility Standard
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every score, gap calculation, and site recommendation in ChargeAtlas India is mathematically traceable. 
              The system strictly distinguishes between <strong>charging stations</strong>, <strong>charge points</strong>, and <strong>connectors</strong>. 
              Substation proximity is treated as an initial geospatial proxy and explicitly flags the requirement for DISCOM electrical load approval before commissioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

