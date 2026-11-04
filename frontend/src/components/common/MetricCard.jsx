import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, alertType = 'normal' }) => {
  const alertStyles = {
    normal: 'border-navy-700 bg-navy-850 text-slate-200',
    success: 'border-accent-green/40 bg-accent-green/10 text-accent-green',
    warning: 'border-accent-amber/40 bg-accent-amber/10 text-accent-amber',
    danger: 'border-accent-red/40 bg-accent-red/10 text-accent-red',
  };

  return (
    <div className={`p-4 rounded-lg border transition-colors hover:border-slate-header ${alertStyles[alertType]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-grey">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-md bg-navy-800 text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted-grey">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
