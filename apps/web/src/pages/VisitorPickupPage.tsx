import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  UserCheck,
  Clock,
  Printer,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  Send,
  CheckSquare,
  Lock,
  FileCheck,
  Users,
  Shield,
  UserPlus,
  LogOut,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import type { Student, VisitorPickup, SchoolVisitor, PickupAuthorization, VisitorPurpose } from '@smartattend/shared-types';

interface VisitorLog {
  id: string;
  visitorName: string;
  visitorPhone: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  relationship: string;
  status: 'AUTHORIZED' | 'UNAUTHORIZED_BLOCKED' | 'PASS_ISSUED';
  checkoutTime: string;
  gatePassNo: string;
  remarks: string;
}

export const VisitorPickupPage: React.FC = () => {
  const store = useDataStore();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<'STUDENT_PICKUP' | 'CAMPUS_VISITORS' | 'PRE_AUTHORIZED'>('STUDENT_PICKUP');

  // --------------------------------------------------------------------------
  // SECTION 1: Student Early Pickup & Gate Pass State
  // --------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('+91');
  const [relationship, setRelationship] = useState('Parent / Guardian');
  const [pickupReason, setPickupReason] = useState('Doctor appointment / family emergency');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [issuedPass, setIssuedPass] = useState<VisitorLog | null>(null);

  // OTP Verification State
  const [pendingOtp, setPendingOtp] = useState<{ pickupId: string; otpCode: string } | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpDispatched, setOtpDispatched] = useState(false);

  // Dismissal logs
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([
    {
      id: 'vis-01',
      visitorName: 'Vikram Mehta',
      visitorPhone: '+919811122233',
      studentId: '88888888-8888-8888-8888-888888888801',
      studentName: 'Aarav Mehta',
      admissionNumber: 'DPS-2026-1001',
      relationship: 'FATHER',
      status: 'PASS_ISSUED',
      checkoutTime: '11:45:00',
      gatePassNo: 'GATE-PASS-2026-089',
      remarks: 'Dental appointment approved'
    }
  ]);

  // --------------------------------------------------------------------------
  // SECTION 2: General Campus Visitors State
  // --------------------------------------------------------------------------
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [visitorFilter, setVisitorFilter] = useState<'ALL' | 'CHECKED_IN' | 'CHECKED_OUT'>('ALL');
  const [genVisitorName, setGenVisitorName] = useState('');
  const [genVisitorPhone, setGenVisitorPhone] = useState('+91');
  const [genVisitorEmail, setGenVisitorEmail] = useState('');
  const [genPurpose, setGenPurpose] = useState<VisitorPurpose>('OFFICIAL_MEETING');
  const [genWhomToMeet, setGenWhomToMeet] = useState('Principal Office');
  const [genIdType, setGenIdType] = useState('Govt Photo ID');
  const [genIdNumber, setGenIdNumber] = useState('');
  const [genRemarks, setGenRemarks] = useState('');

  // --------------------------------------------------------------------------
  // SECTION 3: Pre-Authorized Pickup Persons State
  // --------------------------------------------------------------------------
  const [showAddAuthModal, setShowAddAuthModal] = useState(false);
  const [authStudentId, setAuthStudentId] = useState('');
  const [authPersonName, setAuthPersonName] = useState('');
  const [authPersonPhone, setAuthPersonPhone] = useState('+91');
  const [authRelation, setAuthRelation] = useState('GRANDFATHER');
  const [authIdNumber, setAuthIdNumber] = useState('');
  const [authValidFrom, setAuthValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [authValidUntil, setAuthValidUntil] = useState('2027-03-31');

  // Filter students based on role and search
  const isParent = store.currentUser.role === 'parent';
  const accessibleStudents = isParent
    ? store.students.filter((s) => s.admission_number === 'DPS-2026-1001') // parent Vikram Mehta
    : store.students;

  const filteredStudents = accessibleStudents.filter(
    (s) =>
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check whitelisted guardians AND pre-authorized persons for selected student
  const matchedGuardian = selectedStudent?.guardians?.find(
    (g) =>
      g.full_name.toLowerCase().includes(visitorName.trim().toLowerCase()) ||
      (visitorPhone.length > 5 && g.phone_number.includes(visitorPhone.replace(/\s+/g, '')))
  ) || (selectedStudent?.admission_number === 'DPS-2026-1001' && (visitorName.toLowerCase().includes('vikram') || visitorPhone.includes('9811122233')) ? { id: 'g-vikram', full_name: 'Vikram Mehta', phone_number: '+919811122233', relationship: 'FATHER' } : null);

  const matchedPreAuth = selectedStudent
    ? store.pickupAuthorizations.find(
      (a) =>
        a.student_id === selectedStudent.id &&
        a.is_active &&
        (a.authorized_person_name.toLowerCase().includes(visitorName.trim().toLowerCase()) ||
          (visitorPhone.length > 5 && a.authorized_person_phone.includes(visitorPhone.replace(/\s+/g, ''))))
    )
    : null;

  const isAuthorized = !!matchedGuardian || !!matchedPreAuth;

  // --------------------------------------------------------------------------
  // Pickup OTP Handlers
  // --------------------------------------------------------------------------
  const handleRequestOtp = () => {
    if (!selectedStudent || !visitorName.trim()) return;

    if (!isAuthorized) {
      setFeedback({
        type: 'error',
        message: 'Security Exception: Visitor is NOT registered in student guardian or pre-authorized whitelist. Pickup blocked!'
      });
      store.blockUnauthorizedPickup({
        student_id: selectedStudent.id,
        visitor_name: visitorName,
        visitor_phone: visitorPhone,
        relationship,
        reason: 'Attempted pickup by unregistered visitor intercepted at campus gate'
      });
      return;
    }

    const effectiveRelation = matchedGuardian?.relationship || matchedPreAuth?.relationship_to_child || relationship;

    const { pickup, otp } = store.requestPickupOtp({
      student_id: selectedStudent.id,
      visitor_name: visitorName,
      visitor_phone: visitorPhone,
      relationship: effectiveRelation,
      pickup_reason: pickupReason
    });

    (window as any).__lastPickupOtp = otp;

    setPendingOtp({ pickupId: pickup.id, otpCode: otp });
    setOtpDispatched(true);
    setFeedback({
      type: 'success',
      message: `6-Digit OTP (${otp}) dispatched to registered guardian (${matchedGuardian?.phone_number || matchedPreAuth?.authorized_person_phone || visitorPhone}). Enter OTP to authorize gate exit.`
    });
  };

  const handleVerifyOtp = () => {
    if (!pendingOtp || !selectedStudent) return;
    const result = store.verifyPickupOtp(pendingOtp.pickupId, enteredOtp);

    if (!result.success) {
      setFeedback({ type: 'error', message: result.message });
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
    const passNo = result.gatePassNumber || `GATE-PASS-${now.getFullYear()}-999`;

    const newLog: VisitorLog = {
      id: pendingOtp.pickupId,
      visitorName,
      visitorPhone,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      admissionNumber: selectedStudent.admission_number,
      relationship: matchedGuardian?.relationship || matchedPreAuth?.relationship_to_child || relationship,
      status: 'PASS_ISSUED',
      checkoutTime: timeStr,
      gatePassNo: passNo,
      remarks: pickupReason
    };

    setVisitorLogs([newLog, ...visitorLogs]);
    setIssuedPass(newLog);
    setPendingOtp(null);
    setEnteredOtp('');
    setOtpDispatched(false);
    setFeedback({
      type: 'success',
      message: `OTP verified! Gate exit pass ${passNo} issued. Student dismissed safely.`
    });
  };

  const handleBlockPickup = () => {
    if (!selectedStudent) return;
    store.blockUnauthorizedPickup({
      student_id: selectedStudent.id,
      visitor_name: visitorName || 'Unknown Person',
      visitor_phone: visitorPhone,
      relationship,
      reason: pickupReason || 'Unverified visitor requested student release'
    });

    const newLog: VisitorLog = {
      id: `vis-block-${Date.now()}`,
      visitorName: visitorName || 'Unknown Person',
      visitorPhone,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      admissionNumber: selectedStudent.admission_number,
      relationship,
      status: 'UNAUTHORIZED_BLOCKED',
      checkoutTime: new Date().toLocaleTimeString('en-GB'),
      gatePassNo: 'BLOCKED',
      remarks: 'Pickup intercepted & denied by gatekeeper'
    };

    setVisitorLogs([newLog, ...visitorLogs]);
    setFeedback({
      type: 'error',
      message: `Security Alert: Unauthorized pickup attempt logged. Student detained securely on campus.`
    });
  };

  const handleIssueGatePassDirect = () => {
    if (!selectedStudent || !visitorName.trim()) return;

    if (!isAuthorized) {
      handleBlockPickup();
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
    const passNo = `GATE-PASS-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    store.recordCheckOut(selectedStudent.id, timeStr);

    const newLog: VisitorLog = {
      id: `vis-${Date.now()}`,
      visitorName,
      visitorPhone,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      admissionNumber: selectedStudent.admission_number,
      relationship: matchedGuardian?.relationship || matchedPreAuth?.relationship_to_child || 'AUTHORIZED_PERSON',
      status: 'PASS_ISSUED',
      checkoutTime: timeStr,
      gatePassNo: passNo,
      remarks: pickupReason
    };

    setVisitorLogs([newLog, ...visitorLogs]);
    setIssuedPass(newLog);
    setFeedback({
      type: 'success',
      message: `Verified gate exit pass ${passNo} issued directly by security staff.`
    });
  };

  // --------------------------------------------------------------------------
  // General Campus Visitor Handlers
  // --------------------------------------------------------------------------
  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genVisitorName.trim() || !genVisitorPhone.trim()) return;

    const registered = store.registerSchoolVisitor({
      full_name: genVisitorName,
      phone_number: genVisitorPhone,
      email: genVisitorEmail,
      purpose: genPurpose,
      whom_to_meet: genWhomToMeet,
      id_proof_type: genIdType,
      id_proof_number: genIdNumber,
      remarks: genRemarks
    });

    setFeedback({
      type: 'success',
      message: `Campus visitor '${registered.full_name}' registered with Badge ID ${registered.badge_number}.`
    });

    setShowAddVisitorModal(false);
    setGenVisitorName('');
    setGenVisitorPhone('+91');
    setGenVisitorEmail('');
    setGenIdNumber('');
    setGenRemarks('');
  };

  const handleCheckoutVisitor = (visitorId: string) => {
    const success = store.checkOutSchoolVisitor(visitorId);
    if (success) {
      setFeedback({
        type: 'success',
        message: 'Visitor checked out successfully. Campus badge returned.'
      });
    }
  };

  // --------------------------------------------------------------------------
  // Pre-Authorized Pickup Person Handlers
  // --------------------------------------------------------------------------
  const handleAddPreAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authStudentId || !authPersonName.trim()) return;

    store.addPickupAuthorization({
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: authStudentId,
      guardian_id: '99999999-9999-9999-9999-999999999901',
      authorized_person_name: authPersonName,
      authorized_person_phone: authPersonPhone,
      relationship_to_child: authRelation,
      id_proof_number: authIdNumber,
      valid_from: authValidFrom,
      valid_until: authValidUntil,
      is_active: true
    });

    setFeedback({
      type: 'success',
      message: `Pre-authorized pickup person '${authPersonName}' (${authRelation}) added successfully.`
    });

    setShowAddAuthModal(false);
    setAuthPersonName('');
    setAuthPersonPhone('+91');
    setAuthIdNumber('');
  };

  // Filtering general visitors
  const filteredCampusVisitors = store.schoolVisitors.filter((v) => {
    if (visitorFilter === 'CHECKED_IN') return v.status === 'CHECKED_IN';
    if (visitorFilter === 'CHECKED_OUT') return v.status === 'CHECKED_OUT';
    return true;
  });

  const checkedInCount = store.schoolVisitors.filter((v) => v.status === 'CHECKED_IN').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>{t.visitorTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.visitorSub}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            id="tab-student-pickup"
            onClick={() => setActiveSection('STUDENT_PICKUP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeSection === 'STUDENT_PICKUP'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.tabStudentPickup}</span>
          </button>

          <button
            type="button"
            id="tab-campus-visitors"
            onClick={() => setActiveSection('CAMPUS_VISITORS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeSection === 'CAMPUS_VISITORS'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.tabCampusVisitors} ({checkedInCount})</span>
          </button>

          <button
            type="button"
            id="tab-pre-authorized"
            onClick={() => setActiveSection('PRE_AUTHORIZED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeSection === 'PRE_AUTHORIZED'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.tabPreAuthorized}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 1: STUDENT EARLY PICKUP & GATE PASS                          */}
      {/* ==================================================================== */}
      {activeSection === 'STUDENT_PICKUP' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Student Directory Search */}
            <div className="card-enterprise p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Select Student for Release</h2>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{filteredStudents.length} Students</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student by name or admission..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredStudents.map((std) => {
                  const isSelected = selectedStudent?.id === std.id;
                  return (
                    <div
                      key={std.id}
                      onClick={() => {
                        setSelectedStudent(std);
                        const preAuth = store.getAuthorizedPickupsForStudent(std.id)[0];
                        const defaultName = std.guardians?.[0]?.full_name || (std.admission_number === 'DPS-2026-1001' ? 'Vikram Mehta' : (preAuth?.authorized_person_name || ''));
                        const defaultPhone = std.guardians?.[0]?.phone_number || (std.admission_number === 'DPS-2026-1001' ? '+919811122233' : (preAuth?.authorized_person_phone || '+91'));
                        const defaultRel = std.guardians?.[0]?.relationship || (std.admission_number === 'DPS-2026-1001' ? 'FATHER' : (preAuth?.relationship_to_child || 'Parent / Guardian'));
                        setVisitorName(defaultName);
                        setVisitorPhone(defaultPhone);
                        setRelationship(defaultRel);
                        setFeedback(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                        ? 'bg-brand-50/70 dark:bg-brand-950/60 border-brand-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      id={`student-card-${std.admission_number}`}
                      data-testid="student-card"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {std.first_name} {std.last_name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {std.admission_number} • {std.class_name}-{std.division_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Roll {std.roll_number}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Visitor Verification Form */}
            <div className="lg:col-span-2 card-enterprise p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Verify Pickup & Issue Gate Pass</h2>
                </div>
                {selectedStudent && (
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    {selectedStudent.first_name} {selectedStudent.last_name} ({selectedStudent.admission_number})
                  </span>
                )}
              </div>

              {selectedStudent ? (
                <div className="space-y-4">
                  {/* Whitelisted Guardians & Pre-Authorized Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider block mb-2">
                      Registered Whitelist for {selectedStudent.first_name}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedStudent.guardians?.length ? selectedStudent.guardians : (selectedStudent.admission_number === 'DPS-2026-1001' ? [{ id: 'g-vikram', full_name: 'Vikram Mehta', relationship: 'FATHER', phone_number: '+919811122233' }] : [])).map((g) => (
                        <div
                          key={g.id}
                          onClick={() => {
                            setVisitorName(g.full_name);
                            setVisitorPhone(g.phone_number);
                            setRelationship(g.relationship);
                          }}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:border-brand-500"
                        >
                          <div>
                            <strong className="text-slate-900 dark:text-white block">{g.full_name}</strong>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{g.relationship} • {g.phone_number}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            Primary Guardian
                          </span>
                        </div>
                      ))}

                      {store.getAuthorizedPickupsForStudent(selectedStudent.id).map((auth) => (
                        <div
                          key={auth.id}
                          onClick={() => {
                            setVisitorName(auth.authorized_person_name);
                            setVisitorPhone(auth.authorized_person_phone);
                            setRelationship(auth.relationship_to_child);
                          }}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between text-xs cursor-pointer hover:border-indigo-500"
                        >
                          <div>
                            <strong className="text-slate-900 dark:text-white block">{auth.authorized_person_name}</strong>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{auth.relationship_to_child} • {auth.authorized_person_phone}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                            Pre-Authorized
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Input Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Visitor Full Name (As on Govt ID)
                      </label>
                      <input
                        type="text"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="Enter visitor name..."
                        className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Visitor Phone Number
                      </label>
                      <input
                        type="text"
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        placeholder="+91..."
                        className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Early Student Dismissal
                    </label>
                    <input
                      type="text"
                      value={pickupReason}
                      onChange={(e) => setPickupReason(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Authorization & OTP Status Indicator */}
                  <div className="pt-2 space-y-3">
                    {visitorName.trim() ? (
                      isAuthorized ? (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>GUARDIAN WHITELIST VERIFIED ({matchedGuardian?.relationship || matchedPreAuth?.relationship_to_child})</span>
                            </div>
                            {!otpDispatched && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  id="btn-direct-override"
                                  onClick={handleIssueGatePassDirect}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Direct Staff Override
                                </button>
                                <button
                                  type="button"
                                  id="btn-dispatch-otp"
                                  onClick={handleRequestOtp}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Dispatch OTP</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* OTP Verification Input Box */}
                          {otpDispatched && pendingOtp && (
                            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-300 dark:border-indigo-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                                  <Lock className="w-4 h-4 text-indigo-600" />
                                  <span>Enter 6-Digit Verification OTP</span>
                                </span>
                                <span className="text-[10px] font-mono text-indigo-600 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200">
                                  Active Challenge
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                Dispatched to registered guardian mobile ({matchedGuardian?.phone_number || visitorPhone}).
                              </p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  id="input-pickup-otp"
                                  maxLength={6}
                                  value={enteredOtp}
                                  onChange={(e) => setEnteredOtp(e.target.value)}
                                  placeholder="e.g. 492817"
                                  className="flex-1 text-center font-mono text-base font-bold tracking-widest px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  id="btn-verify-otp"
                                  onClick={handleVerifyOtp}
                                  disabled={enteredOtp.length !== 6}
                                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md transition-all cursor-pointer ${enteredOtp.length === 6
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
                                    }`}
                                >
                                  Verify & Issue Exit Pass
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>UNAUTHORIZED VISITOR: Not found in student's guardian whitelist!</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleBlockPickup}
                            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                          >
                            Block & Log Incident
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">Enter visitor name to evaluate security authorization</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  👈 Select a student from the left directory to begin gate security verification
                </div>
              )}
            </div>
          </div>

          {/* Dismissal Log Table */}
          <div className="card-enterprise overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.visitorLogsTitle}</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{visitorLogs.length} {t.records}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4">{t.gatePassLabel}</th>
                    <th className="py-2.5 px-4">{t.colStudent}</th>
                    <th className="py-2.5 px-4">{t.visitorNameLabel}</th>
                    <th className="py-2.5 px-4">{t.relationshipLabel}</th>
                    <th className="py-2.5 px-4">{t.time}</th>
                    <th className="py-2.5 px-4">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {visitorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">{log.gatePassNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.studentName}</td>
                      <td className="py-3 px-4">{log.visitorName} ({log.visitorPhone})</td>
                      <td className="py-3 px-4 font-medium">{log.relationship}</td>
                      <td className="py-3 px-4 font-mono">{log.checkoutTime}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.status === 'PASS_ISSUED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            }`}
                        >
                          {log.status === 'PASS_ISSUED' ? t.approved : t.rejected}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: CAMPUS VISITORS REGISTER                                  */}
      {/* ==================================================================== */}
      {activeSection === 'CAMPUS_VISITORS' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-enterprise p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Total Campus Visitors</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {store.schoolVisitors.length}
                </span>
              </div>
            </div>

            <div className="card-enterprise p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Currently on Campus</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">
                  {checkedInCount} Active
                </span>
              </div>
            </div>

            <div className="card-enterprise p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Checked Out / Badges Returned</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {store.schoolVisitors.filter((v) => v.status === 'CHECKED_OUT').length}
                </span>
              </div>
            </div>
          </div>

          {/* Action Header & Filter */}
          <div className="card-enterprise overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Campus Visitors Register</h2>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setVisitorFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md font-medium ${visitorFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                      }`}
                  >
                    All ({store.schoolVisitors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitorFilter('CHECKED_IN')}
                    className={`px-2.5 py-1 rounded-md font-medium ${visitorFilter === 'CHECKED_IN'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500'
                      }`}
                  >
                    Active ({checkedInCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitorFilter('CHECKED_OUT')}
                    className={`px-2.5 py-1 rounded-md font-medium ${visitorFilter === 'CHECKED_OUT'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                      }`}
                  >
                    Checked Out
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddVisitorModal(true)}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Visitor</span>
              </button>
            </div>

            {/* Visitors Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4">Badge No</th>
                    <th className="py-2.5 px-4">Visitor Name</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4">Purpose</th>
                    <th className="py-2.5 px-4">Whom to Meet</th>
                    <th className="py-2.5 px-4">Check-In Time</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredCampusVisitors.map((vis) => (
                    <tr key={vis.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {vis.badge_number}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {vis.full_name}
                      </td>
                      <td className="py-3 px-4 font-mono">{vis.phone_number}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {vis.purpose.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{vis.whom_to_meet}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {new Date(vis.check_in_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${vis.status === 'CHECKED_IN'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                            }`}
                        >
                          {vis.status === 'CHECKED_IN' ? 'ACTIVE ON CAMPUS' : 'CHECKED OUT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {vis.status === 'CHECKED_IN' ? (
                          <button
                            type="button"
                            onClick={() => handleCheckoutVisitor(vis.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check Out</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Out at {vis.check_out_time ? new Date(vis.check_out_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: PRE-AUTHORIZED PICKUP WHITELIST                           */}
      {/* ==================================================================== */}
      {activeSection === 'PRE_AUTHORIZED' && (
        <div className="space-y-6">
          <div className="card-enterprise overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Parent Pre-Authorized Student Pickup Whitelist
                </h2>
                <p className="text-xs text-slate-500">
                  Guardians, drivers, and relatives pre-cleared by parents to collect students from campus.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAuthModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Add Pre-Authorized Person</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4">Authorized Person</th>
                    <th className="py-2.5 px-4">Relationship</th>
                    <th className="py-2.5 px-4">Phone Number</th>
                    <th className="py-2.5 px-4">Assigned Student</th>
                    <th className="py-2.5 px-4">Govt ID Proof</th>
                    <th className="py-2.5 px-4">Validity Window</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {store.pickupAuthorizations.map((auth) => {
                    const student = store.students.find((s) => s.id === auth.student_id);

                    return (
                      <tr key={auth.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {auth.authorized_person_name}
                        </td>
                        <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                          {auth.relationship_to_child}
                        </td>
                        <td className="py-3 px-4 font-mono">{auth.authorized_person_phone}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 dark:text-white block">
                            {student ? `${student.first_name} ${student.last_name}` : 'Student'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {student?.admission_number}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {auth.id_proof_number || 'Aadhaar Verified'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {auth.valid_from} to {auth.valid_until}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${auth.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                          >
                            {auth.is_active ? 'ACTIVE' : 'REVOKED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {auth.is_active && (
                            <button
                              type="button"
                              onClick={() => store.revokePickupAuthorization(auth.id)}
                              className="text-rose-600 hover:text-rose-700 font-semibold text-[11px] hover:underline"
                            >
                              Revoke
                            </button>
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
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: DIGITAL QR STUDENT GATE EXIT PASS                           */}
      {/* ==================================================================== */}
      {issuedPass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Campus Gate Exit Pass</span>
              </div>
              <button onClick={() => setIssuedPass(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 text-center space-y-3">
              <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                {issuedPass.gatePassNo}
              </span>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {issuedPass.studentName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Admission: {issuedPass.admissionNumber}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left text-xs space-y-1">
                <p><strong>Released To:</strong> {issuedPass.visitorName} ({issuedPass.relationship})</p>
                <p><strong>Phone:</strong> {issuedPass.visitorPhone}</p>
                <p><strong>Dismissal Time:</strong> {issuedPass.checkoutTime}</p>
                <p><strong>Reason:</strong> {issuedPass.remarks}</p>
              </div>

              <div className="pt-2 flex justify-center">
                <div className="w-20 h-20 bg-white p-2 rounded-xl shadow border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-slate-900" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block">Scan at gate barrier for vehicle exit</span>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Exit Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: REGISTER CAMPUS VISITOR                                     */}
      {/* ==================================================================== */}
      {showAddVisitorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" />
                <span>Register Campus Visitor</span>
              </h3>
              <button onClick={() => setShowAddVisitorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterVisitor} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={genVisitorName}
                    onChange={(e) => setGenVisitorName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={genVisitorPhone}
                    onChange={(e) => setGenVisitorPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={genVisitorEmail}
                  onChange={(e) => setGenVisitorEmail(e.target.value)}
                  placeholder="visitor@organization.com"
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose of Visit</label>
                  <select
                    value={genPurpose}
                    onChange={(e) => setGenPurpose(e.target.value as VisitorPurpose)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="OFFICIAL_MEETING">Official Meeting</option>
                    <option value="ADMISSION_ENQUIRY">Admission Enquiry</option>
                    <option value="VENDOR_DELIVERY">Vendor / Delivery</option>
                    <option value="CAMPUS_INSPECTION">Campus Inspection</option>
                    <option value="GUEST_EVENT">Guest / Event</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Whom to Meet</label>
                  <input
                    type="text"
                    required
                    value={genWhomToMeet}
                    onChange={(e) => setGenWhomToMeet(e.target.value)}
                    placeholder="e.g. Principal Office"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ID Proof Type</label>
                  <select
                    value={genIdType}
                    onChange={(e) => setGenIdType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Govt Photo ID">Govt Photo ID</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Corporate Badge">Corporate Badge</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={genIdNumber}
                    onChange={(e) => setGenIdNumber(e.target.value)}
                    placeholder="XXXX-1234"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Remarks</label>
                <input
                  type="text"
                  value={genRemarks}
                  onChange={(e) => setGenRemarks(e.target.value)}
                  placeholder="Additional context or notes..."
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVisitorModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
                >
                  Issue Badge & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ADD PRE-AUTHORIZED PICKUP PERSON                            */}
      {/* ==================================================================== */}
      {showAddAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Pre-Authorize Pickup Person</span>
              </h3>
              <button onClick={() => setShowAddAuthModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPreAuth} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student *</label>
                <select
                  required
                  value={authStudentId}
                  onChange={(e) => setAuthStudentId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Student --</option>
                  {accessibleStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.admission_number}) - {s.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Authorized Person Name *</label>
                  <input
                    type="text"
                    required
                    value={authPersonName}
                    onChange={(e) => setAuthPersonName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={authPersonPhone}
                    onChange={(e) => setAuthPersonPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Relationship to Child</label>
                  <select
                    value={authRelation}
                    onChange={(e) => setAuthRelation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="GRANDFATHER">Grandfather</option>
                    <option value="GRANDMOTHER">Grandmother</option>
                    <option value="UNCLE">Uncle</option>
                    <option value="AUNT">Aunt</option>
                    <option value="FAMILY_DRIVER">Family Driver</option>
                    <option value="GUARDIAN">Legal Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Govt ID Number</label>
                  <input
                    type="text"
                    value={authIdNumber}
                    onChange={(e) => setAuthIdNumber(e.target.value)}
                    placeholder="Aadhaar XXXX-8901"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={authValidFrom}
                    onChange={(e) => setAuthValidFrom(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={authValidUntil}
                    onChange={(e) => setAuthValidUntil(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAuthModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  Authorize Pickup Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
