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

async function runSprint2Verification() {
  console.log('===============================================================');
  console.log('   SmartAttend Enterprise - Sprint 2 Verification Suite');
  console.log('   Feature 1: Period-Wise & Subject Attendance Engine');
  console.log('   Feature 2: Timetable Management & Conflict Detection');
  console.log('   Feature 4: School Calendar, Holidays & Absence Exclusion');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Timetable Conflict Detection Engine
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Timetable Management & Conflict Detection ---');

  assert(dataStore.timetable.length >= 10, `Timetable initialized with ${dataStore.timetable.length} standard period slots`);

  // Monday Period 1 has: Math with Mr. Rajesh Kumar in Room 101 for Grade 10 - A
  // Test A: Attempt to double-book Teacher Mr. Rajesh Kumar on Monday Period 1 for Grade 9 - A
  const teacherConflict = dataStore.detectTimetableConflicts({
    day: 'Monday',
    period: 1,
    teacher: 'Mr. Rajesh Kumar',
    room: 'Room 205',
    class_name: 'Grade 9',
    division_name: 'A'
  });

  assert(teacherConflict !== null, 'Teacher double-booking detected by conflict engine');
  assert(teacherConflict?.conflict_type === 'TEACHER_DOUBLE_BOOKED', 'Conflict type identified as TEACHER_DOUBLE_BOOKED');
  assert(teacherConflict?.message.includes('Mr. Rajesh Kumar') === true, 'Conflict message references conflicting teacher');

  // Test B: Attempt to double-book Room 101 on Monday Period 1 by Ms. Priya Sharma
  const roomConflict = dataStore.detectTimetableConflicts({
    day: 'Monday',
    period: 1,
    teacher: 'Ms. Priya Sharma',
    room: 'Room 101',
    class_name: 'Grade 9',
    division_name: 'A'
  });

  assert(roomConflict !== null, 'Classroom double-booking detected by conflict engine');
  assert(roomConflict?.conflict_type === 'ROOM_DOUBLE_BOOKED', 'Conflict type identified as ROOM_DOUBLE_BOOKED');

  // Test C: Attempt to schedule a second subject for Grade 10 - A on Monday Period 1
  const classConflict = dataStore.detectTimetableConflicts({
    day: 'Monday',
    period: 1,
    teacher: 'Ms. Sunita Rao',
    room: 'Room 205',
    class_name: 'Grade 10',
    division_name: 'A'
  });

  assert(classConflict !== null, 'Class period overlap detected by conflict engine');
  assert(classConflict?.conflict_type === 'CLASS_OVERLAP', 'Conflict type identified as CLASS_OVERLAP');

  // Test D: Schedule a valid, non-conflicting slot (Monday Period 7)
  const validSlotResult = dataStore.addTimetableSlot({
    day: 'Monday',
    period: 7,
    subject: 'Physical Education & Yoga',
    teacher: 'Coach Virender Singh',
    room: 'Sports Complex',
    timeRange: '14:00 - 14:45',
    class_name: 'Grade 10',
    division_name: 'A'
  });

  assert(validSlotResult.success === true, 'Valid non-conflicting timetable slot scheduled successfully');
  assert(validSlotResult.slot?.subject === 'Physical Education & Yoga', 'Slot details persisted in institutional timetable');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Period-Wise & Subject Attendance
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Period-Wise & Subject Attendance Tracking ---');

  const testStudent = dataStore.students[0];
  const date1 = '2026-11-02';
  const date2 = '2026-11-03';
  const date3 = '2026-11-04';

  // Record 3 physics lectures
  dataStore.recordPeriodAttendanceBatch([
    { student_id: testStudent.id, subject: 'Physics', period: 2, date: date1, status: 'PRESENT' },
    { student_id: testStudent.id, subject: 'Physics', period: 2, date: date2, status: 'PRESENT' },
    { student_id: testStudent.id, subject: 'Physics', period: 2, date: date3, status: 'ABSENT' }
  ]);

  const subjectSummary = dataStore.getSubjectAttendanceSummary(testStudent.id);
  const physStats = subjectSummary['Physics'];

  assert(physStats !== undefined, 'Physics lecture attendance summary computed');
  assert(physStats.total >= 3, `Total Physics lectures registered: ${physStats.total}`);
  assert(physStats.attended >= 2, `Attended Physics lectures registered: ${physStats.attended}`);
  assert(typeof physStats.percentage === 'number', `Calculated subject attendance rate: ${physStats.percentage}%`);

  // --------------------------------------------------------------------------
  // TEST SUITE 3: School Calendar & Automatic Holiday Exclusion
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing School Calendar & Attendance Exclusion ---');

  assert(dataStore.calendarEvents.length >= 4, `School calendar populated with ${dataStore.calendarEvents.length} events`);

  // Verify Diwali (2026-11-10) is excluded from attendance calculation
  assert(dataStore.isDateExcludedFromAttendance('2026-11-10') === true, 'Diwali (2026-11-10) correctly recognized as non-instructional holiday');

  // Verify Winter Vacation (2026-12-25) is excluded
  assert(dataStore.isDateExcludedFromAttendance('2026-12-25') === true, 'Christmas/Winter Vacation date recognized as excluded from attendance');

  // Regular instructional working day (2026-11-04) is NOT excluded
  assert(dataStore.isDateExcludedFromAttendance('2026-11-04') === false, 'Standard instructional day (2026-11-04) recognized as attendance-active');

  // Add new examination window
  const examEvent = dataStore.addCalendarEvent({
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    event_type: 'EXAMINATION',
    title: 'Pre-Board Practicals',
    start_date: '2027-01-15',
    end_date: '2027-01-20',
    description: 'Practical evaluations for science lab subjects',
    is_instructional_day: true
  });

  assert(dataStore.calendarEvents.some((e) => e.title === 'Pre-Board Practicals'), 'Newly scheduled examination window added to institutional calendar');

  // Delete calendar event
  dataStore.deleteCalendarEvent(examEvent.id);
  assert(!dataStore.calendarEvents.some((e) => e.id === examEvent.id), 'Calendar event successfully deleted');

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   Sprint 2 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint2Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
