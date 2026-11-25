import React from 'react';
import type { AttendanceStatus } from '@smartattend/shared-types';
import { useLanguage } from '../lib/i18n';

interface StatusPillProps {
  status: AttendanceStatus | string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const { t, formatStatus } = useLanguage();
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'PRESENT':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
          {t.present}
        </span>
      );
    case 'LATE':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
          {t.late}
        </span>
      );
    case 'ABSENT':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>
          {t.absent}
        </span>
      );
    case 'ON_LEAVE':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-indigo-500"></span>
          {t.onLeave}
        </span>
      );
    case 'HALF_DAY':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-500"></span>
          {t.halfDay}
        </span>
      );
    case 'EXCUSED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-teal-500"></span>
          {t.excused}
        </span>
      );
    case 'HOLIDAY':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
          {t.holiday}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
          {formatStatus(status)}
        </span>
      );
  }
};
