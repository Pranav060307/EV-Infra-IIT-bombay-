import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Award
} from 'lucide-react';

export const PITCH_SCENES = [
  {
    step: 1,
    title: "1. The Macro Crisis: Unplanned EV Proliferation",
    route: "/",
    durationSec: 45,
    keyMetrics: [
      { label: "Statewide EVs", value: "886,752" },
      { label: "Districts Analyzed", value: "36" },
      { label: "Daily Public Demand", value: "1,135 MWh" },
      { label: "Avg Vulnerability", value: "68.4% CGI" }
    ],
    teleprompter: [
      "Distinguished Jury, India's EV adoption has surged past 886,000 electric vehicles in Maharashtra alone, yet public charging infrastructure is being deployed ad-hoc without spatial intelligence.",
      "This leads to two compounding crises: severe charging deserts in suburban industrial clusters, and complete charging blackouts across expressways.",
      "ChargeAtlas India is not another consumer app like Google Maps; it is an enterprise decision-support platform designed for DisComs, MSRDC, and the Ministry of Power."
    ]
  },
  {
    step: 2,
    title: "2. Dual-UTM Geodetic Architecture vs. Web Mercator",
    route: "/methodology",
    durationSec: 40,
    keyMetrics: [
      { label: "UTM Zones", value: "43N & 44N" },
      { label: "Distortion Error", value: "< 0.04%" },
      { label: "Mercator Inflation", value: "14.8% Eliminated" },
      { label: "Grid Metric Size", value: "1,000m × 1,000m" }
    ],
    teleprompter: [
      "Standard web mapping relies on Web Mercator (EPSG:3857), which distorts surface areas and buffer distances by up to 14.8% at central Indian latitudes (19°N).",
      "Using Mercator for statutory 1 km² urban grids or 20 km highway buffers yields scientifically invalid figures.",
      "We engineered a Dual-UTM geodetic architecture: EPSG:32643 for Western Maharashtra and EPSG:32644 for Eastern Vidarbha, keeping projection distortion below 0.04% (40 cm per km)."
    ]
  },
  {
    step: 3,
    title: "3. Maharashtra 36-District Composite Gap Index (CGI)",
    route: "/maharashtra",
    durationSec: 50,
    keyMetrics: [
      { label: "Top Vulnerability", value: "Buldhana (0.89)" },
      { label: "Mature Cluster", value: "Pune (0.34)" },
      { label: "Model Baseline", value: "MoRTH VAHAN 4" },
      { label: "AHP Consistency", value: "CR < 0.10" }
    ],
    teleprompter: [
      "Moving beyond simple EV-to-charger ratios, our Composite Gap Index (CGI) integrates vehicle volume, spatial land density, population accessibility, and statutory policy deficits into a normalized 0–1 score.",
      "Notice the stark regional disparity: while Pune and Mumbai Suburban exhibit low deficits (CGI < 0.40), agricultural and freight transit districts in Marathwada and Vidarbha exceed 0.85.",
      "Decision-makers can adjust AHP weighting sliders in real time to simulate alternative policy priorities."
    ]
  },
  {
    step: 4,
    title: "4. Pune 1km² Micro-Grid & MoP Clause 11(1)(a) Compliance",
    route: "/pune-grid",
    durationSec: 50,
    keyMetrics: [
      { label: "Micro-Cells", value: "607 Cells" },
      { label: "Urban Footprint", value: "516.18 km²" },
      { label: "Direct Coverage", value: "1.65% (10 Cells)" },
      { label: "Charging Deserts", value: "293 Cells (>5km)" }
    ],
    teleprompter: [
      "Under Clause 11(1)(a) of the Ministry of Power September 2024 Guidelines, urban agglomerations require at least one public charging station in every 1 km × 1 km grid by 2030.",
      "We generated 607 metric 1 km² cells across Pune and Pimpri-Chinchwad. Currently, only 10 cells contain a direct station, and only 20 cells fall within a 1 km buffer.",
      "Over 48% of the urban area represents severe charging deserts where drivers must travel over 5 km on congested urban arteries."
    ]
  },
  {
    step: 5,
    title: "5. Samruddhi 701km Corridor & Highway EV Simulator",
    route: "/route-planner",
    durationSec: 55,
    keyMetrics: [
      { label: "Corridor Length", value: "701 km (644km Op.)" },
      { label: "Mainline Chargers", value: "0 Direct Plazas" },
      { label: "Detour Toll Penalty", value: "+18 min / Exit" },
      { label: "Elevation Delta", value: "18m to 652m" }
    ],
    teleprompter: [
      "Along the 701 km Samruddhi Mahamarg, we uncovered a critical reality: zero operational DC fast chargers exist directly on the expressway carriageway.",
      "Drivers must exit toll plazas, paying an 18-minute toll delay penalty per charging stop.",
      "Our physics-based trip simulator models real vehicles (Nexon EV, MG ZS EV, e-Buses) across Western Ghats elevation ascents and summer heat derating to schedule exact interchange stops."
    ]
  },
  {
    step: 6,
    title: "6. Optimal Siting (MCLP), Clean Solar & Cryptographic Trust",
    route: "/site-recommendations",
    durationSec: 50,
    keyMetrics: [
      { label: "Optimized Sites", value: "23 Parcels" },
      { label: "MCLP Optimality", value: "0.00% Gap (Exact)" },
      { label: "Solar LCOE", value: "₹3.45 / kWh" },
      { label: "Data Integrity", value: "SHA-256 Verified" }
    ],
    teleprompter: [
      "To resolve these deficits, our Integer Linear Programming engine solves the Maximal Covering Location Problem (MCLP) with a provable 0.00% integrality gap, selecting 23 optimal parcels connected to 33kV substations.",
      "We couple these with on-site Solar PV canopies and BESS storage, producing clean charging at ₹3.45/kWh vs. ₹9.50/kWh commercial DisCom power.",
      "Every single number in ChargeAtlas India is anchored to official government registries with cryptographic SHA-256 checksums."
    ]
  }
];

