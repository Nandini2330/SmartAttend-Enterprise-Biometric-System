// ==============================================================================
// SmartAttend: Client DataStore & Multi-Role Isolation Test
// Tests that Admin, Teacher, Student, and Multiple Parents are strictly isolated
// ==============================================================================

import assert from 'assert';
import { dataStore, DEMO_USERS, PARENT_PROFILES } from '../apps/web/src/lib/data-store.js';

console.log('\x1b[1m\x1b[36m================================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m   🧪 SMARTATTEND: ROLE ISOLATION & CLIENT STORE VERIFICATION  \x1b[0m');
console.log('\x1b[1m\x1b[36m================================================================\x1b[0m\n');

async function runClientTests() {
  console.log('Verifying client store contracts and security policies...');

  // 1. Verify multiple parent profiles defined
  assert(PARENT_PROFILES && PARENT_PROFILES.length >= 4, 'Must have at least 4 parent profiles for testing');
  console.log(`  \x1b[32m✔ PASS\x1b[0m: Verified ${PARENT_PROFILES.length} parent test profiles loaded`);

  const vikram = PARENT_PROFILES.find((p) => p.email === 'vikram.mehta@gmail.com');
  const sunita = PARENT_PROFILES.find((p) => p.email === 'sunita.kapoor@gmail.com');
  const anil = PARENT_PROFILES.find((p) => p.email === 'anil.verma@gmail.com');
  const pooja = PARENT_PROFILES.find((p) => p.email === 'pooja.gupta@gmail.com');

  assert(vikram && vikram.studentName === 'Aarav Mehta');
  assert(sunita && sunita.studentName === 'Ananya Kapoor');
  assert(anil && anil.studentName === 'Rohan Verma');
  assert(pooja && pooja.studentName === 'Ishaan Gupta');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Parent-Student mappings verified for all 4 parent accounts');

  // 2. Test School Admin Role
  dataStore.switchRole('school_admin');
  assert.strictEqual(dataStore.currentUser.role, 'school_admin');
  const adminStudents = dataStore.getAuthorizedStudents();
  assert.strictEqual(adminStudents.length, 6, 'Admin must see all 6 students');
  const adminAttendance = dataStore.getAuthorizedAttendance();
  assert(adminAttendance.records.length > 5, 'Admin can see all attendance records');
  console.log('  \x1b[32m✔ PASS\x1b[0m: School Admin / Principal login is completely intact and unaffected');

  // 3. Test Teacher Role
  dataStore.switchRole('teacher');
  assert.strictEqual(dataStore.currentUser.role, 'teacher');
  const teacherStudents = dataStore.getAuthorizedStudents();
  assert(teacherStudents.length > 0, 'Teacher can access students');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Teacher login is completely intact and unaffected');

  // 4. Test Student Role
  dataStore.switchRole('student');
  assert.strictEqual(dataStore.currentUser.role, 'student');
  const studentSelf = dataStore.getAuthorizedStudents();
  assert.strictEqual(studentSelf.length, 1);
  assert.strictEqual(studentSelf[0].admission_number, 'DPS-2026-1001');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Student login is completely intact and isolated to self');

  // 5. Test Parent 1: Vikram Mehta
  dataStore.switchParentUser(vikram.id);
  assert.strictEqual(dataStore.currentUser.role, 'parent');
  const vikramChildren = dataStore.getAuthorizedStudents();
  assert.strictEqual(vikramChildren.length, 1);
  assert.strictEqual(vikramChildren[0].first_name, 'Aarav');
  const vikramRecords = dataStore.getAuthorizedAttendance();
  assert(vikramRecords.records.length > 0);
  vikramRecords.records.forEach((r) => {
    assert.strictEqual(r.student_id, vikram.studentId, 'Must ONLY contain Aarav Mehta records');
  });
  console.log('  \x1b[32m✔ PASS\x1b[0m: Parent Vikram Mehta can ONLY view child Aarav Mehta records');

  // 6. Test Parent 1 Tamper Attempt (IDOR block)
  const tamperResult = dataStore.getAuthorizedAttendance({ studentId: sunita.studentId });
  assert.strictEqual(tamperResult.isUnauthorizedBlocked, true);
  assert.strictEqual(tamperResult.records.length, 0, 'Zero records must be returned on tampered student ID');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Tampered student ID request blocked at DataStore level (isUnauthorizedBlocked: true)');

  // 7. Test Parent 2: Sunita Kapoor
  dataStore.switchParentUser(sunita.id);
  const sunitaChildren = dataStore.getAuthorizedStudents();
  assert.strictEqual(sunitaChildren.length, 1);
  assert.strictEqual(sunitaChildren[0].first_name, 'Ananya');
  const sunitaRecords = dataStore.getAuthorizedAttendance();
  sunitaRecords.records.forEach((r) => {
    assert.strictEqual(r.student_id, sunita.studentId, 'Must ONLY contain Ananya Kapoor records');
  });
  const sunitaMetrics = dataStore.getChildAttendanceMetrics();
  assert.strictEqual(sunitaMetrics.percentage, 92, 'Ananya Kapoor attendance rate must be 92%');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Parent Sunita Kapoor can ONLY view child Ananya Kapoor records (92% rate)');

  // 8. Test Parent 3: Anil Verma
  dataStore.switchParentUser(anil.id);
  const anilChildren = dataStore.getAuthorizedStudents();
  assert.strictEqual(anilChildren.length, 1);
  assert.strictEqual(anilChildren[0].first_name, 'Rohan');
  const anilRecords = dataStore.getAuthorizedAttendance();
  anilRecords.records.forEach((r) => {
    assert.strictEqual(r.student_id, anil.studentId, 'Must ONLY contain Rohan Verma records');
  });
  const anilMetrics = dataStore.getChildAttendanceMetrics();
  assert.strictEqual(anilMetrics.percentage, 100, 'Rohan Verma attendance rate must be 100%');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Parent Anil Verma can ONLY view child Rohan Verma records (100% rate)');

  // 9. Test Parent 4: Pooja Gupta
  dataStore.switchParentUser(pooja.id);
  const poojaChildren = dataStore.getAuthorizedStudents();
  assert.strictEqual(poojaChildren.length, 1);
  assert.strictEqual(poojaChildren[0].first_name, 'Ishaan');
  const poojaRecords = dataStore.getAuthorizedAttendance();
  poojaRecords.records.forEach((r) => {
    assert.strictEqual(r.student_id, pooja.studentId, 'Must ONLY contain Ishaan Gupta records');
  });
  const poojaMetrics = dataStore.getChildAttendanceMetrics();
  assert.strictEqual(poojaMetrics.percentage, 76, 'Ishaan Gupta attendance rate must be 76%');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Parent Pooja Gupta can ONLY view child Ishaan Gupta records (76% rate)');

  // 10. Test Unauthorized Leave Application Prevention
  let leaveBlocked = false;
  try {
    // Pooja Gupta tries to apply leave for Aarav Mehta
    dataStore.submitLeaveRequest(vikram.studentId, '2026-11-05', '2026-11-06', 'Attempting unauthorized leave');
  } catch (err) {
    leaveBlocked = true;
    assert(err.message.includes('Security Exception'));
  }
  assert.strictEqual(leaveBlocked, true, 'Applying leave for another student must throw Security Exception');
  console.log('  \x1b[32m✔ PASS\x1b[0m: Unauthorized leave application strictly rejected with Security Exception');

  console.log('\n\x1b[1m\x1b[36m================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32mALL 10 CLIENT STORE & ROLE ISOLATION TESTS PASSED PERFECTLY!\x1b[0m');
  console.log('\x1b[1m\x1b[36m================================================================\x1b[0m\n');
}

runClientTests();

