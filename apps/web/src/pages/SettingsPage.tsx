import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  GraduationCap,
  Plus,
  Trash2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';

export const SettingsPage: React.FC = () => {
  const store = useDataStore();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'POLICIES' | 'HOLIDAYS' | 'PROMOTIONS'>('POLICIES');

  // Gate Policy State
  const [openingTime, setOpeningTime] = useState(store.openingTime);
  const [graceMinutes, setGraceMinutes] = useState(store.graceMinutes);
  const [cutoffTime, setCutoffTime] = useState(store.cutoffTime);
  const [saved, setSaved] = useState(false);

  // Holiday State (Feature 10)
  const [holDate, setHolDate] = useState('');
  const [holName, setHolName] = useState('');
  const [holDesc, setHolDesc] = useState('');
  const [holSuccess, setHolSuccess] = useState<string | null>(null);

  // Promotion Wizard State (Feature 9)
  const [fromClass, setFromClass] = useState('Grade 9');
  const [toClass, setToClass] = useState('Grade 10');
  const [targetAcademicYear, setTargetAcademicYear] = useState('2027-2028');
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    store.openingTime = openingTime;
    store.graceMinutes = Number(graceMinutes);
    store.cutoffTime = cutoffTime;
    store.notify();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holDate || !holName.trim()) return;

    await store.addHoliday({
      school_id: '11111111-1111-1111-1111-111111111111',
      academic_year_id: '22222222-2222-2222-2222-222222222222',
      holiday_date: holDate,
      name: holName.trim(),
      description: holDesc.trim() || undefined
    });

    setHolSuccess(
      language === 'mr'
        ? `"${holName}" शालेय दिनदर्शिकेत अधिकृत सुट्टी म्हणून जोडली गेली.`
        : `Added "${holName}" to official school holiday calendar.`
    );
    setHolDate('');
    setHolName('');
    setHolDesc('');
    setTimeout(() => setHolSuccess(null), 4000);
  };

  const handleRunPromotion = async () => {
    const count = await store.promoteStudents(fromClass, toClass, targetAcademicYear);
    setPromoSuccess(
      language === 'mr'
        ? `तुकडी वर्गोन्नती पूर्ण: सत्र ${targetAcademicYear} साठी ${fromClass} मधून ${toClass} मध्ये ${count} विद्यार्थी यशस्वीपणे स्थलांतरित झाले.`
        : `Batch promotion complete: ${count} students successfully migrated from ${fromClass} to ${toClass} for session ${targetAcademicYear}.`
    );
    setTimeout(() => setPromoSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {language === 'mr' ? 'शाळा संरचना आणि शैक्षणिक व्यवस्थापन' : 'Institutional Configuration & Academic Operations'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'mr'
            ? 'शाळेच्या गेटचे नियम, अधिकृत सुट्ट्यांचे वेळापत्रक आणि विद्यार्थ्यांची वर्गोन्नती व्यवस्थापित करा.'
            : 'Manage school gate policies, official calendar holidays, and student academic year promotions.'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
        <button
          onClick={() => setActiveTab('POLICIES')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${activeTab === 'POLICIES'
            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.tabPolicies}</span>
        </button>

        <button
          onClick={() => setActiveTab('HOLIDAYS')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${activeTab === 'HOLIDAYS'
            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.tabHolidays}</span>
          <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
            {store.holidays.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PROMOTIONS')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${activeTab === 'PROMOTIONS'
            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t.tabPromotions}</span>
        </button>
      </div>

      {/* TAB 1: GATE POLICIES */}
      {activeTab === 'POLICIES' && (
        <form onSubmit={handleSavePolicies} className="card-enterprise p-6 space-y-6 max-w-3xl">
          {saved && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {language === 'mr'
                  ? 'शाळेच्या गेटच्या वेळा आणि अनुपस्थितीचे नियम यशस्वीरीत्या अद्यतनित केले गेले!'
                  : 'School gate timings and absence policy updated successfully!'}
              </span>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{t.attendanceRulesTitle}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'mr' ? 'शाळा सुरू होण्याची घंटा (वेळ)' : 'Official Opening Bell'}
                </label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                  {language === 'mr' ? 'सकाळची मुख्य उपस्थिती नोंद वेळ' : 'Standard morning entry bell'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'mr' ? 'सवलत कालावधी (मिनिटे)' : 'Grace Period (Minutes)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                  {language === 'mr' ? 'सवलत संपल्यानंतर "उशिरा" नोंद होईल' : 'After grace, marked LATE'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'mr' ? 'अनुपस्थिती कटऑफ वेळ' : 'Absence Cutoff Time'}
                </label>
                <input
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                  {language === 'mr' ? 'अनुपस्थित सूचना पाठवली जाते' : 'Triggers absent alerts'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'mr' ? 'शाळा संरचना जतन करा' : 'Save School Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SCHOOL CALENDAR & HOLIDAYS (Feature 10) */}
      {activeTab === 'HOLIDAYS' && (
        <div className="space-y-6">
          {holSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{holSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Holiday Form */}
            <div className="card-enterprise p-5 lg:col-span-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>{language === 'mr' ? 'नवीन सुट्टी जाहीर करा' : 'Declare School Holiday'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                {language === 'mr'
                  ? 'सुट्टीच्या दिवशी अनुपस्थिती पडताळणी किंवा दंड आकारला जात नाही.'
                  : 'Holidays automatically exempt students from morning absence reconciliation and attendance penalties.'}
              </p>

              <form onSubmit={handleAddHoliday} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.holidayDateLabel}
                  </label>
                  <input
                    type="date"
                    value={holDate}
                    onChange={(e) => setHolDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.holidayNameLabel}
                  </label>
                  <input
                    type="text"
                    value={holName}
                    onChange={(e) => setHolName(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. दिवाळी (लक्ष्मीपूजन)' : 'e.g. Diwali (Laxmi Pujan)'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.holidayDescLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={holDesc}
                    onChange={(e) => setHolDesc(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. राष्ट्रीय सार्वजनिक सुट्टी - शाळा बंद राहील' : 'e.g. National Public Holiday - Campus closed'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'mr' ? 'शालेय दिनदर्शिकेत जोडा' : 'Add to School Calendar'}</span>
                </button>
              </form>
            </div>

            {/* Holiday Roster */}
            <div className="card-enterprise p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {language === 'mr' ? 'अधिकृत शालेय सुट्ट्या' : 'Official Institutional Holidays'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'mr' ? 'शैक्षणिक वर्ष २०२६-२०२७ यादी' : 'Academic Year 2026-2027 Roster'}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {language === 'mr' ? `${store.holidays.length} सुट्ट्या नोंदवल्या` : `${store.holidays.length} Days Declared`}
                </span>
              </div>

              <div className="space-y-3">
                {store.holidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex flex-col items-center justify-center border border-brand-200 dark:border-brand-800 font-mono">
                        <span className="text-[10px] font-bold uppercase">
                          {new Date(h.holiday_date).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', { month: 'short' })}
                        </span>
                        <span className="text-xs font-extrabold leading-none">
                          {new Date(h.holiday_date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{h.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{h.description || (language === 'mr' ? 'शालेय सुट्टी' : 'Institutional Holiday')}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                        {h.holiday_date}
                      </span>
                      <button
                        onClick={() => store.deleteHoliday(h.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors"
                        title={language === 'mr' ? 'सुट्टी काढा' : 'Remove Holiday'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC YEAR & STUDENT PROMOTION WIZARD (Feature 9) */}
      {activeTab === 'PROMOTIONS' && (
        <div className="space-y-6">
          {promoSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{promoSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Status Overview */}
            <div className="card-enterprise p-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {language === 'mr' ? 'शैक्षणिक सत्रे आणि मुदत मर्यादा' : 'Academic Sessions & Term Boundaries'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'सध्या सुरू असलेले आणि आगामी शैक्षणिक वर्ष' : 'Current running and upcoming academic years'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {language === 'mr' ? 'सध्याचे चालू शैक्षणिक वर्ष' : 'Current Academic Year'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase">
                    {language === 'mr' ? 'सक्रिय' : 'Active'}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">2026-2027</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'सत्र कालावधी: ०१ एप्रिल २०२६ → ३१ मार्च २०२७' : 'Term Duration: 01 April 2026 → 31 March 2027'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'mr' ? 'आगामी शैक्षणिक वर्ष' : 'Target Academic Year'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                    {language === 'mr' ? 'आगामी' : 'Upcoming'}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">2027-2028</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'सत्र कालावधी: ०१ एप्रिल २०२७ → ३१ मार्च २०२८' : 'Term Duration: 01 April 2027 → 31 March 2028'}
                </p>
              </div>
            </div>

            {/* Batch Promotion Wizard Form */}
            <div className="card-enterprise p-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {language === 'mr' ? 'वार्षिक तुकडी वर्गोन्नती प्रक्रिया' : 'Annual Batch Promotion Wizard'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'mr'
                    ? 'मागील वर्षाच्या हजेरी नोंदी सुरक्षित ठेवून विद्यार्थ्यांना पुढील वर्गात बढती द्या.'
                    : 'Promote students across academic grades while preserving historical attendance records.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {language === 'mr'
                    ? 'वर्गोन्नतीमुळे संबंधित इयत्तेतील विद्यार्थ्यांची नवीन इयत्ता अद्ययावत होते. जुनी दैनिक उपस्थिती आणि बायोमेट्रिक नोंदी सुरक्षित राहतात.'
                    : 'Promotion updates the active class for all students in the source grade. Historical daily attendance and biometrics remain fully intact and linked via student UUIDs.'}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'mr' ? 'सध्याची इयत्ता (Source)' : 'Source Grade'}
                    </label>
                    <select
                      value={fromClass}
                      onChange={(e) => setFromClass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 8">Grade 8</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'mr' ? 'पुढील इयत्ता (Target)' : 'Target Grade'}
                    </label>
                    <select
                      value={toClass}
                      onChange={(e) => setToClass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-bold text-brand-600"
                    >
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Graduated">
                        {language === 'mr' ? 'उत्तीर्ण / माजी विद्यार्थी' : 'Graduated / Alumni'}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'mr' ? 'नवीन शैक्षणिक वर्ष' : 'New Academic Session'}
                  </label>
                  <input
                    type="text"
                    value={targetAcademicYear}
                    onChange={(e) => setTargetAcademicYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                  <span>{language === 'mr' ? 'वर्गोन्नतीसाठी तयार विद्यार्थी: ' : 'Students queued for promotion: '}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {store.students.filter((s) => s.class_name === fromClass).length} {language === 'mr' ? 'विद्यार्थी' : 'Students'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRunPromotion}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{language === 'mr' ? 'वर्गोन्नती तुकडी लागू करा' : 'Execute Grade Promotion Batch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
