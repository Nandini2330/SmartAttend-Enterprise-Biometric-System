import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, User } from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';

export const AuditLogsPage: React.FC = () => {
  const store = useDataStore();
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.auditLogsTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.auditLogsSub}
          </p>
        </div>
        <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          {t.dpdpBadge}
        </span>
      </div>

      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.colAction}</th>
                <th className="py-3 px-4">{t.colOperator}</th>
                <th className="py-3 px-4">{t.colEntity}</th>
                <th className="py-3 px-4">{t.colIp}</th>
                <th className="py-3 px-4">{t.colDetails}</th>
                <th className="py-3 px-4 text-right">{t.colTimestamp}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {store.auditLogs.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-transparent dark:border-slate-700">
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {evt.user}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {evt.entity}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {evt.ip}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                    {evt.details}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {evt.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