export const JuryPitchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5-minute competition timer
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentScene = PITCH_SCENES[currentStepIndex];

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isOpen && isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning, secondsRemaining]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < PITCH_SCENES.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      navigate(PITCH_SCENES[nextIdx].route);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      navigate(PITCH_SCENES[prevIdx].route);
    }
  };

  const handleJumpToScene = (idx) => {
    setCurrentStepIndex(idx);
    navigate(PITCH_SCENES[idx].route);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Top Header: Title, Competition Timer & Close */}
        <div className="px-5 py-3.5 bg-navy-950 border-b border-navy-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 shadow-md">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-bold text-white tracking-wide font-mono uppercase">
                  Techfest Live Jury Presentation Companion
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Scene {currentStepIndex + 1} of {PITCH_SCENES.length}
                </span>
              </div>
              <div className="text-[11px] text-muted-grey">Team SuperNova &bull; Sanjivani University</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Competition Pitch Clock */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-navy-900 border border-navy-700 font-mono text-xs">
              <Clock className={`w-3.5 h-3.5 ${secondsRemaining < 60 ? 'text-rose-400 animate-pulse' : 'text-accent-teal'}`} />
              <span className={`font-bold ${secondsRemaining < 60 ? 'text-rose-400' : 'text-white'}`}>
                {formatTime(secondsRemaining)}
              </span>
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                className="text-muted-grey hover:text-white"
                title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button 
                onClick={() => setSecondsRemaining(300)} 
                className="text-muted-grey hover:text-white"
                title="Reset to 5:00"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg border border-navy-700 text-muted-grey hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-6 border-b border-navy-800 bg-navy-950/40 text-center text-[10px] font-mono shrink-0">
          {PITCH_SCENES.map((scene, idx) => (
            <button
              key={idx}
              onClick={() => handleJumpToScene(idx)}
              className={`py-2 px-1 border-r border-navy-800 last:border-r-0 truncate transition-colors ${
                currentStepIndex === idx 
                  ? 'bg-accent-teal/15 text-accent-teal font-bold border-b-2 border-b-accent-teal'
                  : currentStepIndex > idx
                  ? 'text-slate-400 hover:text-white'
                  : 'text-muted-grey hover:text-slate-300'
              }`}
            >
              {idx + 1}. {scene.title.split(':')[0].replace(/^\d+\.\s*/, '')}
            </button>
          ))}
        </div>

        {/* Modal Body: Active Scene Presentation Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Scene Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-teal" />
              <span>{currentScene.title}</span>
            </h2>

            <button
              onClick={() => {
                navigate(currentScene.route);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent-teal/15 hover:bg-accent-teal/25 text-accent-teal text-xs font-semibold border border-accent-teal/30 transition-colors self-start sm:self-auto"
            >
              <span>View Full Module ({currentScene.route})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Key Numerical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentScene.keyMetrics.map((km, kIdx) => (
              <div key={kIdx} className="p-2.5 rounded-xl bg-navy-950 border border-navy-800 space-y-0.5">
                <span className="text-[10px] text-muted-grey uppercase tracking-wider font-mono block">
                  {km.label}
                </span>
                <span className="text-base font-bold text-white font-mono block">
                  {km.value}
                </span>
              </div>
            ))}
          </div>

          {/* Speaker Teleprompter Card */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-mono uppercase tracking-wider border-b border-navy-800 pb-1.5">
              <span className="flex items-center gap-1.5 text-accent-teal">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Speaker Talking Points (Read Aloud to Jury)
              </span>
              <span className="text-[10px] text-muted-grey">Target: ~{currentScene.durationSec}s</span>
            </div>

            <div className="space-y-2 text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
              {currentScene.teleprompter.map((point, pIdx) => (
                <div key={pIdx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-[10px] font-bold text-accent-teal shrink-0 mt-0.5 font-mono">
                    {pIdx + 1}
                  </span>
                  <p className="flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="px-5 py-3 bg-navy-950 border-t border-navy-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentStepIndex === 0 
                ? 'opacity-40 cursor-not-allowed text-muted-grey' 
                : 'bg-navy-800 hover:bg-navy-700 text-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Scene</span>
          </button>

          <div className="text-xs text-muted-grey font-mono hidden sm:block">
            Keyboard: Use Arrow Keys &bull; Press ESC to close
          </div>

          {currentStepIndex < PITCH_SCENES.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-accent-teal hover:bg-accent-teal/90 text-navy-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <span>Next Scene</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Conclude Presentation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JuryPitchModal;

