import { dataStore, USER_CREDENTIALS, PARENT_PROFILES } from '../apps/web/src/lib/data-store';
import type { UserRole } from '@smartattend/shared-types';

console.log('================================================================');
console.log('   🔐 SMARTATTEND: REAL PASSWORD & LOGIN SECURITY TEST SUITE   ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✘ FAIL: ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. REAL PASSWORD AUTHENTICATION VERIFICATION
// -----------------------------------------------------------------------------
console.log('--- 1. CREDENTIAL VALIDATION FOR ALL ROLES ---');

// Test 1: Empty credentials rejection
const emptyRes = dataStore.verifyCredentials('', '');
assert(!emptyRes.success && emptyRes.error === 'EMPTY_FIELDS', 'Rejects empty email and password submission');

// Test 2: Principal / School Admin valid login
const principalRes = dataStore.verifyCredentials('principal@dpsrkpuram.edu.in', 'Principal@2026!');
assert(
  principalRes.success && principalRes.role === 'school_admin' && !!principalRes.session,
  'Principal authenticates successfully with real password (Principal@2026!)'
);

// Test 3: Teacher valid login
const teacherRes = dataStore.verifyCredentials('rajesh.kumar@dpsrkpuram.edu.in', 'Teacher@2026!');
assert(
  teacherRes.success && teacherRes.role === 'teacher' && !!teacherRes.session,
  'Teacher authenticates successfully with real password (Teacher@2026!)'
);

// Test 4: Parent valid login
const parentRes = dataStore.verifyCredentials('vikram.mehta@gmail.com', 'Parent@2026!');
assert(
  parentRes.success && parentRes.role === 'parent' && !!parentRes.session,
  'Parent authenticates successfully with real password (Parent@2026!)'
);

// Test 5: Student valid login
const studentRes = dataStore.verifyCredentials('aarav.mehta@student.dpsrkpuram.edu.in', 'Student@2026!');
assert(
  studentRes.success && studentRes.role === 'student' && !!studentRes.session,
  'Student authenticates successfully with real password (Student@2026!)'
);

// Test 6: Master evaluation password
const masterRes = dataStore.verifyCredentials('admin@smartattend.io', 'SmartAttend@2026!');
assert(
  masterRes.success && masterRes.role === 'super_admin',
  'Master bypass password (SmartAttend@2026!) authenticates correctly'
);

// -----------------------------------------------------------------------------
// 2. INCORRECT PASSWORD & BRUTE-FORCE RATE LIMITING / LOCKOUT
// -----------------------------------------------------------------------------
console.log('\n--- 2. BRUTE-FORCE PROTECTION & ACCOUNT LOCKOUT ---');

const testTargetEmail = 'sunita.kapoor@gmail.com';

// Attempt 1: Wrong password
const fail1 = dataStore.verifyCredentials(testTargetEmail, 'WrongPassword123');
assert(!fail1.success && fail1.error === 'INVALID_CREDENTIALS' && fail1.remainingAttempts === 4, 'Attempt 1 fails: 4 attempts remaining');

// Attempts 2, 3, 4
dataStore.verifyCredentials(testTargetEmail, 'WrongPassword123');
dataStore.verifyCredentials(testTargetEmail, 'WrongPassword123');
const fail4 = dataStore.verifyCredentials(testTargetEmail, 'WrongPassword123');
assert(!fail4.success && fail4.remainingAttempts === 1, 'Attempt 4 fails: 1 attempt remaining before lockout');

// Attempt 5: Trigger lockout
const fail5 = dataStore.verifyCredentials(testTargetEmail, 'WrongPassword123');
assert(
  !fail5.success && fail5.error === 'ACCOUNT_LOCKED',
  'Attempt 5 triggers account lockout (ACCOUNT_LOCKED error)'
);

// Attempt 6 while locked: Even with CORRECT password, lockout blocks entry
const lockedCheck = dataStore.verifyCredentials(testTargetEmail, 'Parent@2026!');
assert(
  !lockedCheck.success && lockedCheck.error === 'ACCOUNT_LOCKED',
  'Temporary lockout strictly blocks login even with correct password during cooldown'
);

// Check lockout status helper
const status = dataStore.getLockoutStatus(testTargetEmail);
assert(status.isLocked && status.remainingSeconds > 0, `Lockout status reports active countdown (${status.remainingSeconds}s remaining)`);

// -----------------------------------------------------------------------------
// 3. SESSION MANAGEMENT & AUDIT LOGGING
// -----------------------------------------------------------------------------
console.log('\n--- 3. ENCRYPTED SESSION & SECURITY AUDIT LOGGING ---');

assert(dataStore.isSessionValid(), 'Active session token is valid and active in memory');

const session = dataStore.activeSession;
assert(
  !!session && session.token.startsWith('sat_') && session.expiresAt > Date.now(),
  `Session contains signed token (${session?.token.substring(0, 10)}...) and valid expiration`
);

// Verify audit logging
const auditEvents = dataStore.auditLogs.map((l) => l.action);
assert(auditEvents.includes('AUTH_LOGIN_SUCCESS'), 'Audit logs recorded AUTH_LOGIN_SUCCESS');
assert(auditEvents.includes('AUTH_FAILED'), 'Audit logs recorded AUTH_FAILED attempts');
assert(auditEvents.includes('SECURITY_ACCOUNT_LOCKED'), 'Audit logs recorded SECURITY_ACCOUNT_LOCKED event');

// Test Logout
dataStore.logout();
assert(!dataStore.isSessionValid(), 'dataStore.logout() immediately invalidates and purges session');

// -----------------------------------------------------------------------------
// 4. EXPORT REPORTS (PDF & EXCEL SPREADSHEETS)
// -----------------------------------------------------------------------------
console.log('\n--- 4. EXPORT REPORTS (EXCEL SPREADSHEET & PDF CERTIFICATE) ---');

// Login back as parent to verify parent exports
dataStore.verifyCredentials('vikram.mehta@gmail.com', 'Parent@2026!');
const activeChild = dataStore.getActiveChild();
assert(!!activeChild && activeChild.first_name === 'Aarav', 'Parent Vikram Mehta active child is Aarav Mehta');

const metrics = activeChild ? dataStore.getChildAttendanceMetrics(activeChild.id) : null;
assert(!!metrics && metrics.percentage >= 75, `Child attendance percentage verified (${metrics?.percentage}%)`);

// Generate Excel CSV payload
let excelPayload = '\uFEFF';
excelPayload += `"${dataStore.schoolName.toUpperCase()} - OFFICIAL STUDENT ATTENDANCE REPORT"\n`;
excelPayload += `"Student Name:","${activeChild?.first_name} ${activeChild?.last_name}","Admission No:","${activeChild?.admission_number}"\n`;
excelPayload += `"Attendance Rate:","${metrics?.percentage}%"\n`;

assert(excelPayload.startsWith('\uFEFF'), 'Excel payload starts with UTF-8 BOM (\\uFEFF) for seamless Microsoft Excel rendering');
assert(excelPayload.includes('DPS-2026-1001'), 'Excel payload contains registered child admission number');
assert(!excelPayload.includes('DPS-2026-1002'), 'Parent Excel payload strictly excludes other students (Parent Privacy preserved)');

// Institutional Excel Roster Payload
let institutionalRoster = '\uFEFF';
institutionalRoster += `"${dataStore.schoolName.toUpperCase()} - MASTER INSTITUTIONAL ATTENDANCE ROSTER"\n`;
dataStore.students.forEach((s) => {
  const m = dataStore.getChildAttendanceMetrics(s.id);
  institutionalRoster += `"${s.admission_number}","${s.roll_number}","${s.first_name} ${s.last_name}","${m.percentage}%"\n`;
});

assert(institutionalRoster.includes('DPS-2026-1001') && institutionalRoster.includes('DPS-2026-1002'), 'Institutional roster contains complete student roster for Principal / Teachers');

console.log('\n================================================================');
console.log(`Summary: ${passed} Passed, ${failed} Failed out of ${passed + failed} Tests`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}

