import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  FileText,
  X
} from 'lucide-react';

export const Sidebar = ({ mobileMenuOpen = false, onCloseMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationGroups = [
    {
      group: "Foundational GIS Maps",
      items: [
        { path: '/', label: 'Overview Dashboard', icon: LayoutDashboard, badge: null },
        { path: '/national-map', label: 'National Map (India)', icon: Map, badge: 'Level 1' },
        { path: '/maharashtra', label: 'Maharashtra Analysis', icon: Compass, badge: '36 Dist.' }
      ]
    },
    {
      group: "Corridor & Micro-Grid",
      items: [
        { path: '/pune-grid', label: 'Pune Urban 1km² Grid', icon: Crosshair, badge: 'UTM 43N' },
        { path: '/samruddhi-corridor', label: 'Samruddhi Mahamarg', icon: Milestone, badge: '701 km' }
      ]
    },
    {
      group: "Analytical Decision Engines",
      items: [
        { path: '/forecasting', label: 'Demand Forecasting', icon: TrendingUp, badge: '2027/30' },
        { path: '/site-recommendations', label: 'Smart Site Recommender', icon: Sparkles, badge: 'MCLP' }
      ]
    },
    {
      group: "Governance & Science",
      items: [
        { path: '/data-management', label: 'Data Management', icon: Database, badge: 'Provenance' },
        { path: '/methodology', label: 'Methodology & Standards', icon: BookOpen, badge: 'Specs' }
      ]
    }
  ];

  const currentPath = location.pathname;

  const isItemActive = (path) => {
    if (path === '/') return currentPath === '/';
    if (path === '/maharashtra') {
      return currentPath === '/maharashtra' || currentPath.startsWith('/districts');
    }
    return currentPath === path || currentPath.startsWith(path);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={onCloseMobileMenu}
          className="md:hidden fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={`
        fixed md:static top-16 bottom-0 left-0 z-40 w-64 border-r border-navy-800 bg-navy-900 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="py-4 overflow-y-auto px-2 space-y-4">
          {navigationGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-grey font-mono">
                  {grp.group}
                </span>
              </div>

              {grp.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? 'bg-accent-teal/15 text-white border-l-2 border-accent-teal shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-navy-800 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-accent-teal' : 'text-muted-grey'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        active ? 'bg-accent-teal/20 text-white' : 'bg-navy-800 text-muted-grey border border-navy-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* MoP 2024 Siting Guidelines Reference Card */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/40">
          <div className="p-2.5 rounded-md bg-navy-850 border border-navy-700 text-slate-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-accent-teal">
              <FileText className="w-3.5 h-3.5" />
              <span>MoP 2024 Siting Norms</span>
            </div>
            <p className="text-[10px] text-muted-grey leading-relaxed space-y-0.5">
              <span className="block">&bull; 1 station / 1 km&sup2; urban grid (by 2030)</span>
              <span className="block">&bull; 1 station / 20 km expressway (both sides)</span>
              <span className="block">&bull; Fast charging / 100 km (&ge;2x 240 kW)</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
