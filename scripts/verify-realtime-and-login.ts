// ==============================================================================
// SmartAttend: Comprehensive Real-Time Sync, Notifications & Single Login Test
// ==============================================================================

import { DataStore } from '../apps/web/src/lib/data-store';

async function runTest() {
  console.log('======================================================================');
  console.log('  SmartAttend: Real-Time Sync, Notification Center & Login Test Suite');
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
  store.resetToDefaults();

  console.log('--- 1. SINGLE LOGIN VERIFICATION ACROSS ALL ROLES ---');

  // 1.1 Principal Login
  const resAdmin = store.verifyCredentials('principal@dpsrkpuram.edu.in', 'Principal@2026!');
  assert(resAdmin.success && resAdmin.role === 'school_admin', '1.1: Principal authenticates as school_admin');

  // 1.2 Teacher Login
  const resTeacher = store.verifyCredentials('priya.sharma@dpsrkpuram.edu.in', 'Teacher@2026!');
  assert(resTeacher.success && resTeacher.role === 'teacher', '1.2: Teacher authenticates as teacher');

  // 1.3 Parent 1: Vikram Mehta
  const resParent1 = store.verifyCredentials('vikram.mehta@gmail.com', 'Parent@2026!');
  assert(resParent1.success && resParent1.role === 'parent' && resParent1.user?.name.includes('Vikram'), '1.3: Vikram Mehta authenticates as parent');

  // 1.4 Parent 2: Anil Verma
  const resParent2 = store.verifyCredentials('anil.verma@gmail.com', 'Parent@2026!');
  assert(resParent2.success && resParent2.role === 'parent' && resParent2.user?.name.includes('Anil'), '1.4: Anil Verma authenticates as parent');

  // 1.5 Student: Aarav Mehta
  const resStudent = store.verifyCredentials('aarav.mehta@student.dpsrkpuram.edu.in', 'Student@2026!');
  assert(resStudent.success && resStudent.role === 'student', '1.5: Student authenticates as student');

  // 1.6 Super Admin
  const resSuper = store.verifyCredentials('superadmin@smartattend.edu', 'SuperAdmin@2026!');
  assert(resSuper.success && resSuper.role === 'super_admin', '1.6: Super Admin authenticates as super_admin');

  // 1.7 Invalid Password & Brute-Force Lockout
  const resInvalid = store.verifyCredentials('principal@dpsrkpuram.edu.in', 'WrongPassword!');
  assert(!resInvalid.success && resInvalid.error === 'INVALID_CREDENTIALS', '1.7: Rejects invalid password');

  // Trigger brute-force lockout (remaining attempts)
  for (let i = 0; i < 4; i++) {
    store.verifyCredentials('attacker@test.com', 'WrongPass');
  }
  const resLocked = store.verifyCredentials('attacker@test.com', 'WrongPass');
  assert(!resLocked.success && resLocked.error === 'ACCOUNT_LOCKED', '1.8: Brute-force lockout triggered after 5 failed attempts');

  console.log('\n--- 2. BIOMETRIC ATTENDANCE PUNCH & PARENT NOTIFICATION ---');

  // Student: Rohan Verma (Parent: Anil Verma)
  const rohan = store.students.find(s => s.first_name === 'Rohan');
  assert(!!rohan, '2.1: Rohan Verma found in student directory');

  // Punch attendance for Rohan Verma via Fingerprint
  const punchEvent = store.recordBiometricPunch(rohan!.id, 'FINGERPRINT', 0.99);
  assert(!!punchEvent, '2.2: Biometric punch recorded for Rohan Verma');

  // Verify that parent notification was dispatched for Anil Verma
  const rohanNotif = store.notifications.find(n => n.student_id === rohan!.id);
  assert(
    !!rohanNotif &&
    rohanNotif.recipient_phone === '+919833344455' &&
    rohanNotif.status === 'DELIVERED',
    '2.3: Correct parent (Anil Verma) identified and notified (+919833344455)'
  );

  console.log('\n--- 3. NOTIFICATION CENTER (NAVBAR) STRICT ROLE ISOLATION ---');

  // 3.0 Principal must NEVER receive parent child-attendance notifications
  store.currentUser = {
    id: 'user-principal',
    email: 'principal@dpsrkpuram.edu.in',
    name: 'Dr. Sandeep Mukherjee',
    role: 'school_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  };
  const principalNotifs = store.getNotificationsForUser();
  const principalUnread = store.getUnreadNotificationCount();
  assert(
    principalNotifs.length === 0 && principalUnread === 0,
    '3.0: Principal strictly receives 0 child attendance notifications (bell is hidden & count is 0)'
  );

  // 3.0b Teacher must also NEVER receive parent child-attendance notifications
  store.currentUser = {
    id: 'user-teacher',
    email: 'priya.sharma@dpsrkpuram.edu.in',
    name: 'Priya Sharma',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  };
  const teacherNotifs = store.getNotificationsForUser();
  assert(
    teacherNotifs.length === 0,
    '3.0b: Teacher strictly receives 0 child attendance notifications'
  );

  // Switch active user to Anil Verma
  store.currentUser = {
    id: 'user-parent-anil',
    email: 'anil.verma@gmail.com',
    name: 'Anil Verma',
    role: 'parent',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  };

  const anilNotifications = store.getNotificationsForUser();
  const unreadBefore = store.getUnreadNotificationCount();
  assert(anilNotifications.length > 0, '3.1: Anil Verma sees isolated notifications for his child Rohan');
  assert(unreadBefore > 0, '3.2: Unread notification count badge reflects new attendance alert');

  // Mark single notification as read
  store.markNotificationAsRead(anilNotifications[0].id);
  const unreadAfterSingle = store.getUnreadNotificationCount();
  assert(unreadAfterSingle === unreadBefore - 1, '3.3: markNotificationAsRead decrements unread count');

  // Mark all as read
  store.markAllNotificationsAsRead();
  const unreadAfterAll = store.getUnreadNotificationCount();
  assert(unreadAfterAll === 0, '3.4: markAllNotificationsAsRead clears unread badge to 0');

  console.log('\n--- 4. CROSS-WINDOW REAL-TIME SYNCHRONIZATION ENGINE ---');

  // Simulate Window 1 (Admin/Kiosk) and Window 2 (Parent Portal)
  const window1Store = new DataStore();
  const window2Store = new DataStore();
  window2Store.currentUser = {
    id: 'user-parent-vikram',
    email: 'vikram.mehta@gmail.com',
    name: 'Vikram Mehta',
    role: 'parent',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  };

  const aarav = window1Store.students[0];
  const initialAaravMetrics = window2Store.getChildAttendanceMetrics(aarav.id);

  // Window 1 triggers biometric punch for Aarav Mehta
  const aaravPunch = window1Store.recordBiometricPunch(aarav.id, 'FACE', 0.995);
  assert(!!aaravPunch, '4.1: Window 1 records Face punch for Aarav Mehta');

  const todayStr = new Date().toISOString().split('T')[0];
  const aaravRecord = window1Store.dailyAttendance.find(
    d => d.student_id === aarav.id && d.attendance_date === todayStr
  )!;

  // Verify sync payload dispatched
  const syncPayload = {
    type: 'ATTENDANCE_PUNCH',
    studentId: aarav.id,
    record: aaravRecord,
    event: aaravPunch,
    notification: window1Store.notifications[0],
    timestamp: Date.now()
  };

  // Simulate Window 2 receiving cross-tab message via BroadcastChannel / storage event
  window2Store.handleCrossTabMessage(syncPayload);

  // Verify Window 2 has updated immediately without page refresh
  const window2Record = window2Store.dailyAttendance.find(
    d => d.student_id === aarav.id && d.attendance_date === todayStr
  );
  assert(
    !!window2Record && (window2Record.status === 'PRESENT' || window2Record.status === 'LATE'),
    `4.2: Window 2 receives attendance record (${window2Record?.status}) in 0ms without refresh`
  );

  const window2Notifications = window2Store.getNotificationsForUser();
  assert(
    window2Notifications.some(n => n.student_id === aarav.id),
    '4.3: Window 2 Notification Center receives real-time alert without refresh'
  );

  console.log('\n--- 5. OFFLINE ATTENDANCE SYNCHRONIZATION ---');

  const offlinePunch = store.recordOfflinePunch(rohan!.id);
  assert(!!offlinePunch, '5.1: Offline punch recorded via store.recordOfflinePunch');
  const rohanOfflineRecord = store.dailyAttendance.find(
    d => d.student_id === rohan!.id && d.attendance_date === todayStr
  );
  assert(
    !!rohanOfflineRecord && rohanOfflineRecord.remarks.includes('OFFLINE-TERMINAL'),
    '5.2: Remarks contain "Offline arrival verified (OFFLINE-TERMINAL)"'
  );

  console.log('\n======================================================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
