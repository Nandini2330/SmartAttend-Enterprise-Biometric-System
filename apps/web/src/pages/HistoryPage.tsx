import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Search,
  Clock,
  ShieldCheck,
  ShieldAlert,
  User,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Plus,
  Edit,
  X,
  UserCheck
} from 'lucide-react';
import { useDataStore, formatLateDuration } from '../lib/data-store';
import { StatusPill } from '../components/StatusPill';
import { useLanguage } from '../lib/i18n';
import type { AttendanceStatus } from '@smartattend/shared-types';

export const HistoryPage: React.FC = () => {
  const store = useDataStore();
  const { t, formatStatus, formatMethod } = useLanguage();
  const isParent = store.currentUser.role === 'parent';
  const isStudent = store.currentUser.role === 'student';

  const authorizedStudents = store.getAuthorizedStudents();
  const activeChild = isParent ? store.getActiveChild() : null;
  const [selectedChildId, setSelectedChildId] = useState<string>(
    activeChild?.id || authorizedStudents[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // IDOR security verification test state
  const [tamperTargetId, setTamperTargetId] = useState<string>('88888888-8888-8888-8888-888888888801');
  const [isTestingTamper, setIsTestingTamper] = useState<boolean>(false);
  const [tamperResult, setTamperResult] = useState<{
    tested: boolean;
    blocked: boolean;
    statusCode: number;
    message: string;
    targetStudentName?: string;
  } | null>(null);

  // Manual attendance override modal states
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualStudentId, setManualStudentId] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('PRESENT');
  const [manualArrivalTime, setManualArrivalTime] = useState<string>('08:30');
  const [manualDepartureTime, setManualDepartureTime] = useState<string>('');
  const [manualReason, setManualReason] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    isError?: boolean;
    isWarning?: boolean;
  } | null>(null);

  // Auto-sync active child when user/parent changes
  React.useEffect(() => {
    if (isParent) {
      const child = store.getActiveChild();
      if (child && child.id !== selectedChildId) {
        setSelectedChildId(child.id);
      }
    }
  }, [store.currentUser, store.activeChildId, isParent]);

  // Active child for metrics and records display
  const activeStudent = isParent
    ? (store.getActiveChild() || authorizedStudents.find((s) => s.id === selectedChildId) || authorizedStudents[0])
    : isStudent
      ? (authorizedStudents.find((s) => s.id === selectedChildId) || authorizedStudents[0])
      : null;

  const childMetrics = activeStudent
    ? store.getChildAttendanceMetrics(activeStudent.id)
    : null;

  // Query records using strict authorization filter
  const { records: authRecords, isUnauthorizedBlocked } = store.getAuthorizedAttendance({
    studentId: (isParent || isStudent) ? activeStudent?.id : undefined,
    date: selectedDate || undefined,
    status: selectedStatus
  });

  const records = authRecords
    .filter((rec) => {
      const student = store.students.find((s) => s.id === rec.student_id);
      const studentName = student ? `${student.first_name} ${student.last_name}` : '';
      const admNo = student?.admission_number || '';

      const matchesSearch =
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      const dateCompare = b.attendance_date.localeCompare(a.attendance_date);
      if (dateCompare !== 0) return dateCompare;
      return (b.first_arrival_time || '').localeCompare(a.first_arrival_time || '');
    });

  const handleTamperTest = async () => {
    if (!tamperTargetId) return;
    setIsTestingTamper(true);
    try {
      const res = await store.testTamperedApiAccess(tamperTargetId);
      setTamperResult({
        tested: true,
        blocked: res.blocked,
        statusCode: res.statusCode,
        message: res.message,
        targetStudentName: res.targetStudentName
      });
    } finally {
      setIsTestingTamper(false);
    }
  };

  const renderHighlightedRemarks = (rec: any) => {
    const rawRemarks = rec.remarks || 'Standard verified arrival';
    const isArrivalVerified = /Arrival verified via/i.test(rawRemarks);

    // Check for late arrival in remarks or in record flags
    const lateMatch = rawRemarks.match(/\(([^)]*late[^)]*)\)/i);
    const lateText = lateMatch
      ? lateMatch[1]
      : (rec.is_late && rec.minutes_late ? `${formatLateDuration(rec.minutes_late)} late` : null);

    // Remove the late parenthetical from rawRemarks if present, to render it as a styled badge
    const cleanedRemarks = lateMatch
      ? rawRemarks.replace(/\s*\([^)]*late[^)]*\)/i, '').trim()
      : rawRemarks;

    // Helper for method badge
    const renderMethodTag = (methodToken: string) => {
      const upper = methodToken.toUpperCase();
      if (upper.includes('FINGERPRINT')) {
        return (
          <span
            key={methodToken}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
          >
            {methodToken}
          </span>
        );
      }
      if (upper.includes('FACE 3D') || upper.includes('FACE')) {
        return (
          <span
            key={methodToken}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-2xs"
          >
            {methodToken}
          </span>
        );
      }
      if (upper.includes('MANUAL')) {
        return (
          <span
            key={methodToken}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-2xs"
          >
            {methodToken}
          </span>
        );
      }
      return <span key={methodToken} className="font-semibold">{methodToken}</span>;
    };

    // Split cleaned remarks by method tokens: (FACE 3D|FINGERPRINT|FACE|MANUAL)
    const segments = cleanedRemarks.split(/(FACE 3D|FINGERPRINT|FACE|MANUAL)/gi);

    return (
      <div className="flex flex-wrap items-center gap-1.5 py-0.5">
        {isArrivalVerified && (
          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400" title="Biometrically Verified">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          </span>
        )}
        <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-relaxed">
          {segments.map((part: string, idx: number) => {
            if (/(FACE 3D|FINGERPRINT|FACE|MANUAL)/i.test(part)) {
              return renderMethodTag(part);
            }
            return <span key={idx}>{part}</span>;
          })}
        </span>
        {lateText && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs animate-pulse">
            <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
            <span>({lateText})</span>
          </span>
        )}
      </div>
    );
  };

  const exportCSV = () => {
    const headers = [
      'Student Name',
      'Admission No',
      'Class',
      'Date',
      'Status',
      'Arrival Time',
      'Method',
      'Minutes Late',
      'Remarks'
    ];
    const rows = records.map((r) => {
      const s = store.students.find((std) => std.id === r.student_id);
      return [
        s ? `"${s.first_name} ${s.last_name}"` : 'Unknown',
        s?.admission_number || '',
        s ? `"${s.class_name}-${s.division_name}"` : '',
        r.attendance_date,
        r.status,
        r.first_arrival_time || 'N/A',
        r.first_verification_method || 'N/A',
        r.minutes_late || 0,
        `"${r.remarks || ''}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = isParent && activeStudent
      ? `SmartAttend_Attendance_${activeStudent.first_name}_${activeStudent.last_name}_${new Date().toISOString().split('T')[0]}.csv`
      : `SmartAttend_Report_${selectedDate || 'all'}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isParent ? t.childAttendanceTitle : t.institutionAttendanceTitle}
            </h1>
            {isParent && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Lock className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                <span>{t.parentPrivacyEnforced}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isParent ? t.parentHistorySub : t.staffHistorySub}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {!isParent && !isStudent && (
            <button
              onClick={() => {
                setManualStudentId(store.students[0]?.id || '');
                setManualDate(new Date().toISOString().split('T')[0]);
                setManualStatus('PRESENT');
                setManualArrivalTime('08:25:00');
                setManualDepartureTime('');
                setManualReason('Teacher manual attendance entry');
                setShowManualModal(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.manualAttendanceBtn}</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>{isParent ? t.exportChildCsv : t.exportCsvReport}</span>
          </button>
        </div>
      </div>

      {/* Parent Privacy Protected Card with Child Profile & Metrics */}
      {isParent && activeStudent && (
        <div className="card-enterprise p-5 bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 text-white shadow-xl border-navy-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-700/80">
            <div className="flex items-center space-x-4">
              <img
                src={activeStudent.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                alt={activeStudent.first_name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-400/50 shadow-md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-white">
                    {activeStudent.first_name} {activeStudent.last_name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/30 text-brand-300 border border-brand-400/30">
                    {t.registeredChildBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Admission: <strong className="text-white font-mono">{activeStudent.admission_number}</strong> • Roll: <strong className="text-white font-mono">{activeStudent.roll_number}</strong> • Class: <strong className="text-white">{activeStudent.class_name}-{activeStudent.division_name}</strong>
                </p>
              </div>
            </div>

            {/* Child Selector Pills if Parent Has Multiple Registered Children */}
            {authorizedStudents.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 bg-navy-950/60 p-1.5 rounded-xl border border-navy-700">
                <span className="text-[11px] text-slate-400 px-2 font-medium">{t.switchChildLabel}</span>
                {authorizedStudents.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setSelectedChildId(child.id);
                      store.setActiveChildId(child.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeStudent.id === child.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800'
                      }`}
                  >
                    {child.first_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Child Realtime Attendance KPI Row */}
          {childMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">{t.attendanceRate}</span>
                <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{childMetrics.percentage}%</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{childMetrics.presentDays + childMetrics.lateDays} / {childMetrics.totalDays}</span>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">{t.onTimeArrivals}</span>
                <span className="text-2xl font-black text-brand-400 mt-0.5 block">{childMetrics.presentDays}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t.punctualityRate} {childMetrics.punctualityRate}%</span>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">{t.lateCheckins}</span>
                <span className="text-2xl font-black text-amber-400 mt-0.5 block">{childMetrics.lateDays}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">08:30 AM</span>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">{t.absencesLeaves}</span>
                <span className="text-2xl font-black text-rose-400 mt-0.5 block">{childMetrics.absentDays} / {childMetrics.onLeaveDays}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t.excused}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Barrier: Tampered IDOR Attack Simulation & Verification Widget */}
      {isParent && (
        <div className="card-enterprise p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t.securityPrivacyTitle}</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {t.securityPrivacySub}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <select
                value={tamperTargetId}
                onChange={(e) => setTamperTargetId(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                {store.students
                  .filter((s) => !authorizedStudents.some((a) => a.id === s.id))
                  .map((other) => (
                    <option key={other.id} value={other.id}>
                      {other.first_name} {other.last_name} ({other.admission_number})
                    </option>
                  ))}
              </select>

              <button
                onClick={handleTamperTest}
                disabled={isTestingTamper}
                className="w-full sm:w-auto justify-center px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 border border-transparent dark:border-slate-700 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{isTestingTamper ? t.testingPrivacy : t.testPrivacyBlockBtn}</span>
              </button>
            </div>
          </div>

          {tamperResult && (
            <div
              className={`mt-3 p-3 rounded-lg text-xs border flex items-start space-x-2.5 ${tamperResult.blocked
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                }`}
            >
              {tamperResult.blocked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-xs">
                  {tamperResult.blocked
                    ? `✔ ACCESS BLOCKED (HTTP ${tamperResult.statusCode}): Data Privacy Enforced`
                    : `✘ PRIVACY LEAK: Access was not blocked.`}
                </p>
                <p className="text-[11px] mt-0.5">{tamperResult.message}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-enterprise p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isParent ? `${t.search} (${activeStudent?.first_name})...` : `${t.search}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold ml-1 cursor-pointer"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.status}:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="ALL">{t.allStatusesOption}</option>
            <option value="PRESENT">{t.present}</option>
            <option value="LATE">{t.late}</option>
            <option value="ABSENT">{t.absent}</option>
            <option value="ON_LEAVE">{t.onLeave}</option>
          </select>
        </div>
      </div>

      {/* Reconciled Records Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto responsive-table-container">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.colStudent}</th>
                <th className="py-3 px-4">{t.colAdmissionNo}</th>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{t.status}</th>
                <th className="py-3 px-4">{t.firstArrivalCol}</th>
                <th className="py-3 px-4">{t.verificationMethodCol}</th>
                <th className="py-3 px-4">{t.colRemarks}</th>
                {!isParent && !isStudent && <th className="py-3 px-4 text-right">{t.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={isParent || isStudent ? 7 : 8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {t.noRecordsFound}
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const s = store.students.find((std) => std.id === rec.student_id);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {s ? `${s.first_name} ${s.last_name}` : 'Student'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {s?.admission_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {rec.attendance_date}
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill status={rec.status} />
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {rec.first_arrival_time || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {rec.first_verification_method ? (
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {formatMethod(rec.first_verification_method)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {renderHighlightedRemarks(rec)}
                      </td>
                      {!isParent && !isStudent && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setManualStudentId(rec.student_id);
                              setManualDate(rec.attendance_date);
                              setManualStatus(rec.status);
                              setManualArrivalTime(rec.first_arrival_time || '08:25:00');
                              setManualDepartureTime(rec.departure_time || '');
                              setManualReason(rec.remarks || 'Attendance correction');
                              setShowManualModal(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Override or correct attendance"
                          >
                            <Edit className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                            <span>{t.edit}</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance & Override Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.manualModalTitle}</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!manualStudentId) return;
                const result: any = store.overrideAttendance(
                  manualStudentId,
                  manualStatus,
                  manualReason || 'Teacher manual roster entry',
                  manualDate,
                  manualArrivalTime || undefined,
                  manualDepartureTime || undefined
                );
                setShowManualModal(false);

                if (result?.isDuplicate) {
                  setFeedbackToast({
                    message: `Attendance updated. (Parent notification already sent for ${manualDate}).`,
                    isWarning: true
                  });
                } else if (result?.deliveryStatus === 'FAILED') {
                  setFeedbackToast({
                    message: `Attendance saved, but parent notification failed: ${result.deliveryError}`,
                    isError: true
                  });
                } else {
                  const guardianName = result?.guardian?.full_name || 'Parent';
                  const guardianPhone = result?.guardian?.phone_number || '';
                  setFeedbackToast({
                    message: `Attendance saved! Parent notification delivered to ${guardianName} (${guardianPhone}) via WhatsApp & Push.`
                  });
                }
                setTimeout(() => setFeedbackToast(null), 5000);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.colStudent}
                </label>
                <select
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                >
                  {store.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.admission_number}) — {s.class_name} {s.division_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.status}
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="PRESENT">{t.present} (Full Day)</option>
                    <option value="LATE">{t.late}</option>
                    <option value="HALF_DAY">{t.halfDay}</option>
                    <option value="ABSENT">{t.absent}</option>
                    <option value="ON_LEAVE">{t.onLeave}</option>
                    <option value="EXCUSED">{t.excused}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.arrivalTimeCol}
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={manualArrivalTime}
                    onChange={(e) => setManualArrivalTime(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    step="1"
                    placeholder="12:30:00"
                    value={manualDepartureTime}
                    onChange={(e) => setManualDepartureTime(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.colRemarks}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doctor appointment, bus breakdown, medical certificate"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all"
                >
                  {t.saveToDatabase}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedbackToast && (
        <div
          className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 p-3 sm:p-4 rounded-xl text-white text-xs font-bold shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-5 border ${feedbackToast.isError
            ? 'bg-rose-600 border-rose-500'
            : feedbackToast.isWarning
              ? 'bg-amber-600 border-amber-500'
              : 'bg-emerald-600 border-emerald-500'
            }`}
        >
          {feedbackToast.isError ? (
            <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
          ) : feedbackToast.isWarning ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}
    </div>
  );
};
