import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Send,
  User,
  X,
  Sparkles,
  Edit,
  RefreshCw,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useDataStore, LeaveRequest } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import type { AttendanceStatus, LeaveType } from '@smartattend/shared-types';

interface AttendanceCorrectionItem {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  attendanceDate: string;
  currentStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  submittedBy: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedBy?: string;
}

export const LeavesPage: React.FC = () => {
  const store = useDataStore();
  const { t, formatStatus, formatLeaveType } = useLanguage();
  const [pageSection, setPageSection] = useState<'LEAVES' | 'CORRECTIONS'>('LEAVES');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'>('ALL');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  const isParent = store.currentUser.role === 'parent';
  const isTeacher = store.currentUser.role === 'teacher';
  const isAdmin = store.currentUser.role === 'school_admin' || store.currentUser.role === 'super_admin';
  const authorizedStudents = store.getAuthorizedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState(
    authorizedStudents[0]?.id || store.students[0]?.id || ''
  );
  const [leaveType, setLeaveType] = useState<LeaveType>('PERSONAL_LEAVE');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Review Remarks State
  const [reviewingLeaveId, setReviewingLeaveId] = useState<string | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Attendance Correction State (Feature 13)
  const [corrStudentId, setCorrStudentId] = useState(store.students[0]?.id || '');
  const [corrDate, setCorrDate] = useState(new Date().toISOString().split('T')[0]);
  const [corrRequestedStatus, setCorrRequestedStatus] = useState<AttendanceStatus>('PRESENT');
  const [corrReason, setCorrReason] = useState('');
  const [corrections, setCorrections] = useState<AttendanceCorrectionItem[]>([
    {
      id: 'corr-01',
      studentId: '88888888-8888-8888-8888-888888888801',
      studentName: 'Aarav Mehta',
      admissionNumber: 'DPS-2026-1001',
      attendanceDate: '2026-11-03',
      currentStatus: 'ABSENT',
      requestedStatus: 'PRESENT',
      submittedBy: 'Mr. Rajesh Kumar (Teacher)',
      reason: 'Student was present at Inter-School Robotics Competition; missed gate kiosk punch',
      status: 'PENDING',
      createdAt: '2026-11-03T16:00:00Z'
    }
  ]);

  const handleApproveCorrection = (id: string) => {
    const item = corrections.find((c) => c.id === id);
    if (!item) return;
    store.overrideAttendance(
      item.studentId,
      item.requestedStatus,
      `Approved Rectification: ${item.reason}`,
      item.attendanceDate
    );
    setCorrections(
      corrections.map((c) =>
        c.id === id ? { ...c, status: 'APPROVED', reviewedBy: store.currentUser.name } : c
      )
    );
  };

  const handleRejectCorrection = (id: string) => {
    setCorrections(
      corrections.map((c) =>
        c.id === id ? { ...c, status: 'REJECTED', reviewedBy: store.currentUser.name } : c
      )
    );
  };

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    const std = store.students.find((s) => s.id === corrStudentId);
    if (!std || !corrReason.trim()) return;
    const existingRec = store.dailyAttendance.find(
      (d) => d.student_id === std.id && d.attendance_date === corrDate
    );
    const newCorr: AttendanceCorrectionItem = {
      id: `corr-${Date.now()}`,
      studentId: std.id,
      studentName: `${std.first_name} ${std.last_name}`,
      admissionNumber: std.admission_number,
      attendanceDate: corrDate,
      currentStatus: existingRec?.status || 'ABSENT',
      requestedStatus: corrRequestedStatus,
      submittedBy: store.currentUser.name,
      reason: corrReason,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setCorrections([newCorr, ...corrections]);
    setShowCorrectionModal(false);
    setCorrReason('');
  };

  const authorizedStudentIds = new Set(authorizedStudents.map((s) => s.id));

  const filteredLeaves = store.leaveRequests.filter((l) => {
    if (isParent) {
      // Parent only sees their own verified child's leaves
      if (!authorizedStudentIds.has(l.student_id)) return false;
    }
    if (filter === 'ALL') return true;
    return l.status === filter;
  });

  const pendingCount = store.leaveRequests.filter((l) => l.status === 'PENDING').length;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setErrorMessage('');

    try {
      store.submitLeaveRequest(selectedStudentId, startDate, endDate, reason, leaveType);
      setReason('');
      setShowApplyModal(false);
      setActionSuccessMessage('Leave application submitted successfully for review.');
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authorization error submitting leave application.');
    }
  };

  const handleCancelLeave = (id: string) => {
    try {
      store.cancelLeaveRequest(id);
      setActionSuccessMessage('Leave request cancelled successfully.');
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error cancelling leave application.');
    }
  };

  const handleApproveLeave = (id: string) => {
    try {
      const remarks = reviewRemarks.trim() || (isTeacher ? 'Approved by Class Teacher' : 'Approved by School Administration');
      store.approveLeaveRequest(id, remarks);
      setReviewingLeaveId(null);
      setReviewRemarks('');
      setActionSuccessMessage('Leave request approved. Daily & period attendance synchronized to ON_LEAVE.');
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error approving leave application.');
    }
  };

  const handleRejectLeave = (id: string) => {
    try {
      const remarks = reviewRemarks.trim() || 'Rejected after administrative review.';
      store.rejectLeaveRequest(id, remarks);
      setReviewingLeaveId(null);
      setReviewRemarks('');
      setActionSuccessMessage('Leave request rejected and recorded.');
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error rejecting leave application.');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {pageSection === 'LEAVES' ? t.leavesTitle : t.tabCorrections}
            </h1>
            {pageSection === 'LEAVES' && pendingCount > 0 && !isParent && (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                {pendingCount} {t.pending}
              </span>
            )}
            {pageSection === 'CORRECTIONS' && (
              <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                {corrections.filter((c) => c.status === 'PENDING').length} {t.pending}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.leavesSub}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {pageSection === 'LEAVES' ? (
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.applyLeaveBtn}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>{t.requestCorrectionBtn}</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Top Level Section Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
        <button
          onClick={() => setPageSection('LEAVES')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${pageSection === 'LEAVES'
            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.tabLeaves}</span>
          <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {store.leaveRequests.length}
          </span>
        </button>

        <button
          onClick={() => setPageSection('CORRECTIONS')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${pageSection === 'CORRECTIONS'
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t.tabCorrections}</span>
          <span className="ml-1 text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
            {corrections.length}
          </span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${filter === 'ALL'
            ? 'bg-slate-900 dark:bg-brand-600 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          {t.allStatusFilter}
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${filter === 'PENDING'
            ? 'bg-slate-900 dark:bg-brand-600 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          {t.pendingStatusFilter}
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${filter === 'APPROVED'
            ? 'bg-slate-900 dark:bg-brand-600 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          {t.approvedStatusFilter}
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${filter === 'REJECTED'
            ? 'bg-slate-900 dark:bg-brand-600 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          {t.rejectedStatusFilter}
        </button>
      </div>

      {/* SECTION 1: LEAVES LIST */}
      {pageSection === 'LEAVES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeaves.map((leave) => {
            const isPending = leave.status === 'PENDING';
            const isApproved = leave.status === 'APPROVED';
            const isCancelled = leave.status === 'CANCELLED';
            const canTeacherReview = !isTeacher || store.isTeacherAuthorizedForStudent(leave.student_id);

            return (
              <div
                key={leave.id}
                className={`card-enterprise p-5 flex flex-col justify-between border-2 transition-all ${isPending
                  ? 'border-amber-400/60 bg-amber-50/20 dark:bg-amber-950/20 dark:border-amber-800/60'
                  : isApproved
                    ? 'border-emerald-300/60 bg-emerald-50/10 dark:bg-emerald-950/20 dark:border-emerald-800/60'
                    : isCancelled
                      ? 'border-slate-300/50 bg-slate-50/30 dark:bg-slate-800/30 dark:border-slate-700/60'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{leave.student_name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{leave.class_name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {formatLeaveType(leave.leave_type || 'PERSONAL_LEAVE')}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isPending
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : isCancelled
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                        }`}
                    >
                      {formatStatus(leave.status)}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 border border-slate-100 dark:border-slate-700 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{t.colLeavePeriod}:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{leave.start_date} → {leave.end_date}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Applicant:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{leave.parent_name} ({leave.parent_phone})</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">{t.reasonLabel}:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 italic">
                      "{leave.reason}"
                    </p>
                  </div>

                  {leave.reviewed_by && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mb-3">
                      <span className="font-medium">{t.reviewRemarksLabel}:</span> {leave.reviewed_by}
                      {leave.remarks && <p className="text-slate-600 dark:text-slate-300 italic mt-0.5">{leave.remarks}</p>}
                    </div>
                  )}

                  {leave.cancelled_by && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mb-3">
                      <span className="font-medium">Cancelled by:</span> {leave.cancelled_by}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isPending && (isParent || (!isTeacher && !isAdmin)) && (
                    <button
                      id={`btn-cancel-leave-${leave.id}`}
                      onClick={() => handleCancelLeave(leave.id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.cancel}</span>
                    </button>
                  )}

                  {isPending && !isParent && (
                    canTeacherReview ? (
                      <div className="flex items-center space-x-2">
                        <button
                          id={`btn-approve-leave-${leave.id}`}
                          onClick={() => {
                            setReviewingLeaveId(leave.id);
                            setReviewRemarks('Approved by administration');
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          id={`btn-reject-leave-${leave.id}`}
                          onClick={() => {
                            setReviewingLeaveId(leave.id);
                            setReviewRemarks(t.languageName === 'मराठी' ? 'प्रशासकीय पुनरावलोकनानंतर नाकारले' : 'Rejected after administrative review');
                          }}
                          className="flex-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.rejectBtn}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-medium text-center">
                        {t.languageName === 'मराठी' ? 'इयत्ता १०-अ ला नेमलेले आहे. संबंधित वर्गशिक्षकांनी पडताळणी करावी.' : 'Assigned to Grade 10-A. Other class teacher must review.'}
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {filteredLeaves.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">{t.noRecordsFound}</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: ATTENDANCE CORRECTION & RECTIFICATION WORKFLOW (Feature 13) */}
      {pageSection === 'CORRECTIONS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {corrections
              .filter((c) => (filter === 'ALL' ? true : c.status === filter))
              .map((corr) => {
                const isPending = corr.status === 'PENDING';
                const isApproved = corr.status === 'APPROVED';

                return (
                  <div
                    key={corr.id}
                    className={`card-enterprise p-5 flex flex-col justify-between border-2 transition-all ${isPending
                      ? 'border-indigo-400/60 bg-indigo-50/20 dark:bg-indigo-950/20 dark:border-indigo-800/60'
                      : isApproved
                        ? 'border-emerald-300/60 bg-emerald-50/10 dark:bg-emerald-950/20 dark:border-emerald-800/60'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{corr.studentName}</h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {corr.admissionNumber} • {corr.attendanceDate}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isPending
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : isApproved
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                            }`}
                        >
                          {formatStatus(corr.status)}
                        </span>
                      </div>

                      {/* Status Transition Display */}
                      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-100 dark:border-slate-700 mb-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t.languageName === 'मराठी' ? 'सध्याची स्थिती:' : 'Current Status:'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                            {formatStatus(corr.currentStatus)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t.languageName === 'मराठी' ? 'मागितलेली सुधारणा:' : 'Requested Correction:'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 flex items-center space-x-1">
                            <span>➔ {formatStatus(corr.requestedStatus)}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-1 text-[11px] text-slate-500">
                          <span>{t.languageName === 'मराठी' ? 'अर्जदार:' : 'Initiated By:'}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{corr.submittedBy}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                          {t.languageName === 'मराठी' ? 'कारण व पुरावा:' : 'Justification & Proof:'}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 italic">
                          "{corr.reason}"
                        </p>
                      </div>

                      {corr.reviewedBy && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mb-3">
                          <span className="font-medium">{t.languageName === 'मराठी' ? 'तपासणी व मंजुरी:' : 'Audited & Decided by:'}</span> {corr.reviewedBy}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons for Admins & Principals */}
                    {isPending && (store.currentUser.role === 'school_admin' || store.currentUser.role === 'super_admin') && (
                      <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleApproveCorrection(corr.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.saveToDatabase}</span>
                        </button>
                        <button
                          onClick={() => handleRejectCorrection(corr.id)}
                          className="flex-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.rejectBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            {corrections.filter((c) => (filter === 'ALL' ? true : c.status === filter)).length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">{t.noRecordsFound}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Correction Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{t.languageName === 'मराठी' ? 'हजेरी दुरुस्ती अर्ज' : 'Request Attendance Rectification'}</h3>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.colStudent}</label>
                <select
                  value={corrStudentId}
                  onChange={(e) => setCorrStudentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  {store.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.admission_number} - {s.class_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.date}</label>
                  <input
                    type="date"
                    value={corrDate}
                    onChange={(e) => setCorrDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.status}</label>
                  <select
                    value={corrRequestedStatus}
                    onChange={(e) => setCorrRequestedStatus(e.target.value as AttendanceStatus)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="PRESENT">{formatStatus('PRESENT')}</option>
                    <option value="HALF_DAY">{formatStatus('HALF_DAY')}</option>
                    <option value="LATE">{formatStatus('LATE')}</option>
                    <option value="EXCUSED">{formatStatus('EXCUSED')}</option>
                    <option value="ABSENT">{formatStatus('ABSENT')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.reasonLabel}</label>
                <textarea
                  rows={3}
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  placeholder={t.languageName === 'मराठी' ? 'उदा. आंतरशालेय क्रीडा स्पर्धा सहभाग, किंवा गेट कॅमेरा चेहरा जुळणी समस्या...' : 'e.g. Participated in inter-school football match, or gate camera face template mismatch...'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
                >
                  {t.languageName === 'मराठी' ? 'मंजुरीसाठी पाठवा' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{t.applyLeaveModalTitle}</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-5 space-y-4 text-xs">
              {errorMessage && (
                <div id="leave-error-banner" className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-lg text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.selectStudentLabel} {isParent && <span className="text-emerald-700 dark:text-emerald-400 font-normal">({t.languageName === 'मराठी' ? 'तुमचा नोंदणीकृत पाल्य' : 'Your Registered Child'})</span>}
                </label>
                <select
                  id="select-student-leave"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  {(isParent ? authorizedStudents : store.students).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.class_name}-{s.division_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.leaveTypeLabel}</label>
                <select
                  id="input-leave-type"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="SICK_LEAVE">{formatLeaveType('SICK_LEAVE')}</option>
                  <option value="PERSONAL_LEAVE">{formatLeaveType('PERSONAL_LEAVE')}</option>
                  <option value="EMERGENCY_LEAVE">{formatLeaveType('EMERGENCY_LEAVE')}</option>
                  <option value="OTHER">{formatLeaveType('OTHER')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.startDateLabel}</label>
                  <input
                    id="input-leave-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.endDateLabel}</label>
                  <input
                    id="input-leave-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.reasonLabel}</label>
                <textarea
                  id="input-leave-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.languageName === 'मराठी' ? 'उदा. आजारपण, कौटुंबिक कार्यक्रम, डॉक्टरांची भेट...' : 'e.g. Pediatrician appointment, family function, viral fever...'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  id="btn-submit-leave"
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm"
                >
                  {t.submitApplicationBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Remarks Modal */}
      {reviewingLeaveId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.languageName === 'मराठी' ? 'रजा अर्जाचे पुनरावलोकन' : 'Review Leave Application'}</h3>
              <button onClick={() => setReviewingLeaveId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.reviewRemarksLabel}</label>
                <textarea
                  id="input-review-remarks"
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder={t.languageName === 'मराठी' ? 'उदा. मंजूर. वैद्यकीय प्रमाणपत्र जोडले आहे.' : 'e.g. Approved. Medical slip noted. Ensure homework collected.'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  id="btn-confirm-reject-leave"
                  onClick={() => handleRejectLeave(reviewingLeaveId)}
                  className="flex-1 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                >
                  {t.rejectBtn}
                </button>
                <button
                  id="btn-confirm-approve-leave"
                  onClick={() => handleApproveLeave(reviewingLeaveId)}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                >
                  {t.approveBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
