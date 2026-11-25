import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue'
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-900/40',
      icon: 'text-blue-600 dark:text-blue-400',
      pill: 'bg-blue-500',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/40',
      icon: 'text-emerald-600 dark:text-emerald-400',
      pill: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/40',
      icon: 'text-amber-600 dark:text-amber-400',
      pill: 'bg-amber-500',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/40',
      icon: 'text-rose-600 dark:text-rose-400',
      pill: 'bg-rose-500',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-900/40',
      icon: 'text-indigo-600 dark:text-indigo-400',
      pill: 'bg-indigo-500',
    }
  };

  const scheme = colorMap[accentColor];

  return (
    <div className="card-enterprise p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 min-h-[128px]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${scheme.bg} transition-colors`}>
          <Icon className={`w-4 h-4 ${scheme.icon}`} />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${trend.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
              }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
