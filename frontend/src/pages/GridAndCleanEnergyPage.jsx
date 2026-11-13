import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Zap, 
  Battery, 
  Truck, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Gauge, 
  DollarSign, 
  Layers, 
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { 
  calculateStationQueue, 
  calculateSolarCanopyBESS, 
  calculateV2GPeakShaving, 
  calculateFreightMCS 
} from '../services/cleanEnergyEngine';

export const GridAndCleanEnergyPage = () => {
  const [activeTab, setActiveTab] = useState('queuing'); // 'queuing' | 'solar' | 'v2g' | 'freight'

  // Tab 1: Queuing States
  const [arrivalRate, setArrivalRate] = useState(10);
  const [chargerPower, setChargerPower] = useState(60);
  const [gunCount, setGunCount] = useState(4);
  const [batterySize, setBatterySize] = useState(45);

  // Tab 2: Solar + BESS States
  const [canopyFootprintM2, setCanopyFootprintM2] = useState(1200);
  const [bessCapacity, setBessCapacity] = useState(250);
  const [dailyStationKWh, setDailyStationKWh] = useState(1800);
  const [tariffRate, setTariffRate] = useState(9.50);

  // Tab 3: V2G States
  const [v2gRegion, setV2gRegion] = useState('Pune Agglomeration');
  const [v2gFleetSize, setV2gFleetSize] = useState(38500);
  const [participationPct, setParticipationPct] = useState(12);
  const [dischargeDepthPct, setDischargeDepthPct] = useState(15);

  // Tab 4: Heavy-Duty Freight MCS States
  const [truckCorridor, setTruckCorridor] = useState('Samruddhi Mahamarg (Nagpur–Mumbai)');
  const [dailyTrucks, setDailyTrucks] = useState(220);
  const [mcsPowerKW, setMcsPowerKW] = useState(1200);

  // Calculations
  const queueResult = useMemo(() => {
    return calculateStationQueue({
      arrivalRatePerHour: arrivalRate,
      chargerPowerKW: chargerPower,
      numGuns: gunCount,
      avgBatteryKWh: batterySize,
      startSocPct: 20,
      targetSocPct: 80
    });
  }, [arrivalRate, chargerPower, gunCount, batterySize]);

  const solarResult = useMemo(() => {
    return calculateSolarCanopyBESS({
      canopyAreaM2: canopyFootprintM2,
      bessCapacityKWh: bessCapacity,
      dailyStationDemandKWh: dailyStationKWh,
      commercialTariffPerKWh: tariffRate
    });
  }, [canopyFootprintM2, bessCapacity, dailyStationKWh, tariffRate]);

  const v2gResult = useMemo(() => {
    return calculateV2GPeakShaving({
      region: v2gRegion,
      registeredEvCount: v2gFleetSize,
      participationPct,
      dischargeDepthPct,
      v2gPowerKW: 11.0
    });
  }, [v2gRegion, v2gFleetSize, participationPct, dischargeDepthPct]);

  const freightResult = useMemo(() => {
    return calculateFreightMCS({
      corridorName: truckCorridor,
      corridorLengthKm: 701.0,
      dailyElectricTrucks: dailyTrucks,
      avgTruckBatteryKWh: 500.0,
      mcsGunPowerKW: mcsPowerKW
    });
  }, [truckCorridor, dailyTrucks, mcsPowerKW]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent-green/15 text-accent-green rounded border border-accent-green/30 font-mono">
              Decarbonization & Grid Stress
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-navy-800 text-slate-300 rounded border border-navy-700 font-mono">
              Erlang-C & MNRE Solar
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Grid Impact, Clean Energy & Station Congestion Modeler
          </h1>
          <p className="text-xs text-muted-grey mt-0.5 max-w-3xl leading-relaxed">
            Rigorous mathematical modeling of station wait-time queues via <span className="text-slate-200 font-mono">M/M/c/K</span> Erlang theory, 
            solar PV canopy + BESS co-location feasibility, Vehicle-to-Grid (V2G) peak shaving, and Megawatt Charging (MCS) for freight corridors.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-navy-900 p-1.5 rounded-xl border border-navy-800">
          <button
            onClick={() => setActiveTab('queuing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'queuing' ? 'bg-accent-teal text-navy-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Queuing Congestion
          </button>
          <button
            onClick={() => setActiveTab('solar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'solar' ? 'bg-accent-amber text-navy-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Solar + BESS
          </button>
          <button
            onClick={() => setActiveTab('v2g')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'v2g' ? 'bg-accent-green text-navy-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            V2G Peak Shaving
          </button>
          <button
            onClick={() => setActiveTab('freight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'freight' ? 'bg-sky-500 text-navy-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Megawatt Freight (MCS)
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: QUEUING THEORY & STATION CONGESTION ENGINE */}
      {/* ==================================================================== */}
      {activeTab === 'queuing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-1 p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-accent-teal" />
                  Erlang-C Parameters
                </span>
                <span className="text-[10px] text-muted-grey font-mono">M/M/c/K Model</span>
              </div>

              {/* Arrival Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Arrival Rate (&lambda;):</span>
                  <span className="text-white font-mono font-bold">{arrivalRate} EVs / hour</span>
                </div>
                <input 
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={arrivalRate}
                  onChange={(e) => setArrivalRate(Number(e.target.value))}
                  className="w-full accent-accent-teal h-1.5 bg-navy-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-grey">
                  <span>2 (Late Night)</span>
                  <span>10 (Afternoon)</span>
                  <span>25 (Rush Hour Peak)</span>
                </div>
              </div>

              {/* Number of Parallel Guns */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Parallel Charging Guns (c):</span>
                  <span className="text-accent-teal font-mono font-bold">{gunCount} Dispensers</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={gunCount}
                  onChange={(e) => setGunCount(Number(e.target.value))}
                  className="w-full accent-accent-teal h-1.5 bg-navy-800 rounded cursor-pointer"
                />
              </div>

              {/* Gun Power */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Rated Power per Gun:</label>
                <div className="grid grid-cols-4 gap-1">
                  {[30, 60, 120, 240].map(kw => (
                    <button
                      key={kw}
                      onClick={() => setChargerPower(kw)}
                      className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                        chargerPower === kw
                          ? 'bg-accent-teal/20 border-accent-teal text-white font-bold'
                          : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {kw} kW
                    </button>
                  ))}
                </div>
              </div>

              {/* Battery Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Avg Fleet Battery:</span>
                  <span className="text-white font-mono">{batterySize} kWh</span>
                </div>
                <input 
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  value={batterySize}
                  onChange={(e) => setBatterySize(Number(e.target.value))}
                  className="w-full accent-accent-teal h-1.5 bg-navy-800 rounded cursor-pointer"
                />
              </div>

              {/* Mathematical Formulation Note */}
              <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 text-[10px] text-muted-grey space-y-1">
                <div className="font-semibold text-slate-300">Erlang-C Formula:</div>
                <div className="font-mono text-accent-teal">P_wait = [ (c&rho;)^c / (c!(1-&rho;)) ] &middot; P0</div>
                <p>Calculates the probability that arriving drivers experience queuing delay based on service rate &mu; = 1/dwell time.</p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* Congestion Alert Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                queueResult.metrics.isUnstable 
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : queueResult.metrics.avgQueueWaitMinutes > 15
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-white">
                      Station Status: {queueResult.metrics.congestionLevel}
                    </div>
                    <div className="text-[11px] opacity-90">
                      Traffic Intensity (&rho;): {queueResult.metrics.trafficIntensityRho} &bull; Utilization: {queueResult.metrics.utilizationPct}%
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs hidden sm:block">
                  <span className="block text-[10px] uppercase opacity-75">Sizing Norm</span>
                  <span className="font-bold text-white">Needs &ge; {queueResult.metrics.recommendedGuns} Guns</span>
                </div>
              </div>

              {/* 4 Performance Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Wait Probability</span>
                  <div className="text-xl font-bold text-white font-mono">{queueResult.metrics.waitProbabilityPct}%</div>
                  <span className="text-[10px] text-muted-grey">P(Delay &gt; 0)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Avg Queue Wait</span>
                  <div className={`text-xl font-bold font-mono ${queueResult.metrics.avgQueueWaitMinutes > 15 ? 'text-rose-400' : 'text-accent-teal'}`}>
                    {queueResult.metrics.avgQueueWaitMinutes} min
                  </div>
                  <span className="text-[10px] text-muted-grey">W_q in line</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Charging Service</span>
                  <div className="text-xl font-bold text-white font-mono">{queueResult.inputs.serviceTimeMinutes} min</div>
                  <span className="text-[10px] text-muted-grey">20% to 80% SoC</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Total Turnaround</span>
                  <div className="text-xl font-bold text-accent-green font-mono">{queueResult.metrics.totalDwellMinutes} min</div>
                  <span className="text-[10px] text-muted-grey">Wait + Charge</span>
                </div>
              </div>

              {/* Engineering Siting Insight Card */}
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent-teal" />
                  <span>IIT Bombay Techfest Jury Takeaway</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Government tenders frequently specify a minimum of 2 guns per station to satisfy superficial guidelines. 
                  However, Erlang-C queuing analysis reveals that when peak arrival &lambda; reaches {arrivalRate} vehicles/hour, 
                  a 2-gun 60 kW station suffers mathematically unavoidable queue lockup (&rho; &gt; 1.0), with drivers waiting 
                  over 45 minutes. ChargeAtlas India's smart recommender incorporates Erlang-C capacity planning to size 
                  expressway and urban candidate parcels with a minimum of <strong>{queueResult.metrics.recommendedGuns} parallel dispensers</strong> 
                  to guarantee queuing wait times remain below 10 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: SOLAR PV CANOPY + BESS TECHNO-ECONOMIC MODELER */}
      {/* ==================================================================== */}
      {activeTab === 'solar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-1 p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-accent-amber" />
                  Canopy Sizing
                </span>
                <span className="text-[10px] text-muted-grey font-mono">MNRE Standards</span>
              </div>

              {/* Canopy Footprint */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Parking Canopy Area:</span>
                  <span className="text-accent-amber font-mono font-bold">{canopyFootprintM2} m&sup2;</span>
                </div>
                <input 
                  type="range"
                  min="300"
                  max="3000"
                  step="100"
                  value={canopyFootprintM2}
                  onChange={(e) => setCanopyFootprintM2(Number(e.target.value))}
                  className="w-full accent-accent-amber h-1.5 bg-navy-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-grey">
                  <span>300 m&sup2; (10 bays)</span>
                  <span>1200 m&sup2; (40 bays)</span>
                  <span>3000 m&sup2; (Hub)</span>
                </div>
              </div>

              {/* BESS Battery Storage */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">BESS Storage Capacity:</span>
                  <span className="text-white font-mono font-bold">{bessCapacity} kWh</span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="600"
                  step="25"
                  value={bessCapacity}
                  onChange={(e) => setBessCapacity(Number(e.target.value))}
                  className="w-full accent-accent-amber h-1.5 bg-navy-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-grey">
                  <span>50 kWh (Buffering)</span>
                  <span>250 kWh (Peak Shave)</span>
                  <span>600 kWh (Islanded)</span>
                </div>
              </div>

              {/* Commercial Tariff */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">MSEDCL HT Tariff:</span>
                  <span className="text-white font-mono font-bold">&pound;{tariffRate} / kWh</span>
                </div>
                <input 
                  type="range"
                  min="7.50"
                  max="12.50"
                  step="0.50"
                  value={tariffRate}
                  onChange={(e) => setTariffRate(Number(e.target.value))}
                  className="w-full accent-accent-amber h-1.5 bg-navy-800 rounded cursor-pointer"
                />
              </div>

              {/* Solar Insolation Badge */}
              <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 text-[10px] text-muted-grey space-y-1">
                <div className="font-semibold text-slate-300">Maharashtra Solar Benchmark:</div>
                <p>MNRE National Solar R&D: 5.4 kWh/m&sup2;/day with 330 clear sunshine days in Vidarbha/Marathwada regions.</p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* 4 Financial & Clean Energy KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Solar Capacity</span>
                  <div className="text-xl font-bold text-accent-amber font-mono">{solarResult.systemSizing.solarKWp} kWp</div>
                  <span className="text-[10px] text-muted-grey">Daily: {solarResult.systemSizing.dailySolarYieldKWh} kWh</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Levelized Cost (LCOE)</span>
                  <div className="text-xl font-bold text-accent-green font-mono">&#8377;{solarResult.economics.levelizedCostPerKWh}</div>
                  <span className="text-[10px] text-muted-grey">vs &#8377;{tariffRate} Grid</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Annual Savings</span>
                  <div className="text-xl font-bold text-white font-mono">&#8377;{solarResult.economics.annualSavingsLakhs} Lakhs</div>
                  <span className="text-[10px] text-muted-grey">Payback: {solarResult.economics.paybackYears} yrs</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">CO2 Decarbonization</span>
                  <div className="text-xl font-bold text-accent-teal font-mono">{solarResult.environmental.annualCO2AbatedTonnes} T/yr</div>
                  <span className="text-[10px] text-muted-grey">{solarResult.environmental.equivalentTreesPlanted} trees equiv.</span>
                </div>
              </div>

              {/* Detailed Techno-Economic Breakdown */}
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Techno-Economic Investment Summary</span>
                  <span className="text-[10px] font-mono text-accent-amber">Total CapEx: &#8377;{solarResult.economics.totalCapexLakhs} Lakhs</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
                    <span className="text-[10px] text-muted-grey uppercase">Solar Canopy CapEx</span>
                    <div className="text-base font-bold text-white font-mono">&#8377;{solarResult.economics.solarCapexLakhs} Lakhs</div>
                    <span className="text-[9px] text-muted-grey">&#8377;42,000 / kWp installed</span>
                  </div>

                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
                    <span className="text-[10px] text-muted-grey uppercase">BESS Battery CapEx</span>
                    <div className="text-base font-bold text-white font-mono">&#8377;{solarResult.economics.bessCapexLakhs} Lakhs</div>
                    <span className="text-[9px] text-muted-grey">&#8377;22,000 / kWh LFP cells</span>
                  </div>

                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
                    <span className="text-[10px] text-muted-grey uppercase">Green Self-Sufficiency</span>
                    <div className="text-base font-bold text-accent-green font-mono">{solarResult.environmental.greenSelfSufficiencyPct}%</div>
                    <span className="text-[9px] text-muted-grey">Solar + BESS of station load</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                  Co-locating a {solarResult.systemSizing.solarKWp} kWp solar canopy with a {bessCapacity} kWh BESS 
                  buffers daytime solar energy to serve high-tariff evening peak EV charging (6:00 PM – 10:00 PM), 
                  delivering power at an LCOE of &#8377;{solarResult.economics.levelizedCostPerKWh}/kWh compared to MSEDCL's commercial 
                  rate of &#8377;{tariffRate}/kWh and generating a simple capital payback in {solarResult.economics.paybackYears} years.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: VEHICLE-TO-GRID (V2G) & VIRTUAL POWER PLANT (VPP) */}
      {/* ==================================================================== */}
      {activeTab === 'v2g' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-1 p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-accent-green" />
                  V2G Parameters
                </span>
                <span className="text-[10px] text-muted-grey font-mono">DisCom Peak Window</span>
              </div>

              {/* Region Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Target Urban Cluster:</label>
                <select
                  value={v2gRegion}
                  onChange={(e) => {
                    const r = e.target.value;
                    setV2gRegion(r);
                    if (r === 'Pune Agglomeration') setV2gFleetSize(38500);
                    else if (r === 'Mumbai MMR') setV2gFleetSize(52000);
                    else setV2gFleetSize(14200);
                  }}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-green"
                >
                  <option value="Pune Agglomeration">Pune Agglomeration (38,500 EVs)</option>
                  <option value="Mumbai MMR">Mumbai MMR (52,000 EVs)</option>
                  <option value="Nagpur NMC">Nagpur Municipal (14,200 EVs)</option>
                </select>
              </div>

              {/* Participation Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Fleet Participation:</span>
                  <span className="text-accent-green font-mono font-bold">{participationPct}%</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={participationPct}
                  onChange={(e) => setParticipationPct(Number(e.target.value))}
                  className="w-full accent-accent-green h-1.5 bg-navy-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-grey">
                  <span>5% (Conservative)</span>
                  <span>12% (Realistic)</span>
                  <span>30% (Aggressive VPP)</span>
                </div>
              </div>

              {/* Discharge Depth */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Allowed DoD Discharge:</span>
                  <span className="text-white font-mono font-bold">{dischargeDepthPct}%</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={dischargeDepthPct}
                  onChange={(e) => setDischargeDepthPct(Number(e.target.value))}
                  className="w-full accent-accent-green h-1.5 bg-navy-800 rounded cursor-pointer"
                />
                <div className="text-[9px] text-muted-grey">Preserves battery health (&le;15% daily cycle)</div>
              </div>
            </div>

            {/* V2G Results Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Participating Fleet</span>
                  <div className="text-xl font-bold text-white font-mono">{v2gResult.participatingVehicles.toLocaleString()} EVs</div>
                  <span className="text-[10px] text-muted-grey">{participationPct}% of regional stock</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Instantaneous Peak Power</span>
                  <div className="text-xl font-bold text-accent-green font-mono">{v2gResult.metrics.instantaneousPeakPowerMW} MW</div>
                  <span className="text-[10px] text-muted-grey">Virtual Power Plant injection</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">DisCom Savings</span>
                  <div className="text-xl font-bold text-white font-mono">&#8377;{v2gResult.metrics.avoidedDisComCostCrores} Cr/yr</div>
                  <span className="text-[10px] text-muted-grey">Avoided peaker purchases</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">EV Owner Dividend</span>
                  <div className="text-xl font-bold text-accent-teal font-mono">&#8377;{v2gResult.metrics.annualOwnerDividendInr} / yr</div>
                  <span className="text-[10px] text-muted-grey">ToD tariff payout</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-green" />
                  <span>Draft National Electricity Policy 2026 Alignment</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  During Maharashtra's peak evening window (6:00 PM – 9:30 PM), MSEDCL incurs expensive spot electricity purchases 
                  exceeding &#8377;10.50/kWh. By aggregating {v2gResult.participatingVehicles.toLocaleString()} connected EVs in {v2gRegion}, 
                  a Virtual Power Plant (VPP) injects up to <strong>{v2gResult.metrics.instantaneousPeakPowerMW} MW of instantaneous green capacity</strong> 
                  back into the grid, saving DisComs &#8377;{v2gResult.metrics.avoidedDisComCostCrores} Crores annually while rewarding EV owners with an annual 
                  arbitrage dividend of &#8377;{v2gResult.metrics.annualOwnerDividendInr}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: HEAVY-DUTY FREIGHT & MEGAWATT CHARGING (MCS) */}
      {/* ==================================================================== */}
      {activeTab === 'freight' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-1 p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  Freight Parameters
                </span>
                <span className="text-[10px] text-muted-grey font-mono">MoP Clause 3.1(c)</span>
              </div>

              {/* Corridor */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Freight Corridor:</label>
                <select
                  value={truckCorridor}
                  onChange={(e) => setTruckCorridor(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Samruddhi Mahamarg (Nagpur–Mumbai)">Samruddhi Mahamarg (701 km)</option>
                  <option value="NH-48 Golden Quadrilateral (Mumbai–Pune–Kolhapur)">NH-48 Golden Quadrilateral (380 km)</option>
                </select>
              </div>

              {/* Daily Electric Trucks */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Daily Electric Trucks:</span>
                  <span className="text-sky-400 font-mono font-bold">{dailyTrucks} e-HDVs</span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="600"
                  step="10"
                  value={dailyTrucks}
                  onChange={(e) => setDailyTrucks(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-navy-800 rounded cursor-pointer"
                />
              </div>

              {/* MCS Gun Power */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Megawatt Gun Standard:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[750, 1200].map(p => (
                    <button
                      key={p}
                      onClick={() => setMcsPowerKW(p)}
                      className={`py-1.5 text-xs font-mono rounded border transition-colors ${
                        mcsPowerKW === p
                          ? 'bg-sky-500/20 border-sky-500 text-white font-bold'
                          : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p === 1200 ? '1.2 MW (MCS Standard)' : '750 kW (Dual CCS)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Required Hubs</span>
                  <div className="text-xl font-bold text-white font-mono">{freightResult.infrastructure.requiredHubCount} Plazas</div>
                  <span className="text-[10px] text-muted-grey">Both carriageways (100km)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Substation Sizing</span>
                  <div className="text-xl font-bold text-sky-400 font-mono">{freightResult.infrastructure.substationInterconnectionMva} MVA</div>
                  <span className="text-[10px] text-muted-grey">Dedicated 33kV Line</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">MCS Dwell Time</span>
                  <div className="text-xl font-bold text-accent-green font-mono">{freightResult.infrastructure.dwellTimeMinutes} min</div>
                  <span className="text-[10px] text-muted-grey">20% to 80% (300 kWh)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-muted-grey uppercase font-mono">Annual Savings / Truck</span>
                  <div className="text-xl font-bold text-accent-teal font-mono">&#8377;{freightResult.economics.annualSavingsPerTruckLakhs} L</div>
                  <span className="text-[10px] text-muted-grey">vs &#8377;28.50/km Diesel</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-400" />
                  <span>Freight Decarbonization Economics</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Electrifying commercial trucks along {freightResult.corridorName} provides the highest decarbonization return in transportation. 
                  At current commercial freight tariffs, operating an electric truck costs &#8377;9.20/km compared to &#8377;28.50/km for a diesel tractor-trailer, 
                  generating <strong>&#8377;{freightResult.economics.annualSavingsPerTruckLakhs} Lakhs in net operational fuel savings per truck annually</strong>. 
                  However, serving {dailyTrucks} trucks daily requires {freightResult.infrastructure.requiredHubCount} dedicated Megawatt Charging hubs 
                  interconnected to 33kV substations capable of delivering 3.5 MVA peak continuous capacity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridAndCleanEnergyPage;

