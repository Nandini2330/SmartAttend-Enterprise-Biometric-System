import { DataStore } from '../apps/web/src/lib/data-store';

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 SMARTATTEND VERIFICATION: DIVISION CHANGE & STANDARD PROMOTION');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ PASS: ${testName}`);
      if (detail) console.log(`     └─ ${detail}`);
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     └─ ${detail}`);
      process.exitCode = 1;
    }
  }

  const store = new DataStore();
  // Ensure we start with clean in-memory state
  store.resetToDefaults();

  // -------------------------------------------------------------------------
  // SECTION 1: CHANGE STUDENT DIVISION
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 1: CHANGE STUDENT DIVISION ---');

  const aarav = store.students.find((s) => s.admission_number === 'DPS-2026-1001')!;
  assert(aarav !== undefined, 'Found test student Aarav Mehta (DPS-2026-1001)');
  assert(aarav.division_name === 'A', 'Initial student division is A', `Current: ${aarav.division_name}`);

  // Test 1.1: Role permission check (Teacher/Parent should be blocked)
  store.switchRole('teacher');
  const unauthorizedRes = await store.updateStudentDivision(aarav.id, 'B');
  assert(
    unauthorizedRes.success === false && unauthorizedRes.error?.includes('Denied'),
    'Permission Enforced: Teacher cannot change student division',
    `Error returned: "${unauthorizedRes.error}"`
  );
  assert(
    store.students.find((s) => s.id === aarav.id)?.division_name === 'A',
    'Division unchanged after unauthorized attempt'
  );

  // Test 1.2: Admin / Principal change student division from A to B
  store.switchRole('school_admin');
  const initialAttendanceCount = store.dailyAttendance.filter((d) => d.student_id === aarav.id).length;
  const initialExamMarks = store.examResults.find((e) => e.student_id === aarav.id)?.percentage;

  const adminChangeRes = await store.updateStudentDivision(aarav.id, 'B');
  assert(adminChangeRes.success === true, 'Admin successfully changed student division to B');

  const updatedAarav = store.students.find((s) => s.id === aarav.id)!;
  assert(updatedAarav.division_name === 'B', 'Student directory immediately reflects Division B', `Updated: ${updatedAarav.division_name}`);

  const activeEnrollment = store.classEnrollments.find((e) => e.student_id === aarav.id && e.is_active)!;
  assert(activeEnrollment?.division_name === 'B', 'Active class enrollment updated to Division B');

  // Test 1.3: Integrity verification (Attendance, marks, biometrics preserved)
  const afterAttendanceCount = store.dailyAttendance.filter((d) => d.student_id === aarav.id).length;
  const afterExamMarks = store.examResults.find((e) => e.student_id === aarav.id)?.percentage;
  assert(
    initialAttendanceCount === afterAttendanceCount && initialAttendanceCount > 0,
    'All historical attendance records preserved after division change',
    `Records: ${afterAttendanceCount}`
  );
  assert(
    initialExamMarks === afterExamMarks && initialExamMarks === 88,
    'Student examination marks preserved after division change',
    `Marks: ${afterExamMarks}%`
  );
  assert(updatedAarav.fingerprint_enrolled === true, 'Student biometric credentials preserved intact');

  // Test 1.4: Change division again to C
  const changeToC = await store.updateStudentDivision(aarav.id, 'C');
  assert(changeToC.success === true && store.students.find((s) => s.id === aarav.id)?.division_name === 'C', 'Can reassign to Division C');

  // -------------------------------------------------------------------------
  // SECTION 2: AUTOMATIC STANDARD PROMOTION (PASS vs FAIL)
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 2: AUTOMATIC STANDARD PROMOTION ---');

  // Find Kabir Das (Standard 9 PASS) and Priyansh Sharma (Standard 9 FAIL)
  const kabir = store.students.find((s) => s.first_name === 'Kabir')!;
  const priyansh = store.students.find((s) => s.first_name === 'Priyansh')!;

  assert(kabir !== undefined && kabir.class_name === 'Grade 9', 'Found Standard 9 student Kabir Das (Class: Grade 9)');
  assert(priyansh !== undefined && priyansh.class_name === 'Grade 9', 'Found Standard 9 student Priyansh Sharma (Class: Grade 9)');

  const kabirExam = store.examResults.find((e) => e.student_id === kabir.id);
  const priyanshExam = store.examResults.find((e) => e.student_id === priyansh.id);
  assert(kabirExam?.result_status === 'PASS' && kabirExam.percentage >= 40, `Kabir examination result is PASS (${kabirExam?.percentage}%)`);
  assert(priyanshExam?.result_status === 'FAIL' && priyanshExam.percentage < 40, `Priyansh examination result is FAIL (${priyanshExam?.percentage}%)`);

  // Test 2.1: Eligibility Evaluator
  const kabirEligibility = store.getStudentPromotionEligibility(kabir.id, 75, '2027-2028');
  assert(
    kabirEligibility.status === 'PASS_PROMOTABLE' && kabirEligibility.targetClass === 'Grade 10',
    'Standard 9 PASS student evaluates to Grade 10 (Promoted)',
    `Target: ${kabirEligibility.targetClass}, Reason: ${kabirEligibility.reason}`
  );

  const priyanshEligibility = store.getStudentPromotionEligibility(priyansh.id, 75, '2027-2028');
  assert(
    priyanshEligibility.status === 'FAIL_RETAINED' && priyanshEligibility.targetClass === 'Grade 9',
    'Standard 9 FAIL student evaluates to Grade 9 (Retained)',
    `Target: ${priyanshEligibility.targetClass}, Reason: ${priyanshEligibility.reason}`
  );

  // Test 2.2: Individual Promotion on Kabir Das (PASS)
  console.log('\n  -> Executing Individual Promotion for Kabir Das (Standard 9 PASS)...');
  const kabirPromoRes = await store.promoteStudent(kabir.id, '2027-2028');
  assert(kabirPromoRes.success === true, 'Promotion execution returned success for Kabir');
  assert(kabirPromoRes.action === 'PROMOTED', 'Action is PROMOTED');
  assert(kabirPromoRes.to_class === 'Grade 10', 'Moved from Standard 9 to Standard 10');

  const promotedKabir = store.students.find((s) => s.id === kabir.id)!;
  assert(promotedKabir.class_name === 'Grade 10', 'Kabir Das student record updated to Grade 10');

  // Verify Kabir historical enrollment is archived and new enrollment active
  const kabirEnrollments = store.classEnrollments.filter((e) => e.student_id === kabir.id);
  const kabirOldEnrollment = kabirEnrollments.find((e) => e.academic_year_name === '2026-2027');
  const kabirNewEnrollment = kabirEnrollments.find((e) => e.academic_year_name === '2027-2028');
  assert(kabirOldEnrollment?.is_active === false, 'Previous Grade 9 enrollment archived with is_active: false');
  assert(kabirNewEnrollment?.is_active === true && kabirNewEnrollment?.class_name === 'Grade 10', 'New Grade 10 enrollment active for 2027-2028');

  // Test 2.3: Individual Promotion on Priyansh Sharma (FAIL)
  console.log('\n  -> Executing Individual Promotion for Priyansh Sharma (Standard 9 FAIL)...');
  const priyanshPromoRes = await store.promoteStudent(priyansh.id, '2027-2028');
  assert(priyanshPromoRes.success === true, 'Retention execution returned success for Priyansh');
  assert(priyanshPromoRes.action === 'RETAINED', 'Action is RETAINED');
  assert(priyanshPromoRes.to_class === 'Grade 9', 'Remained in Standard 9');

  const retainedPriyansh = store.students.find((s) => s.id === priyansh.id)!;
  assert(retainedPriyansh.class_name === 'Grade 9', 'Priyansh Sharma student record remains Grade 9 in 2027-2028');

  const priyanshNewEnrollment = store.classEnrollments.find((e) => e.student_id === priyansh.id && e.academic_year_name === '2027-2028');
  assert(priyanshNewEnrollment?.is_active === true && priyanshNewEnrollment?.class_name === 'Grade 9', 'Active enrollment in 2027-2028 confirms Grade 9 retention');

  // Test 2.4: Anti-Duplicate Promotion Protection
  console.log('\n  -> Testing Anti-Duplicate Promotion Protection...');
  const duplicateAttempt = await store.promoteStudent(kabir.id, '2027-2028');
  assert(
    duplicateAttempt.action === 'SKIPPED_DUPLICATE' && duplicateAttempt.success === false,
    'Duplicate promotion prevented: student already actively enrolled in 2027-2028',
    `Message: ${duplicateAttempt.message}`
  );
  const kabirActive2028Count = store.classEnrollments.filter((e) => e.student_id === kabir.id && e.academic_year_name === '2027-2028').length;
  assert(kabirActive2028Count === 1, 'Exactly one enrollment exists for target year (no duplicates)');

  // -------------------------------------------------------------------------
  // SECTION 3: BULK PROMOTION WITH ALL STANDARDS
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 3: BULK PROMOTION ACROSS ALL STANDARDS ---');

  // Reset to initial and test bulk automatic promotion
  store.resetToDefaults();
  store.switchRole('school_admin');

  console.log('  -> Executing bulk automatic promotion for entire Grade 10 batch...');
  const bulkResult = await store.executeAutomaticStandardPromotion({
    sourceClass: 'Grade 10',
    targetYear: '2027-2028'
  });

  console.log(`     Promoted count: ${bulkResult.promoted_count}`);
  console.log(`     Retained count: ${bulkResult.retained_count}`);
  console.log(`     Skipped count:  ${bulkResult.skipped_duplicates}`);

  // Aarav (88%), Ananya (92%), Rohan (78%), Diya (85%) = 4 passed
  // Ishaan (34%) = 1 failed
  assert(bulkResult.promoted_count === 4, '4 Grade 10 students with PASS promoted to Grade 11');
  assert(bulkResult.retained_count === 1, '1 Grade 10 student with FAIL (< 40%) retained in Grade 10');

  const ishaan = store.students.find((s) => s.admission_number === 'DPS-2026-1004')!;
  assert(ishaan.class_name === 'Grade 10', 'Ishaan Gupta (FAIL 34%) kept in Grade 10');

  const ananya = store.students.find((s) => s.admission_number === 'DPS-2026-1002')!;
  assert(ananya.class_name === 'Grade 11', 'Ananya Kapoor (PASS 92%) moved to Grade 11');

  // Test 3.2: Re-running bulk promotion triggers anti-duplicate check for all students
  const repeatBulk = await store.executeAutomaticStandardPromotion({
    sourceClass: 'Grade 10',
    targetYear: '2027-2028'
  });
  assert(repeatBulk.promoted_count === 0, 'Repeat bulk promotion promotes 0 students (all already enrolled)');
  assert(repeatBulk.skipped_duplicates > 0, `${repeatBulk.skipped_duplicates} duplicate enrollments prevented on repeat run`);

  console.log('\n================================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('ALL VERIFICATIONS SUCCESSFUL. Zero regressions.');
    process.exit(0);
  } else {
    console.error('SOME VERIFICATIONS FAILED.');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
