import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ScanFace,
  Fingerprint,
  Phone,
  CheckCircle,
  X,
  FileText,
  Download,
  Printer,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import type { Student } from '@smartattend/shared-types';

export const StudentsPage: React.FC = () => {
  const store = useDataStore();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedCardStudent, setSelectedCardStudent] = useState<Student | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classGrade, setClassGrade] = useState('Grade 10');
  const [division, setDivision] = useState('A');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+91');

  // Bulk Import State
  const [csvText, setCsvText] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  // Division Change State & Permissions
  const isAdmin = store.currentUser?.role === 'school_admin' || store.currentUser?.role === 'super_admin';
  const [divisionUpdateMsg, setDivisionUpdateMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const handleDivisionChange = async (studentId: string, newDiv: string) => {
    const res = await store.updateStudentDivision(studentId, newDiv);
    if (res.success && res.student) {
      setDivisionUpdateMsg({
        msg: `Division successfully updated to Division ${newDiv} for ${res.student.first_name} ${res.student.last_name} (${res.student.admission_number}). Attendance and academic records preserved.`,
        type: 'success'
      });
      setTimeout(() => setDivisionUpdateMsg(null), 4000);
    } else {
      setDivisionUpdateMsg({
        msg: res.error || 'Failed to update student division.',
        type: 'error'
      });
      setTimeout(() => setDivisionUpdateMsg(null), 5000);
    }
  };

  const filteredStudents = store.students.filter((std) => {
    const matchesSearch =
      std.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.roll_number.includes(searchTerm);

    const matchesClass = selectedClass === 'ALL' || std.class_name === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !admissionNumber) return;

    store.addStudent({
      admission_number: admissionNumber,
      first_name: firstName,
      last_name: lastName,
      gender,
      date_of_birth: '2011-05-15',
      class_id: classGrade === 'Grade 10' ? '33333333-3333-3333-3333-333333333310' : '33333333-3333-3333-3333-333333333309',
      division_id: division === 'A' ? '44444444-4444-4444-4444-444444444411' : '44444444-4444-4444-4444-444444444412',
      class_name: classGrade,
      division_name: division,
      roll_number: rollNumber || '10109',
      academic_year_id: '22222222-2222-2222-2222-222222222222',
      is_active: true,
      face_enrolled: false,
      fingerprint_enrolled: false,
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + store.students.length}?w=150`,
      guardians: [
        {
          id: `grd-${Date.now()}`,
          school_id: '11111111-1111-1111-1111-111111111111',
          full_name: guardianName || `${firstName}'s Guardian`,
          relationship: 'FATHER',
          phone_number: guardianPhone,
          whatsapp_opt_in: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    });

    setFirstName('');
    setLastName('');
    setAdmissionNumber('');
    setRollNumber('');
    setGuardianName('');
    setShowAddModal(false);
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'admission_number,first_name,last_name,class_name,division_name,roll_number,gender,guardian_name,guardian_phone\n' +
      'DPS-2026-1010,Siddharth,Rao,Grade 10,A,10110,MALE,Ramesh Rao,+919877788899\n' +
      'DPS-2026-1011,Priya,Sharma,Grade 10,B,10205,FEMALE,Alok Sharma,+919811199922\n' +
      'DPS-2026-0905,Manish,Tiwari,Grade 9,A,09105,MALE,Deepak Tiwari,+919833311144\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'smartattend_sample_students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleProcessBulkImport = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      setBulkFeedback('CSV is empty or missing data rows.');
      return;
    }

    const studentsToImport: any[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const [adm, fName, lName, cName, div, roll, gnd, gName, gPhone] = line.split(',').map((s) => s.trim());

      if (adm && fName && lName) {
        studentsToImport.push({
          admission_number: adm,
          first_name: fName,
          last_name: lName,
          class_name: cName || 'Grade 10',
          division_name: div || 'A',
          roll_number: roll || String(10100 + i),
          gender: (gnd?.toUpperCase() as any) || 'MALE',
          date_of_birth: '2011-04-10',
          class_id: '33333333-3333-3333-3333-333333333310',
          division_id: '44444444-4444-4444-4444-444444444411',
          academic_year_id: '22222222-2222-2222-2222-222222222222',
          is_active: true,
          face_enrolled: false,
          fingerprint_enrolled: false,
          avatar_url: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=150`,
          guardians: [
            {
              id: `grd-bulk-${Date.now()}-${i}`,
              school_id: '11111111-1111-1111-1111-111111111111',
              full_name: gName || `${fName}'s Parent`,
              relationship: 'GUARDIAN',
              phone_number: gPhone || '+919800000000',
              whatsapp_opt_in: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        });
      }
    }

    if (studentsToImport.length > 0) {
      store.bulkImportStudents(studentsToImport);
      setBulkFeedback(`Successfully imported ${studentsToImport.length} students into directory!`);
      setTimeout(() => {
        setBulkFeedback(null);
        setCsvText('');
        setShowBulkModal(false);
      }, 1500);
    } else {
      setBulkFeedback('Could not parse any valid student records. Please check the CSV format.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.studentDirectoryTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.studentDirectorySub}
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>{t.bulkCsvImport}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.registerStudentBtn}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset student records and attendance to original seed data?')) {
                store.resetToDefaults();
              }
            }}
            title="Reset to default seed data"
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-enterprise p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.classLabel}</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">{t.allClasses}</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 9">Grade 9</option>
            </select>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {t.totalStudents}: {filteredStudents.length} {language === 'mr' ? 'विद्यार्थी' : 'Students'}
          </span>
        </div>
      </div>

      {/* Division Reassignment Status Feedback */}
      {divisionUpdateMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
            divisionUpdateMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {divisionUpdateMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{divisionUpdateMsg.msg}</span>
        </div>
      )}

      {/* Student Directory Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto responsive-table-container">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.colStudent}</th>
                <th className="py-3 px-4">{t.colAdmissionNo}</th>
                <th className="py-3 px-4">{t.colClassDivision}</th>
                <th className="py-3 px-4">{t.colRollNo}</th>
                <th className="py-3 px-4">{t.colBiometrics}</th>
                <th className="py-3 px-4">{t.colGuardian}</th>
                <th className="py-3 px-4 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {t.noRecordsFound}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={std.avatar_url || 'https://images.unsplash.com/photo-1534528741775?w=150'}
                          alt={std.first_name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{std.first_name} {std.last_name}</p>
                          <p className="text-[11px] text-slate-400">
                            {std.gender === 'MALE' ? t.maleOption : std.gender === 'FEMALE' ? t.femaleOption : t.otherOption}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">{std.admission_number}</td>

                    <td className="py-3 px-4">
                      {isAdmin ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] whitespace-nowrap">
                            {std.class_name} -
                          </span>
                          <select
                            value={std.division_name || 'A'}
                            onChange={(e) => handleDivisionChange(std.id, e.target.value)}
                            title="Admin/Principal: Change Student Division"
                            className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/70 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold rounded px-1.5 py-0.5 text-[11px] border border-brand-200 dark:border-brand-800 cursor-pointer focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                          >
                            <option value="A">Div A</option>
                            <option value="B">Div B</option>
                            <option value="C">Div C</option>
                            <option value="D">Div D</option>
                          </select>
                        </div>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {std.class_name} - {std.division_name}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{std.roll_number}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {std.face_enrolled ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            <ScanFace className="w-3 h-3" />
                            <span>{t.badgeFace}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{t.badgeNoFace}</span>
                        )}

                        {std.fingerprint_enrolled ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            <Fingerprint className="w-3 h-3" />
                            <span>{t.badgeFinger}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{t.badgeNoFinger}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {std.guardians && std.guardians.length > 0 ? (
                        <div>
                          <p className="text-slate-900 dark:text-white font-semibold">{std.guardians[0].full_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{std.guardians[0].phone_number}</span>
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">{t.badgeNoneLinked}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCardStudent(std)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>{t.badgeIdCard}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk CSV Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Bulk Student CSV Import</h3>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-900 dark:text-brand-200">Need a CSV template?</p>
                  <p className="text-[11px] text-brand-700 dark:text-brand-300">Download the pre-formatted Excel/CSV template with sample columns.</p>
                </div>
                <button
                  onClick={downloadSampleCsv}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Or Paste CSV Data Directly:</label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="admission_number,first_name,last_name,class_name,division_name,roll_number,gender,guardian_name,guardian_phone"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {bulkFeedback && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{bulkFeedback}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessBulkImport}
                  className="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Process Import</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student ID Card & QR Modal */}
      {selectedCardStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Controls */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">Digital Student Identity Card</span>
              <button onClick={() => setSelectedCardStudent(null)} className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable ID Card Body */}
            <div id="printable-id-card" className="p-6 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 text-white relative overflow-hidden">
              {/* Background watermark seal */}
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <QrCode className="w-48 h-48 text-white" />
              </div>

              {/* Card Header */}
              <div className="border-b border-white/20 pb-3 mb-4 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400">Connected Campus</span>
                <h3 className="font-extrabold text-sm tracking-tight text-white mt-0.5">{store.schoolName}</h3>
                <span className="text-[9px] text-slate-300 font-mono">Affiliation No. 272001 • {store.schoolCode}</span>
              </div>

              {/* Photo & Details */}
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={selectedCardStudent.avatar_url || 'https://images.unsplash.com/photo-1534528741775?w=150'}
                  alt={selectedCardStudent.first_name}
                  className="w-20 h-24 object-cover rounded-xl border-2 border-white/40 shadow-lg"
                />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base leading-tight text-white">
                    {selectedCardStudent.first_name} {selectedCardStudent.last_name}
                  </h4>
                  <p className="text-[11px] text-brand-300 font-semibold">
                    {selectedCardStudent.class_name} - Section {selectedCardStudent.division_name}
                  </p>
                  <p className="text-[10px] text-slate-300 font-mono">Roll: <span className="text-white font-bold">{selectedCardStudent.roll_number}</span></p>
                  <p className="text-[10px] text-slate-300 font-mono">Adm: <span className="text-white font-bold">{selectedCardStudent.admission_number}</span></p>
                  <p className="text-[10px] text-slate-300 font-mono">Blood Group: <span className="text-emerald-400 font-bold">B+</span></p>
                </div>
              </div>

              {/* QR Code & Barcode Verification Strip */}
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-brand-300 tracking-wider block">Biometric Gateway QR</span>
                  <p className="text-[10px] text-slate-200">Emergency Contact:</p>
                  <p className="text-[11px] font-mono font-bold text-white">
                    {selectedCardStudent.guardians?.[0]?.phone_number || '+919811122233'}
                  </p>
                </div>

                {/* Vector QR Graphic */}
                <div className="w-14 h-14 bg-white rounded-xl p-1 shadow-md flex items-center justify-center shrink-0">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="flex items-center justify-between text-[9px] text-slate-300 border-t border-white/15 pt-2">
                <span>Valid: 2026-2027</span>
                <span className="font-mono text-emerald-400 font-semibold">Verified Biometric Profile</span>
              </div>
            </div>

            {/* Print Action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Student Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Enroll New Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Siddharth"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Rao"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Admission Number *</label>
                  <input
                    type="text"
                    required
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="DPS-2026-1010"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="10110"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Class Grade</label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Section</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">Primary Guardian Contact</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Ramesh Rao"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Guardian Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="+919877788899"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
