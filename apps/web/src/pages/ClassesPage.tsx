import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  ShieldAlert,
  Award,
  BookOpen,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Briefcase
} from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';

export const ClassesPage: React.FC = () => {
  const store = useDataStore();
  const { t, formatDay } = useLanguage();
  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'TIMETABLE' | 'SUBJECT_ATTENDANCE' | 'PROMOTION'>('SECTIONS');

  // Academic Promotion Wizard State (Sprint 3)
  const [promoSourceClass, setPromoSourceClass] = useState('Grade 10');
  const [promoSourceDiv, setPromoSourceDiv] = useState('ALL');
  const [promoTargetClass, setPromoTargetClass] = useState('Grade 11');
  const [promoTargetDiv, setPromoTargetDiv] = useState('A');
  const [promoTargetYear, setPromoTargetYear] = useState('2027-2028');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [promotionResult, setPromotionResult] = useState<string | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearName, setNewYearName] = useState('2028-2029');
  const [newYearStart, setNewYearStart] = useState('2028-04-01');
  const [newYearEnd, setNewYearEnd] = useState('2029-03-31');

  // Subject-wise Attendance State (Feature 4)
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const classData = [
    {
      grade: 'Grade 10',
      division: 'A',
      teacher: 'Mr. Rajesh Kumar',
      capacity: 40,
      enrolled: store.students.filter((s) => s.class_name === 'Grade 10' && s.division_name === 'A').length,
      attendanceRate: '94%'
    },
    {
      grade: 'Grade 10',
      division: 'B',
      teacher: 'Ms. Priya Sharma',
      capacity: 40,
      enrolled: store.students.filter((s) => s.class_name === 'Grade 10' && s.division_name === 'B').length,
      attendanceRate: '91%'
    },
    {
      grade: 'Grade 9',
      division: 'A',
      teacher: 'Dr. Anita Joshi',
      capacity: 40,
      enrolled: store.students.filter((s) => s.class_name === 'Grade 9' && s.division_name === 'A').length,
      attendanceRate: '97%'
    }
  ];

  // Faculty Workload Data (Feature 11)
  const teacherWorkloads = [
    { name: 'Mr. Rajesh Kumar', subject: 'Mathematics / Social Studies', hoursPerWeek: 24, maxHours: 28, status: 'BALANCED' },
    { name: 'Ms. Priya Sharma', subject: 'Physics / Chemistry', hoursPerWeek: 22, maxHours: 26, status: 'OPTIMAL' },
    { name: 'Dr. Anita Joshi', subject: 'English Literature', hoursPerWeek: 18, maxHours: 24, status: 'LIGHT' },
    { name: 'Mr. Arvind Swamy', subject: 'Computer Science & AI', hoursPerWeek: 20, maxHours: 26, status: 'OPTIMAL' },
  ];

  // Days and periods for Timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
  const periods = [1, 2, 3, 4, 5, 6];

  const handleToggleSubjectAttendance = (studentId: string, currentStatus: 'PRESENT' | 'ABSENT') => {
    const nextStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    store.recordSubjectAttendance(studentId, selectedSubject, selectedPeriod, selectedDate, nextStatus);
  };

  const handleSaveLectureRoster = () => {
    setSaveSuccess(`Recorded attendance for ${selectedSubject} (Period ${selectedPeriod}) on ${selectedDate}.`);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.classesTitle}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.classesSub}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${activeTab === 'SECTIONS'
            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t.tabSections}</span>
        </button>

        <button
          onClick={() => setActiveTab('TIMETABLE')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${activeTab === 'TIMETABLE'
            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.tabTimetable}</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBJECT_ATTENDANCE')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${activeTab === 'SUBJECT_ATTENDANCE'
            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t.tabSubjectAtt}</span>
        </button>

        <button
          id="tab-promotion-wizard"
          onClick={() => {
            setActiveTab('PROMOTION');
            const eligible = store.students.filter((s) => s.class_name === promoSourceClass).map((s) => s.id);
            setSelectedStudentIds(eligible);
          }}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${activeTab === 'PROMOTION'
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <Award className="w-4 h-4" />
          <span>{t.tabPromotion}</span>
        </button>
      </div>

      {/* TAB 1: SECTIONS DIRECTORY */}
      {activeTab === 'SECTIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {classData.map((c) => (
            <div key={`${c.grade}-${c.division}`} className="card-enterprise p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-200 dark:border-brand-800">
                    {c.division}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{c.grade} - {c.division}</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.teacher}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {c.attendanceRate}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>{t.enrolledStudentsLabel}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{c.enrolled} / {c.capacity}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full"
                    style={{ width: `${(c.enrolled / c.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{t.morningGraceLabel}</span>
                <span className="text-brand-600 dark:text-brand-400 font-semibold cursor-pointer hover:underline">
                  {t.viewRosterLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TIMETABLE & TEACHER WORKLOAD (Features 5 & 11) */}
      {activeTab === 'TIMETABLE' && (
        <div className="space-y-6">
          {/* Teacher Workload Summary Cards */}
          <div className="card-enterprise p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>{t.teacherWorkloadTelemetry}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.workloadSub}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teacherWorkloads.map((item) => (
                <div key={item.name} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-400">{item.subject}</p>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>{t.weeklyHoursLabel}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.hoursPerWeek} / {item.maxHours} hrs</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full"
                        style={{ width: `${(item.hoursPerWeek / item.maxHours) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Timetable Grid */}
          <div className="card-enterprise p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.masterTimetableLabel}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Grade 10 - Section A • {store.openingTime || '08:30 AM'}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {t.academicSessionBadge}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-3 font-bold">{t.dayLabel}</th>
                    {periods.map((p) => (
                      <th key={p} className="py-2.5 px-3 font-bold text-center">
                        {t.periodLabel} {p}
                        <div className="text-[10px] font-normal text-slate-400 font-mono">
                          {p === 1 ? '08:30-09:15' : p === 2 ? '09:15-10:00' : p === 3 ? '10:15-11:00' : p === 4 ? '11:00-11:45' : p === 5 ? '12:15-13:00' : '13:00-13:45'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {days.map((day) => (
                    <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white bg-slate-50/40 dark:bg-slate-800/20">
                        {formatDay(day)}
                      </td>
                      {periods.map((p) => {
                        const slot = store.timetable.find((item) => item.day === day && item.period === p);
                        return (
                          <td key={p} className="py-2.5 px-3 text-center">
                            {slot ? (
                              <div className="p-2 rounded-lg bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60">
                                <div className="font-bold text-brand-900 dark:text-brand-200 text-[11px]">{slot.subject}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{slot.teacher}</div>
                                <div className="text-[9px] text-slate-400 font-mono">{slot.room}</div>
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-[10px] italic">
                                {t.studyLibraryLabel}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACADEMIC YEAR PROMOTION WIZARD (Sprint 3) */}
      {activeTab === 'PROMOTION' && (
        <div className="space-y-6">
          {/* Safeguards & Institutional Banner */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/80 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">{t.promotionSafeguardsTitle}</strong>
                <span>{t.promotionSafeguardsDesc}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddYearModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 shadow-sm transition-all"
            >
              {t.newAcademicSessionBtn}
            </button>
          </div>

          {/* Academic Session State & Transition Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-slate-500 font-medium">{t.activeSessionLabel}</span>
              <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 font-mono">
                {store.academicYears.find((y) => y.is_current)?.name || '2026-2027'} (Active)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">{t.switchSessionLabel}</span>
              <select
                value={store.academicYears.find((y) => y.is_current)?.id || ''}
                onChange={(e) => store.setCurrentAcademicYear(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                {store.academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.is_current ? '• Active' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {promotionResult && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{promotionResult}</span>
              </div>
              <button onClick={() => setPromotionResult(null)} className="text-emerald-700 hover:text-emerald-900">
                ✕
              </button>
            </div>
          )}

          {/* Configuration Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.promotionConfigTitle}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t.sourceClassLabel}</label>
                <select
                  value={promoSourceClass}
                  onChange={(e) => {
                    setPromoSourceClass(e.target.value);
                    const eligible = store.students
                      .filter((s) => s.class_name === e.target.value && (promoSourceDiv === 'ALL' || s.division_name === promoSourceDiv))
                      .map((s) => s.id);
                    setSelectedStudentIds(eligible);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t.sourceDivLabel}</label>
                <select
                  value={promoSourceDiv}
                  onChange={(e) => {
                    setPromoSourceDiv(e.target.value);
                    const eligible = store.students
                      .filter((s) => s.class_name === promoSourceClass && (e.target.value === 'ALL' || s.division_name === e.target.value))
                      .map((s) => s.id);
                    setSelectedStudentIds(eligible);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">{t.allDivisionsOption}</option>
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t.targetClassLabel}</label>
                <select
                  value={promoTargetClass}
                  onChange={(e) => setPromoTargetClass(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Automatic">Automatic (Pass → Next Std, Fail → Same Std)</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Graduated">Graduated / Alumni</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t.targetDivLabel}</label>
                <select
                  value={promoTargetDiv}
                  onChange={(e) => setPromoTargetDiv(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t.targetSessionLabel}</label>
                <select
                  value={promoTargetYear}
                  onChange={(e) => setPromoTargetYear(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  {store.academicYears.map((ay) => (
                    <option key={ay.id} value={ay.name}>
                      {ay.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Selection Roster with Eligibility Badges */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.eligibleStudentsTitle} ({store.students.filter((s) => s.class_name === promoSourceClass && (promoSourceDiv === 'ALL' || s.division_name === promoSourceDiv)).length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t.eligibleStudentsSub}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-select-eligible"
                  onClick={() => {
                    const eligible = store.students
                      .filter((s) => s.class_name === promoSourceClass && (promoSourceDiv === 'ALL' || s.division_name === promoSourceDiv))
                      .filter((s) => store.getStudentPromotionEligibility(s.id).isEligible)
                      .map((s) => s.id);
                    setSelectedStudentIds(eligible);
                  }}
                  className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
                >
                  {t.selectAllEligibleBtn}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const all = store.students
                      .filter((s) => s.class_name === promoSourceClass && (promoSourceDiv === 'ALL' || s.division_name === promoSourceDiv))
                      .map((s) => s.id);
                    setSelectedStudentIds(all);
                  }}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  {t.selectAllBtn}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-xs text-slate-500 font-medium hover:underline"
                >
                  {t.deselectAllBtn}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 w-8"></th>
                    <th className="py-2.5">{t.colStudent}</th>
                    <th className="py-2.5">{t.colAdmissionNo}</th>
                    <th className="py-2.5">{t.colClassDivision}</th>
                    <th className="py-2.5">Exam Result</th>
                    <th className="py-2.5">{t.colCompliance}</th>
                    <th className="py-2.5">{t.colEligibility}</th>
                    <th className="py-2.5">Target Destination</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {store.students
                    .filter((s) => (promoSourceClass === 'ALL' || s.class_name === promoSourceClass) && (promoSourceDiv === 'ALL' || s.division_name === promoSourceDiv))
                    .map((std) => {
                      const isSelected = selectedStudentIds.includes(std.id);
                      const eligibility = store.getStudentPromotionEligibility(std.id, 75, promoTargetYear);
                      const isAlreadyPromoted = eligibility.status === 'ALREADY_PROMOTED';
                      const isPass = eligibility.examStatus === 'PASS';

                      return (
                        <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isAlreadyPromoted}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds([...selectedStudentIds, std.id]);
                                } else {
                                  setSelectedStudentIds(selectedStudentIds.filter((id) => id !== std.id));
                                }
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 disabled:opacity-40"
                            />
                          </td>
                          <td className="py-3 font-semibold text-slate-900 dark:text-white">
                            {std.first_name} {std.last_name}
                          </td>
                          <td className="py-3 font-mono text-slate-500">{std.admission_number}</td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">{std.class_name} ({std.division_name})</td>
                          <td className="py-3 font-mono">
                            {isPass ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                PASS ({eligibility.examPercentage}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                FAIL ({eligibility.examPercentage}%)
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-mono">
                            <span className="font-bold">{eligibility.attendanceRate}%</span>
                          </td>
                          <td className="py-3">
                            {isAlreadyPromoted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                {t.statusAlreadyPromoted}
                              </span>
                            ) : isPass ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Pass - Promoted
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                Fail - Retained
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-mono text-xs">
                            {isAlreadyPromoted ? (
                              <span className="text-slate-400">Enrolled ({promoTargetYear})</span>
                            ) : isPass ? (
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                                &rarr; {eligibility.targetClass}-{promoTargetDiv} ({promoTargetYear})
                              </span>
                            ) : (
                              <span className="text-amber-700 dark:text-amber-300 font-bold">
                                &rarr; {eligibility.targetClass}-{std.division_name || 'A'} ({promoTargetYear})
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              disabled={isAlreadyPromoted || isPromoting}
                              onClick={async () => {
                                setIsPromoting(true);
                                const res = await store.promoteStudent(std.id, promoTargetYear);
                                setPromotionResult(res.message);
                                setIsPromoting(false);
                                setTimeout(() => setPromotionResult(null), 6000);
                              }}
                              className="px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                              {isAlreadyPromoted ? 'Enrolled' : isPass ? 'Promote' : 'Retain'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedStudentIds.length} {t.enrolledStudentsLabel}
              </span>

              <button
                type="button"
                disabled={selectedStudentIds.length === 0 || isPromoting}
                onClick={async () => {
                  setIsPromoting(true);
                  const res = await store.executeAutomaticStandardPromotion({
                    sourceClass: promoSourceClass,
                    studentIds: selectedStudentIds,
                    targetYear: promoTargetYear,
                    targetDivision: promoTargetDiv
                  });
                  setPromotionResult(
                    `Automatic Promotion Completed: ${res.promoted_count} Promoted to next standard, ${res.retained_count || 0} Retained in current standard (${res.skipped_duplicates} duplicate enrollments prevented). All attendance and academic records preserved.`
                  );
                  setIsPromoting(false);
                  setTimeout(() => setPromotionResult(null), 7000);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer ${selectedStudentIds.length > 0 && !isPromoting
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
                  }`}
              >
                {isPromoting ? t.loading : `${t.executeBulkPromoBtn} (${selectedStudentIds.length})`}
              </button>
            </div>
          </div>

          {/* Historical Class Enrollment Ledger */}
          <div className="card-enterprise overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.historyLedgerTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.historyLedgerSub}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">{store.classEnrollments.length} {t.records}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4">{t.colStudent}</th>
                    <th className="py-2.5 px-4">{t.targetSessionLabel}</th>
                    <th className="py-2.5 px-4">{t.classLabel}</th>
                    <th className="py-2.5 px-4">{t.divisionLabel}</th>
                    <th className="py-2.5 px-4">{t.date}</th>
                    <th className="py-2.5 px-4">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {store.classEnrollments.map((enr) => {
                    const student = store.students.find((s) => s.id === enr.student_id);

                    return (
                      <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {student ? `${student.first_name} ${student.last_name}` : 'Student'}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">
                          {enr.academic_year_name}
                        </td>
                        <td className="py-3 px-4">{enr.class_name}</td>
                        <td className="py-3 px-4 font-mono">Division {enr.division_name || 'A'}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{enr.enrolled_at}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${enr.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                          >
                            {enr.is_active ? t.liveSystemActive : 'ARCHIVED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Add New Academic Session */}
          {showAddYearModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{t.newAcademicSessionBtn}</span>
                  </h3>
                  <button onClick={() => setShowAddYearModal(false)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.targetSessionLabel}</label>
                    <input
                      type="text"
                      value={newYearName}
                      onChange={(e) => setNewYearName(e.target.value)}
                      placeholder="e.g. 2028-2029"
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.startDateLabel}</label>
                    <input
                      type="date"
                      value={newYearStart}
                      onChange={(e) => setNewYearStart(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.endDateLabel}</label>
                    <input
                      type="date"
                      value={newYearEnd}
                      onChange={(e) => setNewYearEnd(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddYearModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newYearName.trim()) return;
                      store.addAcademicYear(newYearName, newYearStart, newYearEnd);
                      setShowAddYearModal(false);
                      setPromotionResult(`Academic session ${newYearName} created.`);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERIOD-WISE SUBJECT ATTENDANCE (Feature 4) */}
      {activeTab === 'SUBJECT_ATTENDANCE' && (
        <div className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Lecture Selection Bar */}
          <div className="card-enterprise p-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              {t.lecturePunchTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.subjectLabel}</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="English Literature">English Literature</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.periodLabel}</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-800 dark:text-slate-200"
                >
                  {[1, 2, 3, 4, 5, 6].map((p) => (
                    <option key={p} value={p}>
                      {t.periodLabel} {p} ({p === 1 ? '08:30' : p === 2 ? '09:15' : p === 3 ? '10:15' : p === 4 ? '11:00' : p === 5 ? '12:15' : '13:00'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.date}</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSaveLectureRoster}
                  className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.lockLectureBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Roster for Lecture */}
          <div className="card-enterprise p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t.lecturePunchTitle}: {selectedSubject} ({t.periodLabel} {selectedPeriod})
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Grade 10 - Section A
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5">{t.colStudent}</th>
                    <th className="py-2.5">{t.colRollNo}</th>
                    <th className="py-2.5">{t.attendanceRate}</th>
                    <th className="py-2.5">{t.lecturePunchTitle} ({t.periodLabel} {selectedPeriod})</th>
                    <th className="py-2.5 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {store.students
                    .filter((s) => s.class_name === 'Grade 10')
                    .map((std) => {
                      const rec = store.subjectAttendance.find(
                        (a) => a.student_id === std.id && a.subject === selectedSubject && a.period === selectedPeriod && a.date === selectedDate
                      );
                      const isPresent = rec ? rec.status === 'PRESENT' : true; // Default present

                      return (
                        <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 font-semibold text-slate-900 dark:text-white">
                            {std.first_name} {std.last_name}
                            <span className="text-[10px] text-slate-400 block font-mono">{std.admission_number}</span>
                          </td>
                          <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {std.roll_number}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              94% ({selectedSubject})
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${isPresent
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                }`}
                            >
                              {isPresent ? t.present : t.absent}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleToggleSubjectAttendance(std.id, isPresent ? 'PRESENT' : 'ABSENT')}
                              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${isPresent
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                            >
                              {isPresent ? t.markAbsentBtn : t.markPresentBtn}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
