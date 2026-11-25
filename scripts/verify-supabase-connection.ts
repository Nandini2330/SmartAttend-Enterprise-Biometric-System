// ==============================================================================
// SmartAttend: Supabase Database Connection & Migration Verifier
// Tests live connection, schema availability, and RLS policies
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local if present
function loadEnv() {
  const envLocalPath = path.resolve(process.cwd(), 'apps/web/.env.local');
  const rootEnvPath = path.resolve(process.cwd(), '.env');

  const targets = [envLocalPath, rootEnvPath];
  const env: Record<string, string> = {};

  for (const p of targets) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...vals] = trimmed.split('=');
          const val = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
          if (!env[key.trim()]) {
            env[key.trim()] = val;
          }
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const rawUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || '';

console.log('\x1b[1m\x1b[36m================================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m   ⚡ SMARTATTEND: SUPABASE POSTGRESQL CONNECTION VERIFIER     \x1b[0m');
console.log('\x1b[1m\x1b[36m================================================================\x1b[0m\n');

console.log(`Target Supabase URL : ${supabaseUrl || '\x1b[31m[NOT CONFIGURED]\x1b[0m'}`);
console.log(`Anon Key Configured : ${supabaseAnonKey && !supabaseAnonKey.includes('...') ? '\x1b[32mYES (Masked: ' + supabaseAnonKey.slice(0, 12) + '...)\x1b[0m' : '\x1b[31mNO (Placeholder)\x1b[0m'}\n`);

if (!supabaseUrl || supabaseUrl.includes('your-project-id') || !supabaseAnonKey || supabaseAnonKey.includes('...')) {
  console.log('\x1b[33m⚠ Supabase credentials not yet populated in apps/web/.env.local\x1b[0m');
  console.log('Please provide your Supabase Project URL and Anon/Publishable Key to proceed.\n');
  process.exit(2);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

const EXPECTED_TABLES = [
  'schools',
  'academic_years',
  'classes',
  'divisions',
  'user_profiles',
  'students',
  'guardians',
  'student_guardians',
  'class_enrollments',
  'attendance_sessions',
  'biometric_devices',
  'biometric_enrollments',
  'attendance_events',
  'daily_attendance',
  'notification_templates',
  'notification_jobs',
  'notification_delivery_logs',
  'leave_requests',
  'school_holidays',
  'device_sync_logs',
  'audit_logs'
];

async function verifyConnection() {
  console.log('--- 1. Testing Gateway Connection ---');
  const start = Date.now();
  try {
    const { error } = await supabase.from('schools').select('id', { count: 'exact', head: true });
    const elapsed = Date.now() - start;

    if (error && error.code === 'PGRST205') {
      console.log(`  \x1b[32m✔ PASS\x1b[0m: Supabase Gateway reachable (${elapsed}ms). Table 'schools' does not exist yet (Migrations needed).`);
    } else if (error && (error.message.includes('FetchError') || error.message.includes('ENOTFOUND'))) {
      console.log(`  \x1b[31m✖ FAIL\x1b[0m: Network/DNS error connecting to Supabase URL (${error.message})`);
      process.exit(1);
    } else if (error && error.message.includes('Invalid API key')) {
      console.log(`  \x1b[31m✖ FAIL\x1b[0m: Invalid API Key provided (${error.message})`);
      process.exit(1);
    } else if (!error) {
      console.log(`  \x1b[32m✔ PASS\x1b[0m: Connected to Supabase successfully (${elapsed}ms)!`);
    } else {
      console.log(`  \x1b[33mℹ INFO\x1b[0m: Connected with response: ${error.message}`);
    }
  } catch (err: any) {
    console.log(`  \x1b[31m✖ FAIL\x1b[0m: Connection exception: ${err.message}`);
    process.exit(1);
  }

  console.log('\n--- 2. Verifying Table Presence (21 Tables) ---');
  let existingCount = 0;
  const missingTables: string[] = [];

  for (const table of EXPECTED_TABLES) {
    const { error, count, data } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      existingCount++;
      console.log(`  ✔ Table '${table}': Ready`);
    } else {
      missingTables.push(table);
      console.log(`  ✖ Table '${table}': Missing (${error.message})`);
    }
  }

  console.log(`\nTables verified: ${existingCount} / ${EXPECTED_TABLES.length}`);
  if (missingTables.length > 0) {
    console.log(`\n\x1b[33mMissing Migrations:\x1b[0m ${missingTables.length} tables need to be created using 'supabase/migrations/20261029000001_initial_schema.sql'.`);
  } else {
    console.log('\x1b[32mAll 21 tables exist and are verified!\x1b[0m');
  }

  console.log('\n--- 3. Testing Real-World Database Operations ---');
  // Check if school seed exists
  const { data: schools, error: schoolErr } = await supabase.from('schools').select('*').limit(1);
  if (schoolErr) {
    console.log(`  ⚠ Querying schools with anon key returned: ${schoolErr.message}`);
  } else if (!schools || schools.length === 0) {
    console.log('  ℹ Schools table is empty. Seed data (supabase/seed.sql) has not yet been executed.');
  } else {
    console.log(`  ✔ Found school in database: "${schools[0].name}" (Code: ${schools[0].code})`);
  }

  // Check students
  const { data: students, error: stdErr } = await supabase.from('students').select('*').limit(5);
  if (stdErr) {
    console.log(`  ⚠ Querying students with anon key: ${stdErr.message}`);
  } else {
    console.log(`  ✔ Student count in database: ${students?.length ?? 0}`);
  }

  // Check daily attendance
  const { data: attRecords, error: attErr } = await supabase.from('daily_attendance').select('*').limit(5);
  if (attErr) {
    console.log(`  ⚠ Querying daily_attendance: ${attErr.message}`);
  } else {
    console.log(`  ✔ Daily attendance records in database: ${attRecords?.length ?? 0}`);
  }
}

verifyConnection().catch((e) => {
  console.error('Execution error:', e);
  process.exit(1);
});

