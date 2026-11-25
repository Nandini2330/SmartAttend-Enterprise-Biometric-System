import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  RotateCw,
  ScanFace,
  Fingerprint,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import { MetricCard } from '../components/MetricCard';
import { StatusPill } from '../components/StatusPill';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface OverviewPageProps {
  onNavigate?: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const store = useDataStore();
  const { t, formatDay, formatMethod } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isDark = store.theme === 'dark';

  // Attendance metrics
  const totalStudents = store.students.length;
  const presentCount = store.dailyAttendance.filter((d) => d.status === 'PRESENT').length;
  const lateCount = store.dailyAttendance.filter((d) => d.status === 'LATE').length;
  const halfDayCount = store.dailyAttendance.filter((d) => d.status === 'HALF_DAY').length;
  const absentCount = store.dailyAttendance.filter((d) => d.status === 'ABSENT').length;
  const onLeaveCount = store.dailyAttendance.filter((d) => d.status === 'ON_LEAVE').length;

  const attendanceRate =
    totalStudents > 0
      ? Math.round(((presentCount + lateCount + halfDayCount) / totalStudents) * 100)
      : 0;

  // Dynamic 5-day trend from live database records
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weeklyTrendData = Array.from({ length: 5 }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (4 - idx));
    const dStr = d.toISOString().split('T')[0];
    const isCurrentDay = idx === 4;
    const rawDay = daysOfWeek[d.getDay()];
    const label = isCurrentDay ? t.dayToday : formatDay(rawDay);

    const recordsOnDate = store.dailyAttendance.filter((r) => r.attendance_date === dStr);
    const presentOnDate = recordsOnDate.filter(
      (r) => r.status === 'PRESENT' || r.status === 'HALF_DAY'
    ).length;
    const lateOnDate = recordsOnDate.filter((r) => r.status === 'LATE').length;
    const absentOnDate = recordsOnDate.filter((r) => r.status === 'ABSENT').length;

    return {
      day: label,
      present: isCurrentDay ? presentCount + halfDayCount : presentOnDate,
      late: isCurrentDay ? lateCount : lateOnDate,
      absent: isCurrentDay ? absentCount : absentOnDate
    };
  });

  // At-risk students (< 75% CBSE Board Attendance Requirement)
  const riskList = store.getAttendanceRiskAnalysis();
  const criticalStudents = riskList.filter((r) => r.riskLevel === 'CRITICAL');

  // Latest attendance activity records
  const recentEvents = store.liveTicker.slice(0, 6);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickPunch = () => {
    if (store.students.length === 0) return;
    const std = store.students[Math.floor(Math.random() * store.students.length)];
    const method = Math.random() > 0.5 ? 'FACE' : 'FINGERPRINT';
    const event = store.recordBiometricPunch(std.id, method, 0.98);
    if (event) {
      showToast(`${t.verified}: ${std.first_name} ${std.last_name} (${formatMethod(method)})`);
    }
  };

  const handleQuickReconcile = () => {
    store.runAbsenceReconciliation();
    showToast(`${t.reconcileTitle}: ${t.cutoffConfirmedSub}`);
  };

  const handleSendRiskAlert = (studentId: string, studentName: string) => {
    store.triggerConsecutiveAbsenceAlert(studentId);
    showToast(`${t.riskAlertHeader} (${studentName})`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'FACE':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
            <ScanFace className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>{t.methodFace}</span>
          </span>
        );
      case 'FINGERPRINT':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
            <Fingerprint className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{t.methodFingerprint}</span>
          </span>
        );
      case 'SIMULATED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
            <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{t.methodSimulated}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {formatMethod(method)}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-fade-in border border-slate-700 dark:border-slate-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. WELCOME SECTION */}
      <section className="card-enterprise p-5 sm:p-6 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-ring"></span>
                <span>{t.liveSystemActive}</span>
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                {t.academicSessionBadge}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}, {store.currentUser.name.split(' ')[0]}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {store.schoolName}
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span>
                {t.schoolOpeningLabel}: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{store.openingTime}</strong>
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span>
                {t.graceLabel}: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{store.graceMinutes}m</strong>
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span>
                {t.absenceCutoffLabel}: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{store.cutoffTime}</strong>
              </span>
            </div>
          </div>

          {/* Quick Operations Trigger Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={handleQuickPunch}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 transition-all cursor-pointer"
              title={t.simulatePunchBtn}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.simulatePunchBtn}</span>
            </button>

            <button
              onClick={handleQuickReconcile}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title={t.runReconciliationBtn}
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t.runReconciliationBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. ATTENDANCE SUMMARY (Exactly 4 clean KPI cards) */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <MetricCard
            title={t.totalStudentsCard}
            value={totalStudents}
            subtitle={t.enrolledActiveSub}
            icon={Users}
            accentColor="blue"
          />
          <MetricCard
            title={t.presentTodayCard}
            value={presentCount}
            subtitle={t.onTimeArrivalsSub}
            icon={CheckCircle2}
            trend={{ value: `${attendanceRate}%`, isPositive: true }}
            accentColor="emerald"
          />
          <MetricCard
            title={t.absentTodayCard}
            value={absentCount}
            subtitle={t.cutoffConfirmedSub}
            icon={AlertCircle}
            accentColor="rose"
          />
          <MetricCard
            title={t.lateArrivalsCard}
            value={lateCount}
            subtitle={`${t.arrivedAfterSub} ${store.openingTime}`}
            icon={Clock}
            accentColor="amber"
          />
        </div>
      </section>

      {/* 3. ATTENDANCE OVERVIEW (One clean visualization + Today's attendance percentage) */}
      <section className="card-enterprise p-5 sm:p-6 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.weeklyTrendsTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.weeklyTrendsSub}
            </p>
          </div>

          {/* Clean Legend */}
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
              <span className="text-slate-600 dark:text-slate-300">{t.present}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 dark:text-slate-300">{t.late}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600 dark:text-slate-300">{t.absent}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 items-center">
          {/* Main Visualization: 5-Day Trend Area Chart */}
          <div className="lg:col-span-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F1F5F9'} />
                <XAxis dataKey="day" stroke={isDark ? '#CBD5E1' : '#64748B'} fontSize={11} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }} />
                <YAxis stroke={isDark ? '#CBD5E1' : '#64748B'} fontSize={11} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '8px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '12px',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#presentGrad)"
                  name={t.present}
                />
                <Area
                  type="monotone"
                  dataKey="late"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#lateGrad)"
                  name={t.late}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Today's Attendance Rate Meter & Category Breakdown */}
          <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-[#111827]/80 border border-slate-100 dark:border-[#334155] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t.todayRateLabel}
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  {attendanceRate}%
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  {attendanceRate >= 75 ? t.verified : t.riskAlertHeader}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {presentCount + lateCount + halfDayCount} / {totalStudents} {t.records}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden flex">
              <div
                style={{ width: `${totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0}%` }}
                className="bg-brand-600 h-full"
                title={`${t.present}: ${presentCount}`}
              />
              <div
                style={{ width: `${totalStudents > 0 ? (lateCount / totalStudents) * 100 : 0}%` }}
                className="bg-amber-500 h-full"
                title={`${t.late}: ${lateCount}`}
              />
              <div
                style={{ width: `${totalStudents > 0 ? (onLeaveCount / totalStudents) * 100 : 0}%` }}
                className="bg-indigo-500 h-full"
                title={`${t.onLeave}: ${onLeaveCount}`}
              />
              <div
                style={{ width: `${totalStudents > 0 ? (absentCount / totalStudents) * 100 : 0}%` }}
                className="bg-rose-500 h-full"
                title={`${t.absent}: ${absentCount}`}
              />
            </div>

            {/* Clean Breakdown List */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">{t.present}</span>
                <span className="font-bold text-slate-900 dark:text-white">{presentCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">{t.late}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{lateCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">{t.absent}</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{absentCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">{t.onLeave}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{onLeaveCount}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. IMPORTANT ALERTS (Only students who genuinely require attention) */}
      <section>
        {criticalStudents.length > 0 ? (
          <div className="card-enterprise p-5 bg-white dark:bg-[#0D1527] border border-rose-200/80 dark:border-rose-900/60 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <h2 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                  {t.cbseWarningTitle} — {criticalStudents.length}
                </h2>
              </div>
              <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                {t.cbseWarningSub}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3.5">
              {criticalStudents.map((item) => (
                <div
                  key={item.student.id}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-rose-100 dark:border-rose-900/40 flex items-center justify-between shadow-sm"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                      {item.student.first_name} {item.student.last_name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono mt-0.5">
                      {item.student.class_name}-{item.student.division_name} • {item.student.admission_number}
                    </span>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        {t.currentRateLabel}: {item.percentage}%
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        {item.remedialClassesNeeded} {t.consecutiveDaysLabel}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRiskAlert(item.student.id, `${item.student.first_name} ${item.student.last_name}`)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
                    title={t.sendAlert}
                  >
                    {t.sendAlert}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-enterprise p-4 bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-[#334155] flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {t.noRecordsFound}
            </span>
          </div>
        )}
      </section>

      {/* 5. RECENT ACTIVITY (Latest attendance records in a simple clean table) */}
      <section className="card-enterprise p-5 sm:p-6 bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-[#334155]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#334155]">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.recentActivity}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.recentActivitySub}
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('live')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors cursor-pointer"
            >
              <span>{t.livePunchMonitor}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clean Responsive Activity Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-[#334155] text-slate-400 dark:text-[#CBD5E1] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">{t.colStudent}</th>
                <th className="py-2.5 px-3">{t.colAdmissionNo}</th>
                <th className="py-2.5 px-3">{t.colClassDivision}</th>
                <th className="py-2.5 px-3">{t.time}</th>
                <th className="py-2.5 px-3">{t.verificationMethodCol}</th>
                <th className="py-2.5 px-3">{t.status}</th>
                <th className="py-2.5 px-3 text-right">{t.verified}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    {t.noRecordsFound}
                  </td>
                </tr>
              ) : (
                recentEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#334155]/20 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-[11px] shrink-0 border border-slate-200 dark:border-slate-700">
                          {evt.student_name ? evt.student_name.charAt(0) : 'S'}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {evt.student_name || 'Student'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                      {evt.admission_number}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {evt.class_division || '10-A'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{evt.local_timestamp}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {getMethodBadge(evt.verification_method)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusPill status={evt.local_timestamp && evt.local_timestamp > store.openingTime ? 'LATE' : 'PRESENT'} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {evt.confidence_score ? `${Math.round(evt.confidence_score * 100)}%` : '98%'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
