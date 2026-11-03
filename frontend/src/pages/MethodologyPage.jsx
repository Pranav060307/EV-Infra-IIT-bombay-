import React, { useState } from 'react';
import { 
  BookOpen, 
  FileCheck, 
  CheckCircle2, 
  Layers, 
  Compass, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Info,
  Scale,
  Database,
  ExternalLink
} from 'lucide-react';

export const MethodologyPage = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: '1. Project Overview & Research Goals' },
    { id: 'geographic_scope', title: '2. 3-Tier Geographic Scope' },
    { id: 'data_provenance', title: '3. Data Provenance & Verification' },
    { id: 'crs_standards', title: '4. Coordinate Reference Systems (CRS)' },
    { id: 'cgi_formula', title: '5. Charging Gap Index (CGI) Formula' },
    { id: 'policy_benchmarks', title: '6. MoP 2024 Policy Benchmarks' },
    { id: 'forecasting_model', title: '7. Demand Forecasting Formulation' },
    { id: 'smart_siting_mclp', title: '8. Smart Siting & MCLP Formulation' },
    { id: 'limitations', title: '9. Engineering Assumptions & Limitations' },
    { id: 'bibliography', title: '10. Official Source Bibliography' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Methodology & Standards
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Ministry of Power (Sept 2024) & PM E-DRIVE Aligned
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
          ChargeAtlas India — Comprehensive Analytical Formulations & Standards
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Mathematically transparent, peer-reviewable methodology driving spatial gap analysis, demand forecasting, and smart siting.
        </p>
      </div>

      {/* Main Grid: Section Navigation (Left) + Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1.5 lg:col-span-1">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold px-3 py-1">Sections</div>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeSection === s.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section 1: Overview */}
          {activeSection === 'overview' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <BookOpen className="w-5 h-5" />
                <span>1. Project Overview & Research Objectives</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ChargeAtlas India is an enterprise-grade GIS analytical and decision-support platform engineered for the <strong>IIT Bombay Techfest 2026–27 EV Infrastructure Map India Challenge</strong> (in collaboration with the Ministry of Heavy Industries [MHI] and ICAT).
              </p>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="font-semibold text-white">Core Research Objectives:</div>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Link authentic RTO vehicle registrations to physical geocoded public charging facilities.</li>
                  <li>Identify geographical charging deficits using multi-criteria spatial indexes rather than simple per-capita counts.</li>
                  <li>Benchmark national highway networks and urban municipal areas against the <em>Ministry of Power (MoP) September 2024 Revised Guidelines</em>.</li>
                  <li>Provide transparent, evidence-backed candidate site recommendations using Maximal Covering Location Problem (MCLP) algorithms.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 2: Geographic Scope */}
          {activeSection === 'geographic_scope' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                <Compass className="w-5 h-5" />
                <span>2. 3-Tier Geographic Scope</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400">Level 1: All-India</div>
                  <p className="text-slate-400">Pan-India state-wise EV adoption intensity, national public charging directory (BEE EV Yatra), and interstate corridor benchmarks.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400">Level 2: Maharashtra</div>
                  <p className="text-slate-400">36 administrative districts; disaggregated 2W, 3W, 4W, and Bus fleet distribution (886,752 EVs); 68 verified public charging points.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="font-bold text-purple-400">Level 3: Micro Focus</div>
                  <p className="text-slate-400"><strong>Pune Urban:</strong> 516.18 km² municipal area, 607 metric 1km² cells.<br /><strong>Samruddhi Mahamarg:</strong> 701 km expressway, 17 interchanges, 20km buffer.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Data Provenance */}
          {activeSection === 'data_provenance' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <ShieldCheck className="w-5 h-5" />
                <span>3. Data Provenance & Cryptographic Verification</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under the platform's <strong>Absolute Data Authenticity Rule</strong>, all production analytics are computed strictly from verified primary government sources. Synthetic demonstration datasets are strictly isolated (`is_synthetic = True`) and excluded from analytical pipelines.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                <div>Verification Standards Enforced:</div>
                <div className="text-emerald-400">&bull; Cryptographic Hash: SHA-256 computed for every dataset file.</div>
                <div className="text-cyan-400">&bull; Bounding Box: Latitude 6.0&deg;–38.0&deg; N, Longitude 68.0&deg;–98.0&deg; E.</div>
                <div className="text-amber-400">&bull; Deduplication: Haversine distance (&lt;100m) + RapidFuzz string similarity (&ge;65%).</div>
              </div>
            </div>
          )}

          {/* Section 4: CRS Standards */}
          {activeSection === 'crs_standards' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Layers className="w-5 h-5" />
                <span>4. Coordinate Reference Systems (CRS) Standards</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Accurate spatial distance and area calculations require mathematically rigorous CRS management. Standard Web Mercator (EPSG:3857) introduces severe areal distortion away from the equator and is restricted strictly to visual web-map rendering.
              </p>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">CRS Code</th>
                      <th className="py-2.5 px-3">Name / Projection</th>
                      <th className="py-2.5 px-3">Role in Platform</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">EPSG:4326</td>
                      <td className="py-2.5 px-3">WGS 84 (Geographic Lat/Lon)</td>
                      <td className="py-2.5 px-3 text-slate-400">Database storage & GeoJSON serialization.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">EPSG:32643</td>
                      <td className="py-2.5 px-3">UTM Zone 43N (Transverse Mercator)</td>
                      <td className="py-2.5 px-3 text-slate-400">Metric distance (meters), 1km² urban grid generation, 20km highway buffering.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-400">EPSG:3857</td>
                      <td className="py-2.5 px-3">Web Mercator (Spherical)</td>
                      <td className="py-2.5 px-3 text-slate-400">Frontend MapLibre GL JS raster tile display only.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: CGI Formula */}
          {activeSection === 'cgi_formula' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Scale className="w-5 h-5" />
                <span>5. Charging Gap Index (CGI) Mathematical Formulation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The Charging Gap Index (CGI) produces a standardized score from <strong>0.0 (Adequate Initial Deployment)</strong> to <strong>100.0 (Critical Infrastructure Void)</strong> using four weighted, normalized sub-indicators:
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 space-y-2">
                <div>CGI(d) = 0.35 &times; Norm(Gap_EV/Charger) + 0.25 &times; Norm(Gap_Spatial) + 0.20 &times; Norm(Gap_PerCapita) + 0.20 &times; Norm(Gap_MoPPolicy)</div>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <div><strong>1. EV-to-Charger Ratio Gap (35% Weight):</strong> Ratio of registered EVs to verified public charging points. When public chargers = 0, assigned maximum gap score (100.0).</div>
                <div><strong>2. Spatial Coverage Gap (25% Weight):</strong> Station density per 1,000 km² of district land area.</div>
                <div><strong>3. Per-Capita Availability Gap (20% Weight):</strong> Charging points per 100,000 population relative to a planning norm of 5 chargers / 100k citizens.</div>
                <div><strong>4. MoP 2024 Policy Deficit (20% Weight):</strong> Shortfall from recommended urban cluster baseline capacity.</div>
              </div>
            </div>
          )}

          {/* Section 6: Policy Benchmarks */}
          {activeSection === 'policy_benchmarks' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <FileCheck className="w-5 h-5" />
                <span>6. Ministry of Power (MoP) Guidelines (17 Sept 2024)</span>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Clause 11(1)(a) — Urban Siting Density Target:</div>
                  <div className="text-slate-400">"In urban areas, the target shall be to provide at least one charging station within a 1 km &times; 1 km grid by <strong>FY 2029-30 (FY 2030)</strong>." Evaluated in Pune Urban Region with 4.9% effective compliance.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Clause 11(1)(b) — Highway Spacing Standard:</div>
                  <div className="text-slate-400">"On highways and expressways, charging stations should be installed at a distance of every 20 km on both sides." Evaluated on Samruddhi Mahamarg with 27.3% compliance across 33 segments.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Clause 11(1)(c) &amp; Clause 12(7) — Long-Range &amp; Heavy-Duty Norms:</div>
                  <div className="text-slate-400">"For long range and/or heavy duty EVs, there shall be at least one fast-charging station every 100 km on each side of highways and expressways." Clause 12(7) mandates that these stations must be equipped with <strong>at least two EV chargers of minimum 240 kW each</strong> with CCS-2 connector guns or higher standard (0% current operational compliance on Samruddhi corridor).</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Forecasting */}
          {activeSection === 'forecasting_model' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <TrendingUp className="w-5 h-5" />
                <span>7. Demand Forecasting Formulation &amp; Disclaimers</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vehicle stock trajectories are computed as <strong>exploratory parametric planning scenarios</strong> (18%, 28%, 38% CAGR or user-defined sliders), not official statutory government forecasts:
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 space-y-1.5">
                <div>N(t) = K / [ 1 + e^(-r &times; (t - t_0)) ]</div>
                <div>E_daily = &Sigma; [ N_i &times; D_i &times; e_i &times; p_i ]</div>
                <div>C_demand = &lceil; E_daily / (P_rated &times; H_util &times; &eta;) &rceil;</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specific energy parameters are calibrated to the <em>NITI Aayog Handbook of Electric Vehicle Charging Infrastructure Implementation</em>: 2W (3.5 kWh/day @ 20% public dependency), 3W (10.0 kWh/day @ 40%), 4W (16.0 kWh/day @ 35%), and Bus (180.0 kWh/day @ 90%).
              </p>
            </div>
          )}

          {/* Section 8: Smart Siting MCLP */}
          {activeSection === 'smart_siting_mclp' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                <span>8. Smart Siting & Maximal Covering Location Problem (MCLP)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Candidate charging station locations are ranked to maximize unserved EV demand within a maximum service radius (S = 1.0 km in urban wards, S = 20.0 km along highways) subject to electrical grid feasibility constraints:
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 space-y-1">
                <div>Maximize: &Sigma; [ w_i &times; y_i ]</div>
                <div>Subject to: y_i &le; &Sigma; [ a_ij &times; x_j ] &forall; i &in; Demand Nodes</div>
                <div>&Sigma; [ x_j ] &le; P_budget (Station installation quota)</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every candidate site is audited against proximity to 11kV/33kV distribution substations to prevent recommending electrically infeasible installations.
              </p>
            </div>
          )}

          {/* Section 9: Limitations */}
          {activeSection === 'limitations' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Info className="w-4 h-4" />
                <span>9. Engineering Assumptions & Limitations</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div>&bull; <strong>Private & Home Charging:</strong> Captive residential chargers are excluded from public density metrics.</div>
                <div>&bull; <strong>Boundary Resolution:</strong> Palghar district is analyzed within the Thane-Palghar contiguous polygon in Census 2011 boundaries.</div>
                <div>&bull; <strong>Directional Highway Carriageways:</strong> Carriageway side access is preserved as unverified unless physical median crossovers are confirmed.</div>
                <div>&bull; <strong>Real-Time Socket Telemetry:</strong> Live OCPP socket occupancy is unverified without CPO API keys; stations are rated on nameplate operational standing.</div>
              </div>
            </div>
          )}

          {/* Section 10: Bibliography */}
          {activeSection === 'bibliography' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <BookOpen className="w-5 h-5" />
                <span>10. Official Source Bibliography</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="font-bold text-white">Ministry of Power (MoP), Government of India (Sept 2024):</div>
                  <div className="text-slate-400">"Revised Guidelines and Standards for Charging Infrastructure for Electric Vehicles", No. 12/2/2018-EV (Pt.IV).</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="font-bold text-white">Ministry of Road Transport and Highways (MoRTH):</div>
                  <div className="text-slate-400">VAHAN 4 National Vehicle Register — Maharashtra District-wise EV Registrations (2024).</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="font-bold text-white">Bureau of Energy Efficiency (BEE):</div>
                  <div className="text-slate-400">EV Yatra National Public Charging Station Directory (2024).</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="font-bold text-white">Maharashtra State Road Development Corporation (MSRDC):</div>
                  <div className="text-slate-400">Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg Project Survey & Interchange Register.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MethodologyPage;
