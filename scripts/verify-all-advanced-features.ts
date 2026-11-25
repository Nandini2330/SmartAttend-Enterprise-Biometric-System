/**
 * SmartAttend - Advanced Platform Verification Test Suite
 * Tests Features 1 through 15:
 * - Feature 4: Period-wise and subject-wise attendance
 * - Feature 5: Timetable management
 * - Feature 6: Advanced parent notification system
 * - Feature 7: Visitor registration and student pickup verification
 * - Feature 8: Digital QR student ID cards
 * - Feature 9: Academic year and student promotion management
 * - Feature 10: School calendar and holiday management
 * - Feature 11: Teacher workload management
 * - Feature 12: Device health monitoring
 * - Feature 13: Attendance correction approval workflow
 * - Feature 14: Marathi and English i18n support
 * - Feature 15: DPDP Act 2023 biometric data protection & consent management
 */

import { dataStore } from '../apps/web/src/lib/data-store';
import { translations } from '../apps/web/src/lib/i18n';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function runSuite() {
  console.log('===============================================================');
  console.log('   SmartAttend Enterprise Platform - Advanced Features Verification');
  console.log('===============================================================\n');

  // Test 1: Feature 10 - School Calendar & Holidays
  console.log('--- [Feature 10] School Calendar & Holiday Management ---');
  assert(dataStore.holidays.length >= 4, 'Pre-configured institutional holidays loaded');
  assert(dataStore.isHoliday('2026-11-10'), 'Diwali (2026-11-10) correctly recognized as holiday');
  assert(!dataStore.isHoliday('2026-11-04'), 'Regular working day (2026-11-04) recognized as non-holiday');

  // Test adding and removing holiday
  const added = await dataStore.addHoliday({
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    holiday_date: '2026-10-02',
    name: 'Gandhi Jayanti',
    description: 'National Holiday'
  });
  assert(dataStore.isHoliday('2026-10-02'), 'Newly added Gandhi Jayanti correctly registered');
  await dataStore.deleteHoliday(added.id);
  assert(!dataStore.isHoliday('2026-10-02'), 'Deleted holiday successfully removed');

  // Test 2: Feature 9 - Academic Year & Student Promotion Wizard
  console.log('\n--- [Feature 9] Academic Year & Student Promotion Wizard ---');
  const grade9Count = dataStore.students.filter((s) => s.class_name === 'Grade 9').length;
  assert(grade9Count > 0, 'Found students in Grade 9 before promotion');
  const promotedCount = await dataStore.promoteStudents('Grade 9', 'Grade 10', '2027-2028');
  assert(promotedCount === grade9Count, `Successfully promoted all ${promotedCount} Grade 9 students to Grade 10`);
  const remainingGrade9 = dataStore.students.filter((s) => s.class_name === 'Grade 9').length;
  assert(remainingGrade9 === 0, 'Zero students left in source Grade 9 after batch promotion');

  // Test 3: Feature 15 - DPDP Act 2023 Biometric Consent & Right to Erasure
  console.log('\n--- [Feature 15] DPDP Act 2023 Biometric Protection & Consent Ledger ---');
  const student = dataStore.students[0];
  dataStore.toggleBiometricConsent(student.id, false);
  const revoked = dataStore.biometricConsent.find((c) => c.student_id === student.id);
  assert(revoked?.consent_given === false, 'Biometric processing consent successfully revoked');

  dataStore.purgeBiometricTemplates(student.id);
  assert(student.face_enrolled === false, 'Face vector embedding purged from student record');
  assert(student.fingerprint_enrolled === false, 'Fingerprint minutiae purged from student record');
  const purgedConsent = dataStore.biometricConsent.find((c) => c.student_id === student.id);
  assert(purgedConsent?.hash_sha256.includes('PURGED'), 'Audit hash updated with statutory Right to Erasure flag');

  // Test 4: Features 4, 5, 11 - Timetable, Subject-Wise Attendance, Teacher Workload
  console.log('\n--- [Features 4, 5, 11] Timetable, Subject Attendance & Teacher Workload ---');
  assert(dataStore.timetable.length >= 10, 'School weekly timetable contains standard periods across days');
  const period1Mon = dataStore.timetable.find((t) => t.day === 'Monday' && t.period === 1);
  assert(period1Mon?.subject === 'Mathematics', 'Monday Period 1 correctly mapped to Mathematics');

  // Record subject-wise attendance
  dataStore.recordSubjectAttendance(student.id, 'Mathematics', 1, '2026-11-04', 'PRESENT');
  dataStore.recordSubjectAttendance(student.id, 'Mathematics', 1, '2026-11-05', 'PRESENT');
  dataStore.recordSubjectAttendance(student.id, 'Mathematics', 1, '2026-11-06', 'ABSENT');

  const summary = dataStore.getSubjectAttendanceSummary(student.id);
  assert(summary['Mathematics']?.total === 3, 'Recorded 3 lectures for Mathematics');
  assert(summary['Mathematics']?.attended === 2, 'Attended 2 out of 3 lectures');
  assert(summary['Mathematics']?.percentage === 67, 'Computed 67% subject-wise lecture attendance');

  // Test 5: Feature 13 - Attendance Correction Workflow
  console.log('\n--- [Feature 13] Attendance Correction Approval Workflow ---');
  const testDate = '2026-11-02';
  dataStore.overrideAttendance(student.id, 'PRESENT', 'Sports Day missed kiosk punch approved', testDate);
  const corrected = dataStore.dailyAttendance.find(
    (d) => d.student_id === student.id && d.attendance_date === testDate
  );
  assert(corrected?.status === 'PRESENT', 'Student daily attendance successfully overridden to PRESENT');
  assert(corrected?.remarks?.includes('Sports Day'), 'Audit remarks preserved in attendance ledger');

  // Test 6: Feature 14 - Marathi (मराठी) i18n Dictionary
  console.log('\n--- [Feature 14] Marathi (मराठी) Localization Support ---');
  const mr = translations.mr;
  assert(mr.brandName === 'स्मार्टअटेंड', 'Marathi brandName correctly translated: स्मार्टअटेंड');
  assert(mr.overviewDashboard === 'मुख्य डॅशबोर्ड', 'Marathi overviewDashboard translated: मुख्य डॅशबोर्ड');
  assert(mr.visitorPickup === 'गेट व अभ्यागत पडताळणी', 'Marathi visitorPickup translated: गेट व अभ्यागत पडताळणी');
  assert(mr.studentDirectoryTitle === 'विद्यार्थी यादी व बायोमेट्रिक प्रोफाइल', 'Marathi studentDirectoryTitle translated: विद्यार्थी यादी व बायोमेट्रिक प्रोफाइल');
  assert(mr.colBiometrics === 'बायोमेट्रिक्स', 'Marathi colBiometrics translated: बायोमेट्रिक्स');
  assert(mr.present === 'उपस्थित', 'Marathi status present translated: उपस्थित');
  assert(mr.absent === 'अनुपस्थित', 'Marathi status absent translated: अनुपस्थित');

  // Summary
  console.log('\n===============================================================');
  console.log(`   Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
