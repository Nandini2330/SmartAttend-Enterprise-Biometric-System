import React, { useState, useEffect } from 'react';
import { Radio, ScanFace, Fingerprint, Cpu, ShieldCheck, Zap, AlertTriangle, CheckCircle, Wifi } from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import { offlineManager } from '../lib/offline-manager';
import { LivePunchFeed } from '../components/LivePunchFeed';

export const LiveMonitorPage: React.FC = () => {
  const store = useDataStore();
  const { t, formatMethod } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>(store.students[0]?.id || '');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerVerifiedPunch = (method: 'FACE' | 'FINGERPRINT') => {
    const std = store.students.find((s) => s.id === selectedStudent) || store.students[0];
    if (!std) return;

    if (!offlineManager.isOnline()) {
      const offlineRec = offlineManager.queuePunch({
        school_id: std.school_id,
        student_id: std.id,
        student_name: `${std.first_name} ${std.last_name}`,
        admission_number: std.admission_number,
        class_division: `${std.class_name} - ${std.division_name}`,
        event_type: 'CHECK_IN',
        verification_method: method,
        device_name: method === 'FACE' ? 'Senior Wing Face Kiosk' : 'Main Gate Fingerprint Terminal'
      });

      setFeedbackMsg({
        text: `[${t.offline}] ${std.first_name} ${std.last_name} (${formatMethod(method)})`,
        type: 'warn'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    const event = store.recordBiometricPunch(selectedStudent, method, 0.985);
    if (event) {
      setFeedbackMsg({
        text: `${t.verified}: ${event.student_name} (${formatMethod(method)} - ${event.local_timestamp})`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const triggerOfflinePunch = () => {
    const std = store.students.find((s) => s.id === selectedStudent) || store.students[0];
    if (!std) return;

    offlineManager.queuePunch({
      school_id: std.school_id,
      student_id: std.id,
      student_name: `${std.first_name} ${std.last_name}`,
      admission_number: std.admission_number,
      class_division: `${std.class_name} - ${std.division_name}`,
      event_type: 'CHECK_IN',
      verification_method: 'FINGERPRINT',
      device_name: 'Campus Gate Terminal (Offline Buffer)'
    });

    store.recordOfflinePunch(std.id);

    setFeedbackMsg({
      text: `[${t.offline}] ${std.first_name} ${std.last_name} (Queued & Synced)`,
      type: 'warn'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const triggerDuplicatePunch = () => {
    setFeedbackMsg({
      text: t.antiReplayActive || 'Anti-replay verification: Already logged entry for today.',
      type: 'warn'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Large Gate Clock */}
      <div className="card-enterprise p-4 sm:p-6 bg-navy-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{t.liveSystemActive}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">{t.liveMonitorTitle}</h1>
          <p className="text-xs text-slate-300 mt-1">
            {t.liveMonitorSub}
          </p>
        </div>

        {/* Big Live Clock */}
        <div className="bg-navy-800/80 border border-navy-700/80 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-center self-stretch md:self-auto">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-widest block">{t.istTimeLabel}</span>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider text-emerald-400 mt-0.5 block">
            {currentTime || '08:32:15 AM'}
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 sm:p-4 rounded-xl text-xs font-semibold flex items-center space-x-2.5 sm:space-x-3 border ${feedbackMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Interactive Punch Simulator Control Bar */}
      <div className="card-enterprise p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          {t.testBiometricsTitle}
        </h2>
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1 w-full min-w-0">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">{t.selectStudentLabel}</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {store.students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.first_name} {std.last_name} ({std.admission_number} - {t.colRollNo} {std.roll_number})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            <button
              onClick={() => triggerVerifiedPunch('FACE')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer w-full text-center"
            >
              <ScanFace className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.facePunchBtn}</span>
            </button>

            <button
              onClick={() => triggerVerifiedPunch('FINGERPRINT')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer w-full text-center"
            >
              <Fingerprint className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.fingerprintPunchBtn}</span>
            </button>

            <button
              onClick={triggerOfflinePunch}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer w-full text-center"
            >
              <Wifi className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.offlineQueueBtn}</span>
            </button>

            <button
              onClick={triggerDuplicatePunch}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer w-full text-center"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{t.duplicateTestBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Stream List */}
      <div className="card-enterprise p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t.streamFeedTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.liveIngestSub}</p>
          </div>
          <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-full border border-brand-200/60 dark:border-brand-800/60">
            {store.liveTicker.length} {t.records}
          </span>
        </div>

        <LivePunchFeed events={store.liveTicker} maxItems={20} />
      </div>
    </div>
  );
};
