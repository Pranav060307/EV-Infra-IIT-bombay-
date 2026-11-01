import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Crosshair, 
  Milestone, 
  TrendingUp, 
  Sparkles, 
  Database, 
  BookOpen, 
  FileText
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'national-map', label: 'National Map (India)', icon: Map, badge: 'Level 1' },
    { id: 'maharashtra', label: 'Maharashtra Analysis', icon: Compass, badge: 'Level 2' },
    { id: 'pune', label: 'Pune Urban Grid (1km²)', icon: Crosshair, badge: 'Level 3' },
    { id: 'samruddhi', label: 'Samruddhi Corridor', icon: Milestone, badge: 'Level 3' },
    { id: 'forecasting', label: 'Demand Forecasting', icon: TrendingUp, badge: '2027/30' },
    { id: 'recommendations', label: 'Site Recommender', icon: Sparkles, badge: 'MCLP' },
    { id: 'data-management', label: 'Data Management', icon: Database, badge: 'ETL' },
    { id: 'methodology', label: 'Methodology & About', icon: BookOpen, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/95 flex flex-col justify-between shrink-0">
      <div className="py-4">
        <div className="px-4 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Navigation Modules
          </span>
        </div>

        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Siting Guidelines Footer Box */}
      <div className="p-4 border-t border-slate-900">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>MoP 2024 Siting Norms</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • 1 station / 1 km² urban grid<br />
            • 1 station / 20 km highway<br />
            • Fast charger / 100 km (buses)
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

