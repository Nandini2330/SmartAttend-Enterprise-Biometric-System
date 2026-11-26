import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Info
} from 'lucide-react';
import { useDataStore, CalendarEventModel } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';

export const CalendarPage: React.FC = () => {
  const store = useDataStore();
  const { t, language } = useLanguage();
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 0-indexed: 10 = November
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventType, setEventType] = useState<'HOLIDAY' | 'EXAMINATION' | 'VACATION' | 'EVENT' | 'SPECIAL_WORKING_DAY'>('HOLIDAY');
  const [startDate, setStartDate] = useState<string>('2026-11-15');
  const [endDate, setEndDate] = useState<string>('2026-11-15');
  const [eventDesc, setEventDesc] = useState<string>('');
  const [isInstructional, setIsInstructional] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesMr = [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ];

  const currentMonthName = language === 'mr' ? monthNamesMr[currentMonth] : monthNamesEn[currentMonth];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Days in month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  // Pad previous month days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getEventsForDate = (day: number): CalendarEventModel[] => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    return store.calendarEvents.filter(
      (evt) => dateStr >= evt.start_date && dateStr <= evt.end_date
    );
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !startDate) return;

    store.addCalendarEvent({
      school_id: '11111111-1111-1111-1111-111111111111',
      academic_year_id: '22222222-2222-2222-2222-222222222222',
      title: eventTitle,
      event_type: eventType,
      start_date: startDate,
      end_date: endDate || startDate,
      description: eventDesc,
      is_instructional_day: isInstructional
    });

    setFeedback(`Event '${eventTitle}' added to institutional calendar.`);
    setShowAddModal(false);
    setEventTitle('');
    setEventDesc('');
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteEvent = (id: string) => {
    store.deleteCalendarEvent(id);
    setFeedback('Event removed from institutional calendar.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.calendarTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.calendarSub}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addEventBtn}</span>
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/80 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block">Automated Attendance Exclusion Active:</strong>
          <span>
            Dates designated as Holidays or Vacations are automatically excluded from daily attendance percentage calculations
            and absence reconciliation. Parents will NOT receive absence alert messages on registered holidays.
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Calendar Navigation Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {currentMonthName} {currentYear}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 dark:text-slate-400">{t.holiday}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-slate-600 dark:text-slate-400">{t.examsTab}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-600 dark:text-slate-400">{t.holidaysTab}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">{t.eventsTab}</span>
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-center font-semibold text-xs text-slate-400 uppercase">
          <div>{t.daySun}</div>
          <div>{t.dayMon}</div>
          <div>{t.dayTue}</div>
          <div>{t.dayWed}</div>
          <div>{t.dayThu}</div>
          <div>{t.dayFri}</div>
          <div>{t.daySat}</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-3">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[58px] sm:h-28 rounded-lg bg-slate-50/40 dark:bg-slate-800/20" />;
            }

            const events = getEventsForDate(day);
            const isToday =
              day === new Date().getDate() &&
              currentMonth === new Date().getMonth() &&
              currentYear === new Date().getFullYear();

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[58px] sm:h-28 p-1 sm:p-2 rounded-lg border flex flex-col justify-between transition-colors ${isToday
                    ? 'border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${isToday
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px]'
                        : 'text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                      <span className="hidden sm:inline">{events.length} evt</span>
                      <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-16 pr-0.5">
                  {events.map((evt) => {
                    const badgeColor =
                      evt.event_type === 'HOLIDAY'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                        : evt.event_type === 'EXAMINATION'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200'
                          : evt.event_type === 'VACATION'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';

                    return (
                      <div
                        key={evt.id}
                        className={`text-[9px] sm:text-[10px] p-0.5 sm:p-1 rounded font-medium truncate border ${badgeColor}`}
                        title={`${evt.title}: ${evt.description || ''}`}
                      >
                        <span className="hidden sm:inline">{evt.title}</span>
                        <span className="sm:hidden text-[8px] font-bold">●</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Registered Academic Year Events ({store.calendarEvents.length})
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {store.calendarEvents.map((evt) => (
            <div key={evt.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{evt.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.event_type === 'HOLIDAY'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : evt.event_type === 'EXAMINATION'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : evt.event_type === 'VACATION'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                  >
                    {evt.event_type}
                  </span>
                  {evt.is_instructional_day && (
                    <span className="text-[10px] text-emerald-600 font-semibold">• Attendance Required</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Dates: {evt.start_date} {evt.end_date !== evt.start_date ? `to ${evt.end_date}` : ''} • {evt.description}
                </div>
              </div>

              <button
                onClick={() => handleDeleteEvent(evt.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Remove event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Add School Calendar Event</h2>
            <p className="text-xs text-slate-500 mb-4">
              Create holidays, exam schedules, vacations, or working day exceptions.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Event Category</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="HOLIDAY">Holiday (Campus Closed)</option>
                  <option value="EXAMINATION">Examination Window</option>
                  <option value="VACATION">Vacation Break</option>
                  <option value="EVENT">School Event / Assembly</option>
                  <option value="SPECIAL_WORKING_DAY">Special Working Day (Saturday)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Guru Nanak Jayanti"
                  required
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  rows={2}
                  placeholder="Optional details or instructions..."
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstructional}
                  onChange={(e) => setIsInstructional(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Instructional Day (Students must attend and attendance is counted)
                </span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
