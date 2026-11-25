import { DataStore, PARENT_PROFILES } from '../apps/web/src/lib/data-store';
import type { LeaveType, NotificationChannel } from '@smartattend/shared-types';

async function runSprint4Verification() {
  console.log('======================================================================');
  console.log('SmartAttend Enterprise Upgrade — Sprint 4 Automated Test Suite');
  console.log('Modules: Leave Management, Approvals, DPDP Consent & Notifications');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${title}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  const store = new DataStore();
  // Ensure fresh mock state
  store.resetToDefaults();

  console.log('--- 1. STUDENT LEAVE MANAGEMENT TESTS ---');

  // T1.1: Submit valid leave request
  const student1 = store.students[0]; // Aarav Mehta (Grade 10-A)
  const leave1 = store.submitLeaveRequest(
    student1.id,
    '2026-11-23',
    '2026-11-25',
    'Pediatric dental surgery and post-op rest',
    'SICK_LEAVE'
  );
  assert(
    !!leave1 && leave1.status === 'PENDING' && leave1.leave_type === 'SICK_LEAVE',
    'T1.1: Submit valid leave request with SICK_LEAVE classification'
  );

  // T1.2: Date Validation: Reject end_date < start_date
  let invalidDateCaught = false;
  try {
    store.submitLeaveRequest(
      student1.id,
      '2026-11-28',
      '2026-11-26', // invalid: earlier than start date
      'Invalid test date range',
      'PERSONAL_LEAVE'
    );
  } catch (e: any) {
    invalidDateCaught = e.message.includes('Validation Error: End date');
  }
  assert(invalidDateCaught, 'T1.2: Date validation prevents end date prior to start date');

  // T1.3: Duplicate/overlap prevention
  let overlapCaught = false;
  try {
    store.submitLeaveRequest(
      student1.id,
      '2026-11-24', // overlaps with Nov 23-25
      '2026-11-26',
      'Overlapping second request',
      'PERSONAL_LEAVE'
    );
  } catch (e: any) {
    overlapCaught = e.message.includes('Conflict Error: An active leave application');
  }
  assert(overlapCaught, 'T1.3: Duplicate and overlapping leave prevention blocks conflicting application');

  // T1.4: Parent IDOR authorization check
  store.switchRole('parent'); // Vikram Mehta (authorized only for Aarav Mehta)
  const unauthorizedStudent = store.students.find((s) => s.id !== student1.id)!;
  let idorCaught = false;
  try {
    store.submitLeaveRequest(
      unauthorizedStudent.id,
      '2026-11-23',
      '2026-11-24',
      'Attempting to apply for another parent child',
      'PERSONAL_LEAVE'
    );
  } catch (e: any) {
    idorCaught = e.message.includes('Security Exception: Access Denied');
  }
  assert(idorCaught, 'T1.4: Parent IDOR security prevents applying for non-registered students');

  // T1.5: Parent Cancellation
  const cancelledLeave = store.cancelLeaveRequest(leave1.id);
  assert(
    cancelledLeave.status === 'CANCELLED' && !!cancelledLeave.cancelled_at,
    'T1.5: Applicant/parent can cancel pending leave request'
  );

  console.log('\n--- 2. TEACHER & ADMIN APPROVAL WORKFLOW TESTS ---');

  // Submit a new valid leave for testing approvals
  store.switchRole('school_admin');
  const studentGrade10A = store.students.find((s) => s.class_name === 'Grade 10' && s.division_name === 'A')!;
  const studentGrade10B = store.students.find((s) => s.class_name === 'Grade 10' && s.division_name === 'B')!;

  const leaveGrade10A = store.submitLeaveRequest(
    studentGrade10A.id,
    '2026-11-16',
    '2026-11-17',
    'National Science Olympiad representation',
    'PERSONAL_LEAVE'
  );

  const leaveGrade10B = store.submitLeaveRequest(
    studentGrade10B.id,
    '2026-11-16',
    '2026-11-17',
    'Family emergency',
    'EMERGENCY_LEAVE'
  );

  // Switch to teacher: Mr. Rajesh Kumar (Grade 10-A)
  store.switchRole('teacher');

  // T2.1: Teacher approves student in their assigned class (Grade 10-A)
  const approvedGrade10A = store.approveLeaveRequest(leaveGrade10A.id, 'Approved for Science Olympiad');
  assert(
    approvedGrade10A.status === 'APPROVED' && approvedGrade10A.remarks === 'Approved for Science Olympiad',
    'T2.1: Teacher approves leave request for assigned class (Grade 10-A)'
  );

  // T2.2: Teacher class boundary enforcement: Teacher cannot approve student in Grade 10-B
  let teacherBoundaryCaught = false;
  try {
    store.approveLeaveRequest(leaveGrade10B.id, 'Teacher unauthorized cross-class approval attempt');
  } catch (e: any) {
    teacherBoundaryCaught = e.message.includes('Teachers can only approve leave applications for their assigned class');
  }
  assert(teacherBoundaryCaught, 'T2.2: Teacher restricted to assigned class; cross-class approval blocked');

  // T2.3: Admin can approve across any class
  store.switchRole('school_admin');
  const approvedGrade10B = store.approveLeaveRequest(leaveGrade10B.id, 'Approved by School Principal');
  assert(
    approvedGrade10B.status === 'APPROVED' && approvedGrade10B.reviewed_by?.includes('Sandeep'),
    'T2.3: School Administrator approves leave across any class'
  );

  // T2.4: Parent cannot approve or reject
  store.switchRole('parent');
  let parentApprovalCaught = false;
  try {
    store.approveLeaveRequest(leaveGrade10A.id, 'Parent illegitimate approval attempt');
  } catch (e: any) {
    parentApprovalCaught = e.message.includes('Parents are not authorized to approve');
  }
  assert(parentApprovalCaught, 'T2.4: Parents strictly blocked from approving leave applications');

  console.log('\n--- 3. ATTENDANCE INTEGRATION TESTS ---');
  store.switchRole('school_admin');

  // T3.1: Approved leave synchronized to daily attendance (ON_LEAVE) and subject attendance (EXCUSED)
  const dailyRec = store.dailyAttendance.find(
    (d) => d.student_id === studentGrade10A.id && d.attendance_date === '2026-11-16'
  );
  assert(
    !!dailyRec && dailyRec.status === 'ON_LEAVE',
    'T3.1: Approved leave synchronizes daily attendance to ON_LEAVE'
  );

  // T3.2: Holiday Preservation during leave range
  // Diwali holiday is on 2026-11-10 to 2026-11-11
  const holidayLeave = store.submitLeaveRequest(
    studentGrade10A.id,
    '2026-11-09',
    '2026-11-12', // Spans Nov 09, 10 (Diwali), 11 (Diwali Gov), 12
    'Extended family Diwali visit',
    'PERSONAL_LEAVE'
  );
  store.approveLeaveRequest(holidayLeave.id, 'Approved by Principal');
  
  // Verify Diwali (2026-11-10) is preserved as holiday
  const isDiwaliHoliday = store.isHoliday('2026-11-10');
  const holidayDailyRec = store.dailyAttendance.find(
    (d) => d.student_id === studentGrade10A.id && d.attendance_date === '2026-11-10'
  );
  assert(
    isDiwaliHoliday && !holidayDailyRec,
    'T3.2: Official school holidays (Diwali) preserved without overwrite during approved leave'
  );

  // T3.3: Absence Reconciliation suppression for students on approved leave
  const todayStr = new Date().toISOString().split('T')[0];
  // Submit and approve leave covering today for studentGrade10A
  const todayLeave = store.submitLeaveRequest(
    studentGrade10A.id,
    todayStr,
    todayStr,
    'Approved medical appointment today',
    'SICK_LEAVE'
  );
  store.approveLeaveRequest(todayLeave.id, 'Medical note received');

  const absentCount = store.runAbsenceReconciliation();
  const student1TodayAttendance = store.dailyAttendance.find(
    (d) => d.student_id === studentGrade10A.id && d.attendance_date === todayStr
  );
  const absenceAlertQueuedForStudent1 = store.notifications.some(
    (n) => n.student_id === studentGrade10A.id && n.notification_type === 'ABSENCE' && n.scheduled_for?.startsWith(todayStr)
  );

  assert(
    student1TodayAttendance?.status === 'ON_LEAVE' && !absenceAlertQueuedForStudent1,
    'T3.3: Absence reconciliation recognizes approved leave, marks ON_LEAVE, suppresses absence alert'
  );

  console.log('\n--- 4. DPDP BIOMETRIC CONSENT TESTS ---');

  // T4.1: Biometric consent granted check
  const consentAarav = store.checkBiometricConsent(student1.id);
  assert(
    consentAarav.allowed && consentAarav.status === 'GRANTED',
    'T4.1: Student with valid parental consent allowed for biometric capture'
  );

  // T4.2: Biometric enrollment blocked for withdrawn/expired consent
  const studentRohan = store.students.find((s) => s.last_name === 'Verma')!; // Rohan Verma has WITHDRAWN consent
  const consentRohan = store.checkBiometricConsent(studentRohan.id);
  assert(
    !consentRohan.allowed && consentRohan.status === 'WITHDRAWN',
    'T4.2: Student with withdrawn consent blocked under DPDP Act 2023 Sec 6'
  );

  // T4.3: Authorized consent withdrawal
  store.withdrawBiometricConsent(student1.id, undefined, 'Guardian revoked consent via web portal');
  const consentAaravAfterRevoke = store.checkBiometricConsent(student1.id);
  const auditRevoked = store.consentHistory.find(
    (h) => h.student_id === student1.id && h.action === 'CONSENT_WITHDRAWN'
  );
  assert(
    !consentAaravAfterRevoke.allowed && !!auditRevoked,
    'T4.3: Authorized consent withdrawal updates status to WITHDRAWN with cryptographic audit log'
  );

  // T4.4: Statutory Right to Erasure (Sec 12)
  store.students[0].face_enrolled = true;
  store.students[0].fingerprint_enrolled = true;
  store.purgeBiometricTemplates(student1.id);

  const consentPurged = store.dpdpConsents.find((c) => c.student_id === student1.id);
  assert(
    !store.students[0].face_enrolled &&
    !store.students[0].fingerprint_enrolled &&
    consentPurged?.hash_sha256 === 'PURGED_UNDER_RIGHT_TO_ERASURE_SEC_12',
    'T4.4: Statutory Right to Erasure (Sec 12) permanently wipes templates and commits purge audit'
  );

  console.log('\n--- 5. RELIABLE NOTIFICATION SYSTEM TESTS ---');

  // T5.1: Multi-channel support
  const jobWhatsApp = store.enqueueNotificationJob({
    channel: 'WHATSAPP',
    recipient_phone: '+919811122233',
    template_parameters: ['Aarav Mehta', '08:15 AM'],
    idempotency_key: 'test-chan-wa-1'
  });
  const jobSms = store.enqueueNotificationJob({
    channel: 'SMS',
    recipient_phone: '+919822233344',
    template_parameters: ['Diya Sen', 'Arrival Notice'],
    idempotency_key: 'test-chan-sms-1'
  });
  const jobEmail = store.enqueueNotificationJob({
    channel: 'EMAIL',
    recipient_phone: 'parent@example.com',
    template_parameters: ['Rohan Verma', 'Fee Notice'],
    idempotency_key: 'test-chan-email-1'
  });
  assert(
    jobWhatsApp.job.channel === 'WHATSAPP' &&
    jobSms.job.channel === 'SMS' &&
    jobEmail.job.channel === 'EMAIL',
    'T5.1: Multi-channel notifications supported across WhatsApp, SMS, and Email'
  );

  // T5.2: Idempotency duplicate prevention
  const dupJob = store.enqueueNotificationJob({
    channel: 'WHATSAPP',
    recipient_phone: '+919811122233',
    template_parameters: ['Aarav Mehta', '08:15 AM'],
    idempotency_key: 'test-chan-wa-1' // Same idempotency key
  });
  assert(
    dupJob.isDuplicate && dupJob.job.id === jobWhatsApp.job.id,
    'T5.2: Notification idempotency key prevents duplicate dispatch queueing'
  );

  // T5.3: Exponential backoff retry on transient failure
  const failJob = store.enqueueNotificationJob({
    channel: 'SMS',
    recipient_phone: '+919899999999',
    template_parameters: ['Test Student'],
    idempotency_key: `test-fail-${Date.now()}`
  });
  store.processNotificationJob(failJob.job.id, true); // simulate failure
  assert(
    failJob.job.status === 'FAILED' &&
    failJob.job.attempts === 1 &&
    !!failJob.job.next_retry_at,
    'T5.3: Transient failure schedules exponential backoff next_retry_at'
  );

  // T5.4: Dead-Letter Queue when max attempts (3/3) exhausted
  store.processNotificationJob(failJob.job.id, true); // Attempt 2
  store.processNotificationJob(failJob.job.id, true); // Attempt 3 -> Dead Letter
  assert(
    failJob.job.status === 'DEAD_LETTER' &&
    failJob.job.attempts === 3 &&
    !!failJob.job.dead_letter_reason,
    'T5.4: Maximum attempts exhausted routes job to Dead-Letter Queue with failure reason'
  );

  // T5.5: Manual authorized retry
  const recoveredJob = store.retryNotificationJob(failJob.job.id);
  assert(
    recoveredJob.status === 'DELIVERED' && !recoveredJob.dead_letter_reason,
    'T5.5: Authorized manual retry recovers job from Dead-Letter Queue to DELIVERED'
  );

  console.log('\n======================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint4Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

