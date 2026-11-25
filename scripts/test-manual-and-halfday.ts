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
const supabase = createClient(
  env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function testManualAndHalfDay() {
  console.log('⚡ Testing Manual Attendance & Half-Day Ingestion in Supabase...');
  const todayStr = new Date().toISOString().split('T')[0];
  const schoolId = '11111111-1111-1111-1111-111111111111';
  const sessionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  // Find Nandini mane in Supabase
  const { data: students, error: stdErr } = await supabase
    .from('students')
    .select('*')
    .eq('admission_number', '2026-1')
    .single();

  if (stdErr || !students) {
    console.error('Nandini not found in database:', stdErr);
    process.exit(1);
  }

  console.log(`Found student: ${students.first_name} ${students.last_name} (${students.id})`);

  // 1. Test Manual Attendance Entry (HALF_DAY)
  const { data: halfDayRow, error: hdErr } = await supabase
    .from('daily_attendance')
    .upsert({
      school_id: schoolId,
      student_id: students.id,
      attendance_date: todayStr,
      session_id: sessionId,
      status: 'HALF_DAY',
      first_arrival_time: '08:22:00',
      departure_time: '12:15:00',
      first_verification_method: 'MANUAL',
      is_late: false,
      minutes_late: 0,
      remarks: 'Half Day logged (Early dismissal at 12:15:00) - Doctor appointment certificate approved'
    }, { onConflict: 'student_id,attendance_date,session_id' })
    .select()
    .single();

  if (hdErr) {
    console.error('❌ Failed to upsert half-day manual record:', hdErr.message);
    process.exit(1);
  }

  console.log('✔ PASS: Successfully persisted HALF_DAY record to Supabase!');
  console.log(`   👉 ID: ${halfDayRow.id}`);
  console.log(`   👉 Status: ${halfDayRow.status}`);
  console.log(`   👉 Arrival: ${halfDayRow.first_arrival_time}, Departure: ${halfDayRow.departure_time}`);
  console.log(`   👉 Method: ${halfDayRow.first_verification_method}`);
  console.log(`   👉 Remarks: ${halfDayRow.remarks}`);

  // 2. Select query test
  const { data: verifyRow } = await supabase
    .from('daily_attendance')
    .select('*, student:students(first_name, last_name, admission_number)')
    .eq('id', halfDayRow.id)
    .single();

  console.log(`\n🎉 Supabase Verified Record:`);
  console.log(`   Student: ${(verifyRow as any).student.first_name} ${(verifyRow as any).student.last_name}`);
  console.log(`   Date: ${verifyRow?.attendance_date}`);
  console.log(`   Status: ${verifyRow?.status}`);
}

testManualAndHalfDay().catch(console.error);

