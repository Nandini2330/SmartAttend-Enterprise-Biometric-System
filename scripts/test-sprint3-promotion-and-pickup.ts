import { dataStore } from '../apps/web/src/lib/data-store';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runSprint3Verification() {
  console.log('===============================================================');
  console.log('   SmartAttend Enterprise - Sprint 3 Verification Suite');
  console.log('   Module 1: Academic Year Promotion & Transitions');
  console.log('   Module 2: Campus Visitor Management & Badges');
  console.log('   Module 3: Student Pickup Authorization, OTP & Gate Pass');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Academic Year Transitions & Session Management
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Academic Year Transitions & Session Management ---');

  const initialYearsCount = dataStore.academicYears.length;
  assert(initialYearsCount >= 3, `Institutional academic years configured: ${initialYearsCount} sessions`);

  const currentYear = dataStore.academicYears.find((y) => y.is_current);
  assert(currentYear !== undefined, `Current active academic session identified: ${currentYear?.name}`);

  // Add new academic session
  const newSessionName = `2029-2030`;
  const addedSession = dataStore.addAcademicYear(newSessionName, '2029-04-01', '2030-03-31', false);
  assert(addedSession.name === newSessionName, `New academic session '${newSessionName}' created successfully`);
  assert(dataStore.academicYears.some((y) => y.name === newSessionName), 'New session persisted in institutional academic registry');

  // Transition active academic session
  const transitionSuccess = dataStore.setCurrentAcademicYear(newSessionName);
  assert(transitionSuccess === true, `Successfully transitioned active session to ${newSessionName}`);
  const updatedActive = dataStore.academicYears.find((y) => y.is_current);
  assert(updatedActive?.name === newSessionName, `Active session verified as ${newSessionName}`);

  // Revert active session back to 2026-2027
  dataStore.setCurrentAcademicYear('2026-2027');
  assert(dataStore.academicYears.find((y) => y.is_current)?.name === '2026-2027', 'Active session restored to 2026-2027');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Student Promotion Eligibility & Bulk Promotion
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Student Promotion Eligibility & Bulk Promotion ---');

  const testStudent = dataStore.students[0];
  const eligibility = dataStore.getStudentPromotionEligibility(testStudent.id, 75);
  assert(typeof eligibility.attendanceRate === 'number', `Calculated student compliance rate: ${eligibility.attendanceRate}%`);
  assert(eligibility.isEligible === true, 'Student with >=75% compliance validated as ELIGIBLE for promotion');

  // Check initial enrollments
  const initialEnrollmentsCount = dataStore.classEnrollments.length;
  assert(initialEnrollmentsCount >= 1, `Class enrollment ledger initialized with ${initialEnrollmentsCount} historical records`);

  // Ensure there are students in source class for test
  const sourceClass = 'Grade 10';
  const targetClass = 'Grade 11';
  const targetYear = '2027-2028';
  const eligibleStudents = dataStore.students.filter((s) => s.class_name === sourceClass);
  assert(eligibleStudents.length > 0, `Found ${eligibleStudents.length} students in ${sourceClass} ready for promotion`);

  const studentToPromote = eligibleStudents[0];
  const priorClassId = studentToPromote.class_name;

  // Execute bulk promotion batch
  const promoResult = await dataStore.promoteStudentsBatch({
    sourceClass,
    targetClass,
    targetYear,
    studentIds: [studentToPromote.id],
    targetDivision: 'A'
  });

  assert(promoResult.promoted_count === 1, `Successfully promoted ${promoResult.promoted_count} student to ${targetClass}`);
  assert(promoResult.skipped_duplicates === 0, 'Zero duplicate promotions on initial batch');

  // Verify student profile updated
  const updatedStudent = dataStore.students.find((s) => s.id === studentToPromote.id);
  assert(updatedStudent?.class_name === targetClass, `Student updated to target class: ${updatedStudent?.class_name}`);

  // Verify prior enrollment was preserved with is_active = false
  const archivedEnrollment = dataStore.classEnrollments.find(
    (e) => e.student_id === studentToPromote.id && e.class_name === priorClassId && !e.is_active
  );
  assert(archivedEnrollment !== undefined, 'Prior academic session enrollment preserved as archived (is_active: false)');

  // Verify new active enrollment exists
  const activeEnrollment = dataStore.classEnrollments.find(
    (e) => e.student_id === studentToPromote.id && e.class_name === targetClass && e.is_active
  );
  assert(activeEnrollment !== undefined, `New active enrollment created in ${targetClass} for session ${targetYear}`);

  // Test duplicate promotion prevention: re-attempting promotion of same student into same target year
  const duplicatePromoResult = await dataStore.promoteStudentsBatch({
    sourceClass: targetClass,
    targetClass: 'Grade 12',
    targetYear,
    studentIds: [studentToPromote.id]
  });

  assert(duplicatePromoResult.skipped_duplicates === 1, 'Duplicate promotion prevented for student already enrolled in target year');
  assert(duplicatePromoResult.promoted_count === 0, 'Zero students promoted when duplicate detected');

  // --------------------------------------------------------------------------
  // TEST SUITE 3: General Campus Visitor Registration & Badging
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing General Campus Visitor Registration & Badges ---');

  const initialVisitorsCount = dataStore.schoolVisitors.length;
  assert(initialVisitorsCount >= 2, `Campus visitor register loaded with ${initialVisitorsCount} records`);

  // Register a new visitor
  const newVisitor = dataStore.registerSchoolVisitor({
    full_name: 'Suresh Nambiar',
    phone_number: '+919844556677',
    email: 'suresh.n@cisco.com',
    purpose: 'VENDOR_DELIVERY',
    whom_to_meet: 'IT & Server Lab',
    id_proof_type: 'Corporate Badge',
    id_proof_number: 'CISCO-EMP-9912',
    remarks: 'Delivering biometric replacement sensor optical prism'
  });

  assert(newVisitor.status === 'CHECKED_IN', 'New campus visitor status marked as CHECKED_IN');
  assert(newVisitor.badge_number.startsWith('BADGE-V-'), `Automated badge number assigned: ${newVisitor.badge_number}`);
  assert(dataStore.schoolVisitors.some((v) => v.id === newVisitor.id), 'Visitor record registered in institutional visitor ledger');

  // Check out visitor
  const checkoutSuccess = dataStore.checkOutSchoolVisitor(newVisitor.id);
  assert(checkoutSuccess === true, 'Visitor successfully checked out');
  const checkedOutVisitor = dataStore.schoolVisitors.find((v) => v.id === newVisitor.id);
  assert(checkedOutVisitor?.status === 'CHECKED_OUT', 'Visitor status updated to CHECKED_OUT');
  assert(typeof checkedOutVisitor?.check_out_time === 'string', `Recorded visitor exit timestamp: ${checkedOutVisitor?.check_out_time}`);

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Pre-Authorized Pickup Whitelist Management
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Pre-Authorized Pickup Whitelist Management ---');

  const newAuth = dataStore.addPickupAuthorization({
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: testStudent.id,
    guardian_id: '99999999-9999-9999-9999-999999999901',
    authorized_person_name: 'Dinesh Shah (Uncle)',
    authorized_person_phone: '+919866778899',
    relationship_to_child: 'UNCLE',
    id_proof_number: 'Aadhaar XXXX-7766',
    valid_from: '2026-11-01',
    valid_until: '2027-03-31',
    is_active: true
  });

  assert(newAuth.is_active === true, 'Pre-authorized pickup person created with active clearance');
  const studentAuths = dataStore.getAuthorizedPickupsForStudent(testStudent.id);
  assert(studentAuths.some((a) => a.id === newAuth.id), 'Authorized person registered in student whitelist');

  // Revoke authorization
  dataStore.revokePickupAuthorization(newAuth.id);
  const revoked = dataStore.pickupAuthorizations.find((a) => a.id === newAuth.id);
  assert(revoked?.is_active === false, 'Pickup authorization successfully revoked by guardian');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Student Pickup Authorization, OTP & Gate Pass Issuance
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Student Pickup Authorization, OTP & Gate Pass ---');

  const guardian = testStudent.guardians?.[0];
  const guardianPhone = guardian?.phone_number || '+919811122233';

  // Request Pickup OTP for authorized guardian
  const { pickup, otp } = dataStore.requestPickupOtp({
    student_id: testStudent.id,
    visitor_name: guardian?.full_name || 'Vikram Mehta',
    visitor_phone: guardianPhone,
    relationship: guardian?.relationship || 'FATHER',
    pickup_reason: 'Medical checkup appointment'
  });

  assert(pickup.status === 'PENDING_VERIFICATION', 'Pickup record created with PENDING_VERIFICATION status');
  assert(otp.length === 6, `Generated secure 6-digit OTP challenge: ${otp}`);
  assert(dataStore.notifications.some((n) => n.recipient_phone === guardianPhone), 'WhatsApp notification queued to student primary guardian');

  // Test invalid OTP rejection
  const invalidResult = dataStore.verifyPickupOtp(pickup.id, '000000');
  assert(invalidResult.success === false, 'Invalid OTP challenge correctly rejected');
  assert(invalidResult.message.includes('Invalid OTP'), 'Rejection message warns of invalid OTP code');

  // Test valid OTP verification & gate pass generation
  const validResult = dataStore.verifyPickupOtp(pickup.id, otp);
  assert(validResult.success === true, 'Valid OTP challenge verified successfully');
  assert(typeof validResult.gatePassNumber === 'string', `Digital Gate Pass issued: ${validResult.gatePassNumber}`);

  const verifiedPickup = dataStore.visitorPickups.find((p) => p.id === pickup.id);
  assert(verifiedPickup?.status === 'AUTHORIZED_CHECKOUT', 'Pickup record transitioned to AUTHORIZED_CHECKOUT');
  assert(verifiedPickup?.otp_verified === true, 'OTP verified flag confirmed');
  assert(typeof verifiedPickup?.checkout_time === 'string', `Recorded exit timestamp: ${verifiedPickup?.checkout_time}`);

  // Test unauthorized pickup blocking
  const blockedPickup = dataStore.blockUnauthorizedPickup({
    student_id: testStudent.id,
    visitor_name: 'Unverified Stranger',
    visitor_phone: '+919000000000',
    relationship: 'STRANGER',
    reason: 'Suspicious pickup attempt without prior authorization'
  });

  assert(blockedPickup.status === 'UNAUTHORIZED_BLOCKED', 'Unauthorized pickup flagged as UNAUTHORIZED_BLOCKED');
  assert(dataStore.auditLogs.some((l) => l.action === 'UNAUTHORIZED_STUDENT_PICKUP_BLOCKED'), 'Security incident logged to immutable audit ledger');

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   Sprint 3 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint3Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

