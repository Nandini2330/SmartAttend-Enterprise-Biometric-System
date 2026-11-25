// ==============================================================================
// SmartAttend: Comprehensive Parent Privacy & Authorization Verification Suite
// Tests Database Verification, Backend API IDOR Protection, and Multi-Parent Privacy
// ==============================================================================

import assert from 'assert';
import http from 'http';
import express from 'express';
import { parentPortalRouter, DB_GUARDIANS, DB_STUDENTS, DB_STUDENT_GUARDIANS } from '../services/device-bridge/dist/routes/parent_portal.js';

console.log('\x1b[1m\x1b[36m================================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m   🛡️ SMARTATTEND: PARENT PRIVACY & AUTHORIZATION TEST SUITE   \x1b[0m');
console.log('\x1b[1m\x1b[36m================================================================\x1b[0m\n');

// 1. Setup in-memory Express server with parentPortalRouter on dynamic port
const app = express();
app.use(express.json());
app.use('/api/v1/parent', parentPortalRouter);

const server = http.createServer(app);

async function startServer() {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve(port);
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => server.close(resolve));
}

async function makeRequest(port, path, options = {}) {
  const url = `http://127.0.0.1:${port}${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  const port = await startServer();
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\x1b[1m--- 1. DATABASE & RELATIONSHIP VERIFICATION ---\x1b[0m');

  test('Parent Vikram Mehta is mapped to child Aarav Mehta (DPS-2026-1001)', () => {
    const guardian = DB_GUARDIANS.find((g) => g.email === 'vikram.mehta@gmail.com');
    assert(guardian, 'Guardian Vikram Mehta must exist in database');
    const link = DB_STUDENT_GUARDIANS.find((l) => l.guardian_id === guardian.id);
    assert(link, 'Link between Vikram and student must exist');
    const student = DB_STUDENTS.find((s) => s.id === link.student_id);
    assert.strictEqual(student.first_name, 'Aarav');
    assert.strictEqual(student.last_name, 'Mehta');
    assert.strictEqual(student.admission_number, 'DPS-2026-1001');
  });

  test('Parent Sunita Kapoor is mapped to child Ananya Kapoor (DPS-2026-1002)', () => {
    const guardian = DB_GUARDIANS.find((g) => g.email === 'sunita.kapoor@gmail.com');
    assert(guardian, 'Guardian Sunita Kapoor must exist');
    const link = DB_STUDENT_GUARDIANS.find((l) => l.guardian_id === guardian.id);
    assert(link, 'Link between Sunita and student must exist');
    const student = DB_STUDENTS.find((s) => s.id === link.student_id);
    assert.strictEqual(student.first_name, 'Ananya');
    assert.strictEqual(student.last_name, 'Kapoor');
  });

  test('Parent Anil Verma is mapped to child Rohan Verma (DPS-2026-1003)', () => {
    const guardian = DB_GUARDIANS.find((g) => g.email === 'anil.verma@gmail.com');
    assert(guardian);
    const link = DB_STUDENT_GUARDIANS.find((l) => l.guardian_id === guardian.id);
    const student = DB_STUDENTS.find((s) => s.id === link.student_id);
    assert.strictEqual(student.first_name, 'Rohan');
    assert.strictEqual(student.last_name, 'Verma');
  });

  test('Parent Pooja Gupta is mapped to child Ishaan Gupta (DPS-2026-1004)', () => {
    const guardian = DB_GUARDIANS.find((g) => g.email === 'pooja.gupta@gmail.com');
    assert(guardian);
    const link = DB_STUDENT_GUARDIANS.find((l) => l.guardian_id === guardian.id);
    const student = DB_STUDENTS.find((s) => s.id === link.student_id);
    assert.strictEqual(student.first_name, 'Ishaan');
    assert.strictEqual(student.last_name, 'Gupta');
  });

  console.log('\n\x1b[1m--- 2. BACKEND API LEVEL AUTHORIZATION & IDOR PROTECTION ---\x1b[0m');

  await asyncTest('GET /api/v1/parent/students returns ONLY Vikram Mehta\'s child', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/students', {
      headers: { 'x-parent-email': 'vikram.mehta@gmail.com' }
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.children.length, 1);
    assert.strictEqual(data.children[0].first_name, 'Aarav');
  });

  await asyncTest('GET /api/v1/parent/students returns ONLY Sunita Kapoor\'s child', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/students', {
      headers: { 'x-parent-email': 'sunita.kapoor@gmail.com' }
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.children.length, 1);
    assert.strictEqual(data.children[0].first_name, 'Ananya');
  });

  await asyncTest('Authorized query: Vikram Mehta gets attendance for Aarav Mehta (HTTP 200)', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/attendance?student_id=88888888-8888-8888-8888-888888888801', {
      headers: { 'x-parent-email': 'vikram.mehta@gmail.com' }
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.privacy_enforced, true);
    assert(data.records.length > 0);
    data.records.forEach((r) => {
      assert.strictEqual(r.student_id, '88888888-8888-8888-8888-888888888801');
    });
  });

  await asyncTest('TAMPER ATTACK: Vikram Mehta manually changes student_id to Ananya Kapoor -> HTTP 403 FORBIDDEN', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/attendance?student_id=88888888-8888-8888-8888-888888888802', {
      headers: { 'x-parent-email': 'vikram.mehta@gmail.com' }
    });
    assert.strictEqual(status, 403, `Expected HTTP 403 Forbidden, got ${status}`);
    assert.strictEqual(data.code, 'UNAUTHORIZED_STUDENT_ACCESS');
    assert(data.message.includes('Security Authorization Failed'));
    assert.strictEqual(data.records, undefined, 'Zero records must be leaked');
  });

  await asyncTest('TAMPER ATTACK: Sunita Kapoor queries Aarav Mehta\'s reports -> HTTP 403 FORBIDDEN', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/reports?student_id=88888888-8888-8888-8888-888888888801', {
      headers: { 'x-parent-email': 'sunita.kapoor@gmail.com' }
    });
    assert.strictEqual(status, 403);
    assert.strictEqual(data.code, 'UNAUTHORIZED_STUDENT_ACCESS');
  });

  await asyncTest('TAMPER ATTACK: Anil Verma queries Ishaan Gupta\'s attendance -> HTTP 403 FORBIDDEN', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/attendance?student_id=88888888-8888-8888-8888-888888888804', {
      headers: { 'x-parent-email': 'anil.verma@gmail.com' }
    });
    assert.strictEqual(status, 403);
    assert.strictEqual(data.code, 'UNAUTHORIZED_STUDENT_ACCESS');
  });

  await asyncTest('TAMPER ATTACK: Parent applies leave for another student -> HTTP 403 FORBIDDEN', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-parent-email': 'vikram.mehta@gmail.com'
      },
      body: JSON.stringify({
        student_id: '88888888-8888-8888-8888-888888888802', // Ananya
        start_date: '2026-11-05',
        end_date: '2026-11-06',
        reason: 'Unauthorized leave request attempt'
      })
    });
    assert.strictEqual(status, 403);
    assert.strictEqual(data.code, 'UNAUTHORIZED_STUDENT_ACCESS');
  });

  console.log('\n\x1b[1m--- 3. MULTI-PARENT ATTENDANCE PERCENTAGE VERIFICATION ---\x1b[0m');

  await asyncTest('Vikram Mehta reports: Aarav Mehta has verified attendance percentage (96%)', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/reports', {
      headers: { 'x-parent-email': 'vikram.mehta@gmail.com' }
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.student.name, 'Aarav Mehta');
    assert.strictEqual(data.metrics.attendance_percentage, 96);
    assert.strictEqual(data.privacy_enforced, true);
  });

  await asyncTest('Sunita Kapoor reports: Ananya Kapoor has verified attendance percentage (92%)', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/reports', {
      headers: { 'x-parent-email': 'sunita.kapoor@gmail.com' }
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.student.name, 'Ananya Kapoor');
    assert.strictEqual(data.metrics.attendance_percentage, 92);
  });

  await asyncTest('Anil Verma reports: Rohan Verma has verified attendance percentage (100%)', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/reports', {
      headers: { 'x-parent-email': 'anil.verma@gmail.com' }
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.student.name, 'Rohan Verma');
    assert.strictEqual(data.metrics.attendance_percentage, 100);
  });

  await asyncTest('POST /api/v1/parent/security-test endpoint blocks cross-student probe', async () => {
    const { status, data } = await makeRequest(port, '/api/v1/parent/security-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent_email: 'vikram.mehta@gmail.com',
        target_student_id: '88888888-8888-8888-8888-888888888802'
      })
    });
    assert.strictEqual(status, 403);
    assert.strictEqual(data.test_result, 'BLOCKED_AS_EXPECTED');
    assert.strictEqual(data.privacy_intact, true);
  });

  await stopServer();

  console.log('\n\x1b[1m\x1b[36m================================================================\x1b[0m');
  console.log(`\x1b[1mSummary: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m out of ${passed + failed} Tests`);
  console.log('\x1b[1m\x1b[36m================================================================\x1b[0m\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

