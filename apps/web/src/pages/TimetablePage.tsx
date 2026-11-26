import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Filter,
  Trash2,
  Info
} from 'lucide-react';
import { useDataStore, TimetableSlot, TimetableConflict } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';

export const TimetablePage: React.FC = () => {
  const store = useDataStore();
  const { t, formatDay } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<string>('Grade 10');
  const [selectedDivision, setSelectedDivision] = useState<string>('A');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Slot Form State
  const [formDay, setFormDay] = useState<string>('Monday');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [formTeacher, setFormTeacher] = useState<string>('Mr. Rajesh Kumar');
  const [formRoom, setFormRoom] = useState<string>('Room 101');
  const [formTimeRange, setFormTimeRange] = useState<string>('08:30 - 09:15');
  const [conflictWarning, setConflictWarning] = useState<TimetableConflict | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6];

  const defaultTimings: Record<number, string> = {
    1: '08:30 - 09:15',
    2: '09:15 - 10:00',
    3: '10:15 - 11:00',
    4: '11:00 - 11:45',
    5: '12:15 - 13:00',
    6: '13:00 - 13:45'
  };

  // Teachers list
  const teachers = Array.from(
    new Set(store.timetable.map((t) => t.teacher || t.teacher_name || 'Staff'))
  ).filter(Boolean);

  // Filter slots for the active class & division (and optional teacher filter)
  const filteredSlots = store.timetable.filter((slot) => {
    const classMatch = !selectedClass || slot.class_name === selectedClass;
    const divMatch = !selectedDivision || slot.division_name === selectedDivision;
    const teacherMatch = selectedTeacher === 'ALL' || (slot.teacher || slot.teacher_name) === selectedTeacher;
    return classMatch && divMatch && teacherMatch;
  });

  // Calculate unique subjects for this class schedule
  const scheduledSubjects = Array.from(new Set(filteredSlots.map((s) => s.subject)));

  // Real-time conflict preview when form changes
  const checkConflictOnFormChange = (
    newTeacher: string,
    newRoom: string,
    newDay: string,
    newPeriod: number,
    excludeId?: string
  ) => {
    const conflict = store.detectTimetableConflicts(
      {
        day: newDay as any,
        period: newPeriod,
        teacher: newTeacher,
        room: newRoom,
        class_name: selectedClass,
        division_name: selectedDivision
      },
      excludeId
    );
    setConflictWarning(conflict);
  };

  const openCreateModal = (day?: string, period?: number) => {
    setEditingSlot(null);
    const targetDay = day || 'Monday';
    const targetPeriod = period || 1;
    setFormDay(targetDay);
    setFormPeriod(targetPeriod);
    setFormSubject('Mathematics');
    setFormTeacher('Mr. Rajesh Kumar');
    setFormRoom('Room 101');
    setFormTimeRange(defaultTimings[targetPeriod] || '08:30 - 09:15');
    setShowAddModal(true);
    checkConflictOnFormChange('Mr. Rajesh Kumar', 'Room 101', targetDay, targetPeriod);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.day);
    setFormPeriod(slot.period);
    setFormSubject(slot.subject);
    setFormTeacher(slot.teacher || slot.teacher_name || '');
    setFormRoom(slot.room || slot.room_number || '');
    setFormTimeRange(slot.timeRange || defaultTimings[slot.period] || '08:30 - 09:15');
    setShowAddModal(true);
    checkConflictOnFormChange(
      slot.teacher || slot.teacher_name || '',
      slot.room || slot.room_number || '',
      slot.day,
      slot.period,
      slot.id
    );
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSlot) {
      // Check conflict excluding current slot
      const conflict = store.detectTimetableConflicts(
        {
          day: formDay as any,
          period: Number(formPeriod),
          teacher: formTeacher,
          room: formRoom,
          class_name: selectedClass,
          division_name: selectedDivision
        },
        editingSlot.id
      );

      if (conflict) {
        setConflictWarning(conflict);
        setFeedback({ type: 'error', message: conflict.message });
        return;
      }

      // Remove previous slot and insert updated
      store.deleteTimetableSlot(editingSlot.id);
      store.addTimetableSlot({
        day: formDay as any,
        period: Number(formPeriod),
        subject: formSubject,
        teacher: formTeacher,
        room: formRoom,
        timeRange: formTimeRange,
        class_name: selectedClass,
        division_name: selectedDivision
      });

      setFeedback({
        type: 'success',
        message: `Timetable slot for ${formSubject} (${formDay}, Period ${formPeriod}) updated successfully.`
      });
    } else {
      const result = store.addTimetableSlot({
        day: formDay as any,
        period: Number(formPeriod),
        subject: formSubject,
        teacher: formTeacher,
        room: formRoom,
        timeRange: formTimeRange,
        class_name: selectedClass,
        division_name: selectedDivision
      });

      if (!result.success && result.conflict) {
        setConflictWarning(result.conflict);
        setFeedback({ type: 'error', message: result.conflict.message });
        return;
      }

      setFeedback({
        type: 'success',
        message: `Period slot for ${formSubject} scheduled successfully without conflicts.`
      });
    }

    setShowAddModal(false);
    setEditingSlot(null);
    setConflictWarning(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteSlot = (slot: TimetableSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    store.deleteTimetableSlot(slot.id);
    setFeedback({
      type: 'success',
      message: `Removed ${slot.subject} from ${slot.day} (Period ${slot.period}).`
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card-enterprise p-5 sm:p-6 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{t.timetableTitle}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {t.timetableTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.timetableSub}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addSlotBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info notice: Attendance separation guidance */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-[11px] leading-relaxed">
          <strong>Academic Scheduling Module:</strong> This section focuses exclusively on class periods, subject allocations, and teacher schedules. Student daily and period attendance records are maintained separately under the <strong>Attendance History</strong> module.
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-enterprise p-4 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Schedule For:</span>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="A">Division A</option>
              <option value="B">Division B</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="ALL">All Faculty Teachers</option>
              {teachers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Active View: <strong className="text-slate-900 dark:text-white font-semibold">{selectedClass}-{selectedDivision}</strong>
          </span>
          <span>•</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {filteredSlots.length} Scheduled Slots
          </span>
        </div>
      </div>

      {/* Timetable Weekly Grid View */}
      <div className="card-enterprise p-4 sm:p-5 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80 overflow-x-auto responsive-table-container">
        <div className="min-w-[850px]">
          {/* Day Columns Header */}
          <div className="grid grid-cols-6 gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800 text-center font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <div className="py-2 text-slate-400">{t.periodLabel}</div>
            {days.map((d) => (
              <div key={d} className="py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-slate-700 dark:text-slate-200">
                {formatDay(d)}
              </div>
            ))}
          </div>

          {/* Period Rows */}
          <div className="space-y-3 mt-3">
            {periods.map((period) => (
              <div key={period} className="grid grid-cols-6 gap-3 items-stretch">
                {/* Period Time Column */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-center items-center text-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    P{period}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                    {defaultTimings[period]}
                  </span>
                </div>

                {/* Day Slots */}
                {days.map((day) => {
                  const slot = filteredSlots.find((s) => s.day === day && s.period === period);

                  if (!slot) {
                    return (
                      <div
                        key={day}
                        onClick={() => openCreateModal(day, period)}
                        className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-slate-400 hover:border-brand-500 hover:text-brand-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 cursor-pointer transition-all duration-150 text-[11px] group"
                        title={`Click to schedule Period ${period} on ${day}`}
                      >
                        <Plus className="w-3.5 h-3.5 mb-1 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{t.emptySlotLabel}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={day}
                      className="p-3 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 flex flex-col justify-between hover:shadow-md hover:border-brand-400 transition-all group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {slot.subject}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                            {slot.room}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 flex items-center space-x-1">
                          <User className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0" />
                          <span className="truncate">{slot.teacher}</span>
                        </div>
                      </div>

                      {/* Card Footer: Edit and Remove Actions */}
                      <div className="mt-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] font-mono text-slate-400">
                          {slot.timeRange || defaultTimings[period]}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(slot)}
                            className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            title="Edit timetable entry"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSlot(slot, e)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            title="Delete period slot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curriculum & Scheduling Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-enterprise p-4 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Scheduled Subjects ({selectedClass})
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {scheduledSubjects.length > 0 ? (
              scheduledSubjects.map((sub) => (
                <span
                  key={sub}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  {sub}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No subjects scheduled</span>
            )}
          </div>
        </div>

        <div className="card-enterprise p-4 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Faculty Teaching Load
          </span>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Assigned Teachers:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{teachers.length} Faculty Members</strong>
            </div>
            <div className="flex justify-between">
              <span>Weekly Periods:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{filteredSlots.length} Periods</strong>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Attendance Segregation
          </span>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Attendance verification records and CBSE compliance metrics are tracked in the <strong>Attendance History</strong> dashboard.
          </p>
        </div>
      </div>

      {/* Schedule / Edit Period Modal with Conflict Detection */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {editingSlot ? 'Edit Scheduled Period' : 'Schedule Timetable Period'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Configuring for {selectedClass} ({selectedDivision}). Teacher and classroom conflicts are evaluated in real-time.
            </p>

            {conflictWarning && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Scheduling Conflict Detected!</strong>
                  <span>{conflictWarning.message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={(e) => {
                      setFormDay(e.target.value);
                      checkConflictOnFormChange(
                        formTeacher,
                        formRoom,
                        e.target.value,
                        formPeriod,
                        editingSlot?.id
                      );
                    }}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Period</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => {
                      const pNum = Number(e.target.value);
                      setFormPeriod(pNum);
                      setFormTimeRange(defaultTimings[pNum] || formTimeRange);
                      checkConflictOnFormChange(
                        formTeacher,
                        formRoom,
                        formDay,
                        pNum,
                        editingSlot?.id
                      );
                    }}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>Period {p} ({defaultTimings[p]?.split(' - ')[0]})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, English"
                  required
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Teacher</label>
                <input
                  type="text"
                  value={formTeacher}
                  onChange={(e) => {
                    setFormTeacher(e.target.value);
                    checkConflictOnFormChange(
                      e.target.value,
                      formRoom,
                      formDay,
                      formPeriod,
                      editingSlot?.id
                    );
                  }}
                  placeholder="e.g. Mr. Rajesh Kumar"
                  required
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Classroom / Lab</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => {
                      setFormRoom(e.target.value);
                      checkConflictOnFormChange(
                        formTeacher,
                        e.target.value,
                        formDay,
                        formPeriod,
                        editingSlot?.id
                      );
                    }}
                    placeholder="e.g. Room 101, Science Lab"
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={formTimeRange}
                    onChange={(e) => setFormTimeRange(e.target.value)}
                    placeholder="08:30 - 09:15"
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSlot(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!conflictWarning}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-white shadow-sm transition-all ${conflictWarning
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-700'
                    }`}
                >
                  {editingSlot ? 'Update Period Slot' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
