import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envContent = fs.readFileSync('apps/web/.env.local', 'utf-8');
let url = '', key = '';
for (const line of envContent.split('\n')) {
  if (line.includes('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g, '');
  if (line.includes('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g, '');
}

const supabase = createClient(url, key);

async function inspectSprint3Data() {
  console.log('Inspecting Supabase data for Sprint 3...\n');

  // 1. Academic Years
  const { data: years, error: yErr } = await supabase.from('academic_years').select('*');
  console.log('Academic Years:', yErr ? yErr.message : years);

  // 2. Students
  const { data: students, error: sErr } = await supabase.from('students').select('id, first_name, last_name, admission_number, class_id, division_id, academic_year_id');
  console.log(`\nStudents (Total: ${students?.length}):`, sErr ? sErr.message : students);

  // 3. Class Enrollments
  const { data: enrollments, error: eErr } = await supabase.from('class_enrollments').select('*');
  console.log('\nClass Enrollments:', eErr ? eErr.message : enrollments);

  // 4. Classes & Divisions
  const { data: classes, error: cErr } = await supabase.from('classes').select('*');
  console.log('\nClasses:', cErr ? cErr.message : classes);

  const { data: divisions, error: dErr } = await supabase.from('divisions').select('*');
  console.log('\nDivisions:', dErr ? dErr.message : divisions);

  // Test insert into academic_years
  const { data: existingYears } = await supabase.from('academic_years').select('*').eq('name', '2027-2028');
  let insertedYear = existingYears?.[0];
  if (!insertedYear) {
    const testYear = {
      school_id: '11111111-1111-1111-1111-111111111111',
      name: '2027-2028',
      start_date: '2027-04-01',
      end_date: '2028-03-31',
      is_current: false
    };
    const res = await supabase.from('academic_years').insert(testYear).select();
    insertedYear = res.data?.[0];
    console.log('\nInserted Academic Year 2027-2028:', res.error ? res.error.message : insertedYear);
  } else {
    console.log('\nAcademic Year 2027-2028 already exists in Supabase:', insertedYear);
  }
}

inspectSprint3Data();
