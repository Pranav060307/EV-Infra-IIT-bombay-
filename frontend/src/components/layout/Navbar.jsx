import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap, 
  Database, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Activity,
  Award
} from 'lucide-react';
import DataStatusBadge from '../common/DataStatusBadge';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ backendStatus, isSynthetic = false, onToggleMobileMenu, mobileMenuOpen }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const isSqlite = backendStatus?.database?.engine 
    ? backendStatus.database.engine.toLowerCase().includes('sqlite') 
    : false;

  const isDemo = backendStatus?.data_mode?.is_synthetic_demo ?? isSynthetic;

  // Searchable Quick Targets (Districts & Key Corridors)
  const quickTargets = [
    { label: 'Pune District Analysis', path: '/districts/Pune', type: 'District' },
    { label: 'Mumbai Suburban Analysis', path: '/districts/Mumbai Suburban', type: 'District' },
    { label: 'Thane District Analysis', path: '/districts/Thane', type: 'District' },
    { label: 'Nagpur District Analysis', path: '/districts/Nagpur', type: 'District' },
    { label: 'Nashik District Analysis', path: '/districts/Nashik', type: 'District' },
    { label: 'Chhatrapati Sambhajinagar', path: '/districts/Chhatrapati Sambhajinagar', type: 'District' },
    { label: 'Kolhapur District Analysis', path: '/districts/Kolhapur', type: 'District' },
    { label: 'Pune Urban 1km² Micro-Grid', path: '/pune-grid', type: 'Urban Grid' },
    { label: 'Samruddhi Mahamarg 701km Corridor', path: '/samruddhi-corridor', type: 'Expressway' },
    { label: '2027/2030 EV Demand Forecasting', path: '/forecasting', type: 'Forecasting' },
    { label: 'MCLP Candidate Site Recommender', path: '/site-recommendations', type: 'Smart Siting' },
    { label: 'Data Management & Source Register', path: '/data-management', type: 'Data Governance' },
  ];

  const filteredTargets = searchQuery.trim() 
    ? quickTargets.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelectTarget = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
  };

  // Generate clean breadcrumb text
  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/') return 'Overview Dashboard';
    if (p.startsWith('/national-map')) return 'National EV Map (India)';
    if (p.startsWith('/districts/') || p.startsWith('/maharashtra/districts/')) {
      const dist = decodeURIComponent(p.split('/').pop());
      return `Maharashtra > ${dist} District`;
    }
    if (p.startsWith('/maharashtra') || p.startsWith('/districts')) return 'Maharashtra Analysis (36 Districts)';
    if (p.startsWith('/pune')) return 'Pune Urban Agglomeration (1km² Grid)';
    if (p.startsWith('/samruddhi')) return 'Samruddhi Mahamarg (701km Corridor)';
    if (p.startsWith('/forecasting')) return 'EV Demand Forecasting (2027 / 2030)';
    if (p.startsWith('/site-recommendations') || p.startsWith('/recommendations')) return 'Candidate Site Recommender (MCLP)';
    if (p.startsWith('/data-management')) return 'Data Management & Provenance';
    if (p.startsWith('/methodology')) return 'Scientific Methodology & Standards';
    return 'Decision Support';
  };

  return (
    <header className="h-16 border-b border-navy-800 bg-navy-900 sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Brand Identity & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg border border-navy-700 text-slate-300 hover:text-white hover:bg-navy-800"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity">
          <div className="w-9 h-9 rounded-md bg-accent-teal flex items-center justify-center text-white font-black shadow-sm">
            <Zap className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-white font-mono">
                CHARGEATLAS <span className="text-accent-teal">INDIA</span>
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-navy-800 text-slate-300 rounded border border-navy-700">
                IIT Bombay Techfest
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-grey">
              <span className="hidden md:inline">Module:</span>
              <span className="text-slate-300 font-medium truncate max-w-[200px] md:max-w-none">
                {getBreadcrumb()}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Global Search Bar (Dropdown on focus) */}
      <div className="relative hidden md:block max-w-xs w-full mx-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-grey absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search districts, corridors, models..."
            className="w-full bg-navy-950/80 border border-navy-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-muted-grey focus:outline-none focus:border-accent-teal transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-grey hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && filteredTargets.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-navy-900 border border-navy-700 rounded-lg shadow-xl py-1 z-50 max-h-64 overflow-y-auto">
            {filteredTargets.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTarget(item.path)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-navy-800 flex items-center justify-between text-slate-200 transition-colors"
              >
                <span>{item.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-800 text-muted-grey border border-navy-700">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Action & Status Bar */}
      <div className="flex items-center gap-2.5">
        {/* Data Governance Status Badge */}
        <DataStatusBadge isSynthetic={isDemo} qualityScore={98} />

        {/* Database Engine Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-800 border border-navy-700 text-[11px]">
          <Database className={`w-3.5 h-3.5 ${isSqlite ? 'text-accent-amber' : 'text-accent-green'}`} />
          <span className="text-slate-300 font-mono">
            {isSqlite ? 'SQLite Dev' : 'PostgreSQL 18 + PostGIS'}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-navy-700 bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle visual theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-accent-amber" /> : <Moon className="w-4 h-4 text-accent-teal" />}
        </button>

        {/* Team SuperNova Citation */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 bg-navy-800 px-2.5 py-1 rounded-md border border-navy-700">
          <Award className="w-3.5 h-3.5 text-accent-amber" />
          <span>Team SuperNova</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
