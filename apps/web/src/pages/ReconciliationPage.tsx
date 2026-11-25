import React, { useState } from 'react';
import { Clock, RotateCw, CheckCircle2, AlertTriangle, ShieldCheck, UserX, Send } from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import { StatusPill } from '../components/StatusPill';

export const ReconciliationPage: React.FC = () => {
  const store = useDataStore();
  const { t, language } = useLanguage();
  const [running, setRunning] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const absentStudents = store.dailyAttendance.filter((d) => d.status === 'ABSENT');
  const onLeaveStudents = store.dailyAttendance.filter((d) => d.status === 'ON_LEAVE');

  const handleExecuteReconciliation = () => {
    setRunning(true);
    setTimeout(() => {
      const count = store.runAbsenceReconciliation();
      setRunning(false);
      setResultMsg(
        language === 'mr'
          ? `स्वयंचलित हजेरी पडताळणी पूर्ण झाली: ${count} विद्यार्थी अनुपस्थित नोंदवले गेले. पालकांना सूचना पाठवली.`
          : `Automated reconciliation completed: ${count} unverified students marked ABSENT. Absence records updated for guardians.`
      );
      setTimeout(() => setResultMsg(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.reconciliationTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.reconciliationSub}
          </p>
        </div>

        <button
          onClick={handleExecuteReconciliation}
          disabled={running}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? t.reconcilingDb : t.runCutoffBtn}</span>
        </button>
      </div>

      {resultMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{resultMsg}</span>
        </div>
      )}

      {/* Rules & Cutoff Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-enterprise p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">{t.officialOpeningCard}</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block font-mono">{store.openingTime} AM</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {language === 'mr' ? 'गेट स्कॅनर वेळेवर हजेरी नोंदवतात' : 'Gate scanners record verified arrivals'}
          </span>
        </div>

        <div className="card-enterprise p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">{t.gracePeriodCard}</span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block font-mono">{store.graceMinutes} {language === 'mr' ? 'मिनिटे' : 'Minutes'}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {language === 'mr' ? 'सकाळी ०८:४५ नंतरच्या नोंदी उशिरा मानल्या जातात' : `Punches after ${store.getGraceDeadlineStr()} marked LATE`}
          </span>
        </div>

        <div className="card-enterprise p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">{t.cutoffTimeCard}</span>
          <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block font-mono">{store.cutoffTime} AM</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {language === 'mr' ? 'हजेरी न लागलेले विद्यार्थी गैरहजर नोंदवले जातात' : 'Unpunched students marked ABSENT'}
          </span>
        </div>
      </div>

      {/* Reconciled Absent & Leave List */}
      <div className="card-enterprise overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.absentRosterTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.absentRosterSub}</p>
          </div>
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            {absentStudents.length} {t.absent} • {onLeaveStudents.length} {t.onLeave}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.colStudent}</th>
                <th className="py-3 px-4">{t.classLabel}</th>
                <th className="py-3 px-4">{t.status}</th>
                <th className="py-3 px-4">{language === 'mr' ? 'कारण / प्रणाली शेरा' : 'Reason / System Remark'}</th>
                <th className="py-3 px-4">{language === 'mr' ? 'पालक सूचना स्थिती' : 'Parent Notification Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {[...absentStudents, ...onLeaveStudents].map((rec) => {
                const s = store.students.find((std) => std.id === rec.student_id);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {s ? `${s.first_name} ${s.last_name}` : 'Student'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {s?.class_name} - {s?.division_name}
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={rec.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {rec.remarks}
                    </td>
                    <td className="py-3 px-4">
                      {rec.status === 'ABSENT' ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{t.alertQueuedBadge}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t.notRequiredOnLeave}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
