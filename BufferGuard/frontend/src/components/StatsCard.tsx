import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
  trend?: string;
}

const colorMap = {
  cyan: {
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-800/50',
    iconBg: 'bg-cyan-950',
    iconText: 'text-cyan-400',
    text: 'text-cyan-400',
  },
  emerald: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/50',
    iconBg: 'bg-emerald-950',
    iconText: 'text-emerald-400',
    text: 'text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-800/50',
    iconBg: 'bg-amber-950',
    iconText: 'text-amber-400',
    text: 'text-amber-400',
  },
  rose: {
    bg: 'bg-rose-950/40',
    border: 'border-rose-800/50',
    iconBg: 'bg-rose-950',
    iconText: 'text-rose-400',
    text: 'text-rose-400',
  },
  indigo: {
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-800/50',
    iconBg: 'bg-indigo-950',
    iconText: 'text-indigo-400',
    text: 'text-indigo-400',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan',
  trend,
}) => {
  const c = colorMap[color];

  return (
    <div className={`p-5 rounded-2xl glass-panel ${c.bg} border ${c.border} glass-card-hover flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${c.iconBg} border border-slate-700/60`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} />
        </div>
      </div>

      <div>
        <div className="text-3xl font-extrabold tracking-tight text-slate-100 font-mono">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            {trend && (
              <span className={`font-semibold ${c.text}`}>
                {trend}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-400">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
