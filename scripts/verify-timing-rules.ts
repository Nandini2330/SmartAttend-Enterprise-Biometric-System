// ==============================================================================
// SmartAttend: Comprehensive Verification of School Timing & Attendance Rules
// Verifies all 14 Timing Scenarios:
//   1. 08:25 AM -> PRESENT (Early Arrival, 0 min late)
//   2. 08:30 AM -> PRESENT (On-Time Opening Bell, 0 min late)
//   3. 08:40 AM -> PRESENT (Within 15-Minute Grace Period, 0 min late)
//   4. 08:45 AM -> PRESENT (Grace Deadline exactly, 0 min late)
//   5. 08:46 AM -> LATE (1 min late)
//   6. 09:00 AM -> LATE (15 min late)
//   7. 09:30 AM -> LATE (45 min late)
//   8. 09:59 AM -> LATE (74 min late / 1 hr 14 min)
//   9. No arrival by 10:00 AM -> ABSENT (Reconciled at Cutoff)
//  10. 10:30 AM -> HALF DAY (Post-10:00 AM Cutoff Arrival)
//  11. 12:37 PM (12:37:44) -> HALF DAY (Post-Cutoff Arrival, NOT fixed 15m)
//  12. Approved Leave -> ON_LEAVE preserved (not marked absent)
//  13. Duplicate Scan -> Anti-replay preserves initial arrival timestamp
//  14. Offline Punch -> Evaluated by punch timestamp, not sync timestamp
// ==============================================================================

import {
  DataStore,
  evaluateAttendanceRecord,
  parseTimeToMinutes,
  formatTime12Hour,
  formatLateDuration
} from '../apps/web/src/lib/data-store';

