import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, alertType = 'normal' }) => {
  const alertStyles = {
    normal: 'border-slate-800 bg-slate-900/60 text-slate-200',
    success: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
    warning: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
    danger: 'border-rose-500/30 bg-rose-950/20 text-rose-400',
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all hover:border-slate-700 ${alertStyles[alertType]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;

