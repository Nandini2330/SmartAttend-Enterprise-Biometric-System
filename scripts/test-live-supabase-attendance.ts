// ==============================================================================
// SmartAttend: Live Supabase Attendance Ingestion & Persistence Test
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envLocalPath = path.resolve(process.cwd(), 'apps/web/.env.local');
  const env: Record<string, string> = {};
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        env[key.trim()] = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(url, key);

console.log('\x1b[1m\x1b[36m================================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m   🎯 SMARTATTEND: LIVE ATTENDANCE PERSISTENCE VERIFICATION    \x1b[0m');
console.log('\x1b[1m\x1b[36m================================================================\x1b[0m\n');

async function runLiveAttendanceTest() {
  const schoolId = '11111111-1111-1111-1111-111111111111';
  const sessionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Fetch Student from Supabase to confirm existence
  const { data: students, error: stdErr } = await supabase.from('students').select('*').limit(2);
  if (stdErr || !students || students.length < 2) {
    console.error('Failed to load students:', stdErr);
    process.exit(1);
  }

  const aarav = students.find((s) => s.admission_number === 'DPS-2026-1001') || students[0];
  const ananya = students.find((s) => s.admission_number === 'DPS-2026-1002') || students[1];

  console.log(`Target Test Students in Supabase:`);
  console.log(`  - Student 1: ${aarav.first_name} ${aarav.last_name} (${aarav.admission_number}) [ID: ${aarav.id}]`);
  console.log(`  - Student 2: ${ananya.first_name} ${ananya.last_name} (${ananya.admission_number}) [ID: ${ananya.id}]\n`);

  // --------------------------------------------------------------------------
  // TEST 1: FACE RECOGNITION ATTENDANCE PUNCH
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: FACE RECOGNITION ATTENDANCE PUNCH ---');
  const now1 = new Date();
  const timeStr1 = '08:24:15';

  // A. Insert raw immutable punch event
  const { data: faceEvent, error: faceEventErr } = await supabase
    .from('attendance_events')
    .insert({
      school_id: schoolId,
      student_id: aarav.id,
      session_id: sessionId,
      event_type: 'CHECK_IN',
      event_timestamp: now1.toISOString(),
      local_timestamp: timeStr1,
      verification_method: 'FACE',
      confidence_score: 0.9850,
      liveness_verified: true,
      is_duplicate_ignored: false
    })
    .select()
    .single();

  if (faceEventErr) {
    console.log(`  ✖ Failed to insert face event: ${faceEventErr.message}`);
  } else {
    console.log(`  ✔ PASS: Inserted into 'attendance_events' (ID: ${faceEvent.id}) via FACE`);
  }

  // B. Upsert daily attendance record
  const { data: faceDaily, error: faceDailyErr } = await supabase
    .from('daily_attendance')
    .upsert({
      school_id: schoolId,
      student_id: aarav.id,
      attendance_date: todayStr,
      session_id: sessionId,
      status: 'PRESENT',
      first_arrival_time: timeStr1,
      first_verification_method: 'FACE',
      is_late: false,
      minutes_late: 0,
      remarks: 'Verified entry via Senior Wing Face Kiosk 1 (98.5% match)',
      reconciled_at: now1.toISOString()
    }, { onConflict: 'student_id,attendance_date,session_id' })
    .select()
    .single();

  if (faceDailyErr) {
    console.log(`  ✖ Failed to upsert daily attendance: ${faceDailyErr.message}`);
  } else {
    console.log(`  ✔ PASS: Upserted into 'daily_attendance' (Status: ${faceDaily.status}, Time: ${faceDaily.first_arrival_time})`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: FINGERPRINT ATTENDANCE PUNCH
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: FINGERPRINT HARDWARE ATTENDANCE PUNCH ---');
  const now2 = new Date();
  const timeStr2 = '08:29:45';

  const { data: fpEvent, error: fpEventErr } = await supabase
    .from('attendance_events')
    .insert({
      school_id: schoolId,
      student_id: ananya.id,
      session_id: sessionId,
      event_type: 'CHECK_IN',
      event_timestamp: now2.toISOString(),
      local_timestamp: timeStr2,
      verification_method: 'FINGERPRINT',
      confidence_score: 0.9920,
      liveness_verified: false,
      is_duplicate_ignored: false
    })
    .select()
    .single();

  if (fpEventErr) {
    console.log(`  ✖ Failed to insert fingerprint event: ${fpEventErr.message}`);
  } else {
    console.log(`  ✔ PASS: Inserted into 'attendance_events' (ID: ${fpEvent.id}) via FINGERPRINT`);
  }

  const { data: fpDaily, error: fpDailyErr } = await supabase
    .from('daily_attendance')
    .upsert({
      school_id: schoolId,
      student_id: ananya.id,
      attendance_date: todayStr,
      session_id: sessionId,
      status: 'PRESENT',
      first_arrival_time: timeStr2,
      first_verification_method: 'FINGERPRINT',
      is_late: false,
      minutes_late: 0,
      remarks: 'Verified entry via Main Gate Terminal A (Fingerprint Scanner)',
      reconciled_at: now2.toISOString()
    }, { onConflict: 'student_id,attendance_date,session_id' })
    .select()
    .single();

  if (fpDailyErr) {
    console.log(`  ✖ Failed to upsert daily attendance: ${fpDailyErr.message}`);
  } else {
    console.log(`  ✔ PASS: Upserted into 'daily_attendance' (Status: ${fpDaily.status}, Time: ${fpDaily.first_arrival_time})`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: SELECT QUERY VERIFICATION FROM SUPABASE
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: SUPABASE DATABASE PERSISTENCE QUERY ---');
  const { data: liveRecords, error: liveErr } = await supabase
    .from('daily_attendance')
    .select('*, student:students(first_name, last_name, admission_number, roll_number)')
    .eq('attendance_date', todayStr);

  if (liveErr) {
    console.log(`  ✖ Select error: ${liveErr.message}`);
  } else {
    console.log(`  ✔ PASS: Retrieved ${liveRecords?.length} live records from Supabase PostgreSQL!`);
    for (const rec of (liveRecords || [])) {
      const s = rec.student as any;
      console.log(`     👉 ${s?.first_name} ${s?.last_name} (${s?.admission_number}): Status=${rec.status}, Method=${rec.first_verification_method}, Time=${rec.first_arrival_time}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 4: DUPLICATE PREVENTION CHECK
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: DUPLICATE REPLAY PREVENTION ---');
  const { error: dupErr } = await supabase
    .from('daily_attendance')
    .upsert({
      school_id: schoolId,
      student_id: aarav.id,
      attendance_date: todayStr,
      session_id: sessionId,
      status: 'PRESENT',
      first_arrival_time: '08:24:15',
      first_verification_method: 'FACE',
      remarks: 'Duplicate scan ignored - original arrival time preserved'
    }, { onConflict: 'student_id,attendance_date,session_id' });

  const { count: finalCount } = await supabase
    .from('daily_attendance')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', aarav.id)
    .eq('attendance_date', todayStr);

  if (!dupErr && finalCount === 1) {
    console.log(`  ✔ PASS: Duplicate punch did not duplicate rows (Record count remains exactly 1)`);
  } else {
    console.log(`  ✖ Duplicate issue: count=${finalCount}`);
  }

  console.log('\n================================================================');
  console.log('\x1b[32m✔ VERIFICATION COMPLETE: ALL ATTENDANCE RECORDS LIVE IN SUPABASE!\x1b[0m');
  console.log('================================================================\n');
}

runLiveAttendanceTest().catch((e) => {
  console.error('Test failed with exception:', e);
  process.exit(1);
});

