import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, AlertTriangle, ArrowLeft, Home, Map, Database, Milestone } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HTTP 404 &bull; ROUTE NOT FOUND
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">Geographic Feature Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested URL path or administrative unit does not exist in the ChargeAtlas India platform.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-left space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Popular Navigation Targets:
          </div>
          <div className="flex flex-col gap-1.5">
            <Link
              to="/maharashtra"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Maharashtra 36 Districts Analysis</span>
              </div>
              <span className="text-[10px] text-slate-500">&rarr;</span>
            </Link>
            <Link
              to="/national-map"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Map className="w-3.5 h-3.5 text-emerald-400" />
                <span>National GIS Station Map</span>
              </div>
              <span className="text-[10px] text-slate-500">&rarr;</span>
            </Link>
            <Link
              to="/samruddhi-corridor"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Milestone className="w-3.5 h-3.5 text-amber-400" />
                <span>Samruddhi Expressway Corridor</span>
              </div>
              <span className="text-[10px] text-slate-500">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

