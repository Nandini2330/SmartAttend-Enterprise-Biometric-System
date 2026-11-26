import React from 'react';
import { ScanFace, Fingerprint, Cpu, Clock, CheckCircle2 } from 'lucide-react';
import type { AttendanceEvent } from '@smartattend/shared-types';
import { useLanguage } from '../lib/i18n';

interface LivePunchFeedProps {
  events: AttendanceEvent[];
  maxItems?: number;
}

export const LivePunchFeed: React.FC<LivePunchFeedProps> = ({ events, maxItems = 6 }) => {
  const { t } = useLanguage();
  const displayEvents = events.slice(0, maxItems);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'FACE':
        return <ScanFace className="w-3.5 h-3.5 text-blue-600" />;
      case 'FINGERPRINT':
        return <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />;
      case 'SIMULATED':
        return <Cpu className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'FACE':
        return <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">{t.methodFace}</span>;
      case 'FINGERPRINT':
        return <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">{t.methodFingerprint}</span>;
      case 'SIMULATED':
        return <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">{t.methodSimulated}</span>;
      default:
        return <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">{method}</span>;
    }
  };

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {displayEvents.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          {t.noRecordsFound}
        </div>
      ) : (
        displayEvents.map((evt) => (
          <div key={evt.id} className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
            <div className="flex items-start sm:items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5 sm:mt-0">
                {getMethodIcon(evt.verification_method)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">{evt.student_name || 'Enrolled Student'}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({evt.admission_number})</span>
                  {getMethodBadge(evt.verification_method)}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Class {evt.class_division || '10-A'}</span>
                  <span>•</span>
                  <span>{evt.device_name || 'Terminal Gate'}</span>
                  {evt.confidence_score && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {Math.round(evt.confidence_score * 100)}% match
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="self-end sm:self-auto flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{evt.local_timestamp}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
