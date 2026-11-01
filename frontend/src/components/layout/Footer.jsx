import React from 'react';

export const Footer = () => {
  return (
    <footer className="h-10 border-t border-slate-900 bg-slate-950 px-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
      <div>
        ChargeAtlas India v1.0.0 • Techfest 2026-27 IIT Bombay (EV Infra Map India Challenge)
      </div>
      <div className="flex items-center gap-4">
        <span>Team SuperNova</span>
        <span>•</span>
        <span>Lead: Pranav Jadhav</span>
        <span>•</span>
        <span className="text-emerald-500">PostGIS + FastAPI Active</span>
      </div>
    </footer>
  );
};

export default Footer;

