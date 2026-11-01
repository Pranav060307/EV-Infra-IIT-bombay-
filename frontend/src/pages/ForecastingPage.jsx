import React from 'react';
import { TrendingUp, Sliders } from 'lucide-react';

export const ForecastingPage = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Module 3: Demand Forecasting
            </span>
            <span className="text-xs text-slate-400">CAGR & Logistic S-Curve Models</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            EV Adoption & Charger Demand Forecasting
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate 2027 and 2030 vehicle stock, daily charging energy (kWh), and required charging points across Low, Base, and High adoption scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Scenario: Base Adoption</span>
        </div>
      </div>

      <div className="w-full h-96 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Forecasting & Energy Demand Simulator</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          Interactive sliders for vehicle km/day, public charging share, charger power (kW), and utilization hours will be active in Phase 4.
        </p>
      </div>
    </div>
  );
};

export default ForecastingPage;

