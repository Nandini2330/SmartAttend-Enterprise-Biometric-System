import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

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

async function main() {
  console.log('🚀 Registering Nandini mane to Supabase PostgreSQL...');

  const studentId = randomUUID();
  const guardianId = randomUUID();
  const schoolId = '11111111-1111-1111-1111-111111111111';
  const classId = '33333333-3333-3333-3333-333333333310'; // Grade 10
  const divisionId = '44444444-4444-4444-4444-444444444411'; // Section A
  const academicYearId = '22222222-2222-2222-2222-222222222222';

  // 1. Insert Guardian first
  const { data: gData, error: gErr } = await supabase
    .from('guardians')
    .insert({
      id: guardianId,
      school_id: schoolId,
      full_name: 'jayshree',
      relationship: 'MOTHER',
      phone_number: '+918767024424',
      whatsapp_opt_in: true
    })
    .select()
    .single();

  if (gErr) {
    console.warn('Guardian insert notice:', gErr.message);
  } else {
    console.log('✔ Guardian registered:', gData.full_name, `(${gData.id})`);
  }

  // 2. Insert Student
  const { data: sData, error: sErr } = await supabase
    .from('students')
    .insert({
      id: studentId,
      school_id: schoolId,
      admission_number: '2026-1',
      first_name: 'Nandini',
      last_name: 'mane',
      gender: 'FEMALE',
      date_of_birth: '2011-05-15',
      class_id: classId,
      division_id: divisionId,
      roll_number: '23',
      academic_year_id: academicYearId,
      is_active: true,
      face_enrolled: false,
      fingerprint_enrolled: false,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    })
    .select()
    .single();

  if (sErr) {
    console.error('❌ Failed to insert student:', sErr.message);
    process.exit(1);
  }

  console.log('✔ Student registered:', `${sData.first_name} ${sData.last_name}`, `(Admission: ${sData.admission_number})`);

  // 3. Link Student and Guardian
  const { error: linkErr } = await supabase
    .from('student_guardians')
    .insert({
      student_id: sData.id,
      guardian_id: guardianId,
      is_primary_contact: true
    });

  if (linkErr) {
    console.warn('Student-Guardian link notice:', linkErr.message);
  } else {
    console.log('✔ Student-Guardian relationship linked!');
  }

  // 4. Verify in students table
  const { data: allStudents, count } = await supabase
    .from('students')
    .select('id, admission_number, first_name, last_name, roll_number', { count: 'exact' });

  console.log(`\n🎉 Success! Total students in Supabase PostgreSQL: ${count}`);
  console.log(allStudents);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