async function runTimingRulesVerification() {
  console.log('======================================================================');
  console.log('   SmartAttend: School Arrival, Grace, Late & Cutoff Verification');
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

  console.log('--- 1. CONFIGURATION SOURCE OF TRUTH CHECK ---');
  assert(store.openingTime === '08:30', '1.1 School Opening Bell is 08:30 AM');
  assert(store.graceMinutes === 15, '1.2 Permitted Grace Period is 15 minutes');
  assert(store.getGraceDeadlineStr() === '08:45 AM', '1.3 Grace Deadline calculates to 08:45 AM');
  assert(store.cutoffTime === '10:00', '1.4 Official Absence Cutoff is 10:00 AM');

  console.log('\n--- 2. TIMING SCENARIOS 1-8: ON-TIME & LATE CALCULATIONS ---');

  // Scenario 1: 08:25 AM (Early Arrival)
  const eval1 = evaluateAttendanceRecord({ arrivalTime: '08:25:00', studentName: 'Aarav Mehta' });
  assert(
    eval1.status === 'PRESENT' &&
    eval1.isLate === false &&
    eval1.minutesLate === 0 &&
    eval1.category === 'EARLY' &&
    eval1.notificationMessage.includes('arrived at 08:25 AM. Attendance marked Present.'),
    'Scenario 1 (08:25 AM): Marked PRESENT (Early, 0 min late)'
  );

  // Scenario 2: 08:30 AM (Opening Bell On-Time)
  const eval2 = evaluateAttendanceRecord({ arrivalTime: '08:30:00', studentName: 'Aarav Mehta' });
  assert(
    eval2.status === 'PRESENT' &&
    eval2.isLate === false &&
    eval2.minutesLate === 0 &&
    eval2.category === 'ON_TIME' &&
    eval2.notificationMessage.includes('arrived at 08:30 AM. Attendance marked Present.'),
    'Scenario 2 (08:30 AM): Marked PRESENT (On-Time, 0 min late)'
  );

  // Scenario 3: 08:40 AM (Within Grace Period)
  const eval3 = evaluateAttendanceRecord({ arrivalTime: '08:40:00', studentName: 'Aarav Mehta' });
  assert(
    eval3.status === 'PRESENT' &&
    eval3.isLate === false &&
    eval3.minutesLate === 0 &&
    eval3.category === 'GRACE_PERIOD' &&
    eval3.notificationMessage.includes('arrived at 08:40 AM. Attendance marked Present.'),
    'Scenario 3 (08:40 AM): Marked PRESENT (Within Grace Period, 0 min late)'
  );

  // Scenario 4: 08:45 AM (Grace Deadline)
  const eval4 = evaluateAttendanceRecord({ arrivalTime: '08:45:00', studentName: 'Aarav Mehta' });
  assert(
    eval4.status === 'PRESENT' &&
    eval4.isLate === false &&
    eval4.minutesLate === 0 &&
    eval4.notificationMessage.includes('arrived at 08:45 AM. Attendance marked Present.'),
    'Scenario 4 (08:45 AM): Marked PRESENT (Grace Deadline, 0 min late)'
  );

  // Scenario 5: 08:46 AM (1 min Late)
  const eval5 = evaluateAttendanceRecord({ arrivalTime: '08:46:00', studentName: 'Aarav Mehta' });
  assert(
    eval5.status === 'LATE' &&
    eval5.isLate === true &&
    eval5.minutesLate === 1 &&
    eval5.lateDurationFormatted === '1 min' &&
    eval5.notificationMessage.includes('arrived at 08:46 AM. Late by 1 min after the permitted grace period.'),
    'Scenario 5 (08:46 AM): Marked LATE (1 min late duration)'
  );

  // Scenario 6: 09:00 AM (15 min Late)
  const eval6 = evaluateAttendanceRecord({ arrivalTime: '09:00:00', studentName: 'Aarav Mehta' });
  assert(
    eval6.status === 'LATE' &&
    eval6.isLate === true &&
    eval6.minutesLate === 15 &&
    eval6.lateDurationFormatted === '15 min' &&
    eval6.notificationMessage.includes('arrived at 09:00 AM. Late by 15 min after the permitted grace period.'),
    'Scenario 6 (09:00 AM): Marked LATE (15 min late duration)'
  );

  // Scenario 7: 09:30 AM (45 min Late)
  const eval7 = evaluateAttendanceRecord({ arrivalTime: '09:30:00', studentName: 'Aarav Mehta' });
  assert(
    eval7.status === 'LATE' &&
    eval7.isLate === true &&
    eval7.minutesLate === 45 &&
    eval7.lateDurationFormatted === '45 min' &&
    eval7.notificationMessage.includes('arrived at 09:30 AM. Late by 45 min after the permitted grace period.'),
    'Scenario 7 (09:30 AM): Marked LATE (45 min late duration)'
  );

  // Scenario 8: 09:59 AM (74 min Late / 1 hr 14 min)
  const eval8 = evaluateAttendanceRecord({ arrivalTime: '09:59:00', studentName: 'Aarav Mehta' });
  assert(
    eval8.status === 'LATE' &&
    eval8.isLate === true &&
    eval8.minutesLate === 74 &&
    eval8.lateDurationFormatted.includes('74 min') &&
    eval8.notificationMessage.includes('arrived at 09:59 AM. Late by') &&
    eval8.notificationMessage.includes('after the permitted grace period.'),
    'Scenario 8 (09:59 AM): Marked LATE (74 min / 1 hr 14 min late)'
  );

  console.log('\n--- 3. TIMING SCENARIOS 9-11: CUTOFF & POST-CUTOFF HALF DAY ---');

  // Scenario 9: No arrival by 10:00 AM -> Absence Cutoff
  const eval9 = evaluateAttendanceRecord({ forcedStatus: 'ABSENT', studentName: 'Ishaan Gupta' });
  assert(
    eval9.status === 'ABSENT' &&
    eval9.isLate === false &&
    eval9.minutesLate === 0 &&
    eval9.notificationMessage.includes('has been marked Absent because no valid arrival was recorded before the 10:00 AM cutoff.'),
    'Scenario 9 (No arrival by 10:00 AM): Reconciled ABSENT with exact cutoff message'
  );

  // Scenario 10: 10:30 AM (Post-Cutoff Arrival)
  const eval10 = evaluateAttendanceRecord({ arrivalTime: '10:30:00', studentName: 'Rohan Verma' });
  assert(
    eval10.status === 'HALF_DAY' &&
    eval10.isLate === true &&
    eval10.minutesLate === 105 &&
    eval10.category === 'HALF_DAY_LATE' &&
    eval10.notificationMessage.includes('arrived after the 10:00 AM cutoff. Attendance recorded according to the school\'s Half Day policy.'),
    'Scenario 10 (10:30 AM): Classified HALF DAY (arrival after 10:00 AM cutoff)'
  );

  // Scenario 11: 12:37 PM (12:37:44)
  const eval11 = evaluateAttendanceRecord({ arrivalTime: '12:37:44', studentName: 'Rohan Verma' });
  assert(
    eval11.status === 'HALF_DAY' &&
    eval11.minutesLate !== 15 &&
    eval11.notificationMessage.includes('arrived after the 10:00 AM cutoff. Attendance recorded according to the school\'s Half Day policy.') &&
    !eval11.notificationMessage.includes('(15 min late)'),
    'Scenario 11 (12:37:44): Root cause fixed! NOT hardcoded to 15m; classified HALF DAY under policy'
  );

  console.log('\n--- 4. SCENARIO 12: APPROVED LEAVE PRESERVATION ---');

  // Kabir Joshi (id: 88888888-8888-8888-8888-888888888806) has no arrival record today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const studentKabir = store.students.find((s) => s.admission_number === 'DPS-2026-0901')!;

  store.leaveRequests.push({
    id: 'leave-test-01',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: studentKabir.id,
    student_name: `${studentKabir.first_name} ${studentKabir.last_name}`,
    class_name: 'Grade 9-A',
    parent_name: 'Ramesh Joshi',
    parent_phone: '+919866677788',
    start_date: todayDateStr,
    end_date: todayDateStr,
    reason: 'Medical recovery under doctor orders',
    status: 'APPROVED',
    created_at: new Date().toISOString()
  });

  const absReconciled = store.runAbsenceReconciliation();
  const kabirRecord = store.dailyAttendance.find(
    (d) => d.student_id === studentKabir.id && d.attendance_date === todayDateStr
  );

  assert(
    kabirRecord !== undefined &&
    kabirRecord.status === 'ON_LEAVE' &&
    kabirRecord.remarks.includes('Approved leave in effect'),
    'Scenario 12 (Approved Leave): Preserved ON_LEAVE during cutoff reconciliation (not marked absent)'
  );

  console.log('\n--- 5. SCENARIO 13: DUPLICATE PUNCH & ANTI-REPLAY TIMING INTEGRITY ---');

  // Clear any pre-seeded record for Aarav Mehta (DPS-2026-1001) today to test fresh punch & duplicate
  store.dailyAttendance = store.dailyAttendance.filter(
    (d) => d.student?.admission_number !== 'DPS-2026-1001' && d.student_id !== '88888888-8888-8888-8888-888888888801'
  );

  // First punch at 08:28:10 (On-Time)
  const punch1 = store.recordBiometricPunch('DPS-2026-1001', 'FACE', 0.99, '08:28:10');
  const record1 = store.dailyAttendance.find(
    (d) => (d.student?.admission_number === 'DPS-2026-1001' || d.student_id === '88888888-8888-8888-8888-888888888801') && d.attendance_date === todayDateStr
  );
  assert(
    record1 !== undefined &&
    record1.status === 'PRESENT' &&
    record1.first_arrival_time === '08:28:10',
    'Scenario 13.1: First punch recorded with verified timestamp 08:28:10'
  );

  // Duplicate punch simulated at 08:48:00
  const punch2 = store.recordBiometricPunch('DPS-2026-1001', 'FACE', 0.99, '08:48:00');
  const record2 = store.dailyAttendance.find(
    (d) => (d.student?.admission_number === 'DPS-2026-1001' || d.student_id === '88888888-8888-8888-8888-888888888801') && d.attendance_date === todayDateStr
  );
  assert(
    record2 !== undefined &&
    record2.first_arrival_time === '08:28:10' &&
    record2.status === 'PRESENT',
    'Scenario 13.2: Anti-replay preserves initial arrival timestamp 08:28:10 (not overwritten by 08:48:00 scan)'
  );

  console.log('\n--- 6. SCENARIO 14: OFFLINE PUNCH EVALUATED BY PUNCH TIME ---');

  // Clear any pre-seeded record for Ananya Kapoor (DPS-2026-1002) today to test fresh offline punch
  store.dailyAttendance = store.dailyAttendance.filter(
    (d) => d.student?.admission_number !== 'DPS-2026-1002' && d.student_id !== '88888888-8888-8888-8888-888888888802'
  );

  // Offline punch queued with punch timestamp 08:55:00 (10 min late after 08:45 grace deadline)
  store.recordOfflinePunch('DPS-2026-1002', '08:55:00');
  const ananyaOffline = store.dailyAttendance.find(
    (d) => (d.student?.admission_number === 'DPS-2026-1002' || d.student_id === '88888888-8888-8888-8888-888888888802') && d.attendance_date === todayDateStr
  );

  assert(
    ananyaOffline !== undefined &&
    ananyaOffline.status === 'LATE' &&
    ananyaOffline.minutes_late === 10 &&
    ananyaOffline.first_arrival_time === '08:55:00' &&
    ananyaOffline.remarks.includes('10 min late'),
    'Scenario 14: Offline punch evaluated by device punch time (08:55 AM -> 10 min late), not by sync time'
  );

  console.log('\n======================================================================');
  console.log(`Verification Complete: ${passed} passed, ${failed} failed.`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTimingRulesVerification().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
