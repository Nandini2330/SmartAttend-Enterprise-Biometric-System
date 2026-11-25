import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envContent = fs.readFileSync('apps/web/.env.local', 'utf-8');
let url = '', key = '';
for (const line of envContent.split('\n')) {
  if (line.includes('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g, '');
  if (line.includes('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g, '');
}

const supabase = createClient(url, key);

async function checkSprint2Tables() {
  console.log('Checking Supabase tables for Sprint 2...');
  
  const tables = ['timetables', 'period_attendance', 'calendar_events', 'school_holidays'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`- Table '${t}': NOT FOUND or ERROR: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`- Table '${t}': READY (found ${data?.length} sample rows)`);
    }
  }
}

checkSprint2Tables();

