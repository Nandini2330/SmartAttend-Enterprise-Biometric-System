// ==============================================================================
// SmartAttend: Real Browser-Based Sprint 1 Verification Runner
// Controls Google Chrome via Chrome DevTools Protocol (CDP) & Native WebSocket
// ==============================================================================

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve('chrome_sprint1_test_profile');
const SCREENSHOT_DIR_PROJECT = path.resolve('docs/screenshots');
const SCREENSHOT_DIR_BRAIN = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\c9308b30-2ca4-4f1c-a69c-1d26f4b27a1a\\browser_screenshots';

// Ensure screenshot directories exist
fs.mkdirSync(SCREENSHOT_DIR_PROJECT, { recursive: true });
fs.mkdirSync(SCREENSHOT_DIR_BRAIN, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// ------------------------------------------------------------------------------
// Chrome Controller via Native WebSocket & CDP
// ------------------------------------------------------------------------------
class ChromeController {
  constructor(port = 9222) {
    this.port = port;
    this.proc = null;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async launch(initialUrl = 'http://localhost:5173') {
    console.log(`[Browser] Launching Google Chrome on port ${this.port}...`);
    this.proc = spawn(CHROME_PATH, [
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      '--headless=new',
      '--disable-gpu',
      '--disable-extensions',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1400,900',
      initialUrl
    ]);

    // Wait for CDP endpoint to be ready
    let attempts = 0;
    while (attempts < 30) {
      await sleep(500);
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/list`);
        if (res.ok) {
          const targets = await res.json();
          const pageTarget = targets.find((t) => t.type === 'page');
          if (pageTarget && pageTarget.webSocketDebuggerUrl) {
            console.log(`[Browser] Found active page target: ${pageTarget.url}`);
            await this.connectToTarget(pageTarget.webSocketDebuggerUrl);
            return;
          }
        }
      } catch {
        attempts++;
      }
    }
    throw new Error('Chrome did not initialize CDP gateway within 15 seconds');
  }

  async connectToTarget(wsUrl) {
    this.ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id && this.callbacks.has(data.id)) {
        const cb = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        cb(data);
      }
    };

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, (res) => {
        if (res.error) reject(new Error(`${method} failed: ${res.error.message}`));
        else resolve(res.result);
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  async reload() {
    await this.send('Page.reload');
    await sleep(2500); // Wait for React app to re-mount
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');

    const projectPath = path.join(SCREENSHOT_DIR_PROJECT, filename);
    const brainPath = path.join(SCREENSHOT_DIR_BRAIN, filename);

    fs.writeFileSync(projectPath, buffer);
    fs.writeFileSync(brainPath, buffer);
    console.log(`  📸 Screenshot saved: ${filename} (${buffer.length} bytes)`);
    return brainPath;
  }

  async close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    if (this.proc) {
      console.log('[Browser] Terminating Google Chrome process...');
      this.proc.kill('SIGKILL');
      await sleep(1500);
      this.proc = null;
    }
  }

  async navigateToDevicesDashboard() {
    await this.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const devBtn = buttons.find(b => b.textContent && b.textContent.includes('Device Management'));
        if (devBtn) devBtn.click();
      })()
    `);
    await sleep(600);
    await this.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const queueBtn = buttons.find(b => b.textContent && b.textContent.includes('Offline Attendance Queue'));
        if (queueBtn) queueBtn.click();
      })()
    `);
    await sleep(600);
  }
}

// ------------------------------------------------------------------------------
// Load Supabase Client for DB Persistence Verification
// ------------------------------------------------------------------------------
function getSupabaseClient() {
  const envContent = fs.readFileSync('apps/web/.env.local', 'utf-8');
  let url = '';
  let key = '';
  for (const line of envContent.split('\n')) {
    if (line.includes('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g, '');
    if (line.includes('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g, '');
  }
  return createClient(url, key);
}

// ------------------------------------------------------------------------------
// Verification Execution
// ------------------------------------------------------------------------------
async function runRealBrowserVerification() {
  console.log('================================================================');
  console.log('   🌐 SMARTATTEND: REAL BROWSER SPRINT 1 VERIFICATION SUITE    ');
  console.log('   Chrome Engine, Real IndexedDB, Cloud Persist & Eviction Guard');
  console.log('================================================================\n');

  // Clean test profile before fresh test run
  try {
    fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
  } catch {}

  const supabase = getSupabaseClient();
  const browser = new ChromeController(9222);

  try {
    // --------------------------------------------------------------------------
    // PHASE 1: Launch Chrome & Navigate to App
    // --------------------------------------------------------------------------
    console.log('--- 1. Launching Real Chrome & Loading SmartAttend Web ---');
    await browser.launch('http://localhost:5173');
    await sleep(3000); // Allow Vite React hydration

    const pageTitle = await browser.evaluate('document.title');
    assert(pageTitle.includes('SmartAttend'), `Page title loaded: "${pageTitle}"`);

    const storageEngine = await browser.evaluate('window.offlineManager?.getStorageEngine()');
    assert(storageEngine === 'IndexedDB', `Active browser storage engine: ${storageEngine}`);

    await browser.navigateToDevicesDashboard();
    await browser.captureScreenshot('01_browser_initial_loaded.png');

    // --------------------------------------------------------------------------
    // PHASE 2: Offline Attendance Capture & Physical IndexedDB Write
    // --------------------------------------------------------------------------
    console.log('\n--- 2. Capturing Attendance Punches Offline in Real Browser ---');

    // Engage offline mode
    await browser.evaluate('window.offlineManager.setOnlineOverride(false)');
    const isOnline = await browser.evaluate('window.offlineManager.isOnline()');
    assert(isOnline === false, 'Offline mode engaged in browser window');

    // Queue 2 biometric punches via browser offlineManager
    const sampleTime = '08:42:15';
    await browser.evaluate(`
      window.offlineManager.queuePunch({
        school_id: '11111111-1111-1111-1111-111111111111',
        student_id: '88888888-8888-8888-8888-888888888801',
        student_name: 'Aarav Mehta',
        admission_number: 'DPS-2026-1001',
        class_division: 'Grade 10 - A',
        event_type: 'CHECK_IN',
        verification_method: 'FINGERPRINT',
        local_timestamp: '${sampleTime}',
        device_serial: 'ZK-K40-2026-001',
        device_name: 'Main Gate - Terminal A'
      });
      window.offlineManager.queuePunch({
        school_id: '11111111-1111-1111-1111-111111111111',
        student_id: '88888888-8888-8888-8888-888888888802',
        student_name: 'Ananya Kapoor',
        admission_number: 'DPS-2026-1002',
        class_division: 'Grade 10 - A',
        event_type: 'CHECK_IN',
        verification_method: 'FACE',
        local_timestamp: '08:43:00',
        device_serial: 'FACE-ZK-2026-001',
        device_name: 'Senior Wing Face Kiosk'
      });
    `);

    await sleep(800); // Allow IndexedDB write transaction to commit

    // Inspect IndexedDB directly via raw low-level IDB API in the browser
    const idbRecords = await browser.evaluate(`
      new Promise((resolve) => {
        const req = indexedDB.open('smartattend_offline_db', 1);
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('offline_attendance_queue', 'readonly');
          const store = tx.objectStore('offline_attendance_queue');
          const getAllReq = store.getAll();
          getAllReq.onsuccess = () => resolve(getAllReq.result);
        };
      })
    `);

    assert(idbRecords.length >= 2, `IndexedDB physically stores ${idbRecords.length} offline attendance records`);
    assert(idbRecords[0].status === 'PENDING', 'IndexedDB record status is strictly PENDING');
    assert(idbRecords[0].student_name === 'Ananya Kapoor' || idbRecords[0].student_name === 'Aarav Mehta', 'Student name preserved');
    assert(idbRecords[0].device_serial.includes('ZK') || idbRecords[0].device_serial.includes('FACE'), 'Hardware device serial preserved');

    await browser.navigateToDevicesDashboard();
    await browser.captureScreenshot('02_offline_captured_in_browser.png');

    // --------------------------------------------------------------------------
    // PHASE 3: Verify Persistence Across Page Refresh
    // --------------------------------------------------------------------------
    console.log('\n--- 3. Verifying IndexedDB Persistence After Page Refresh ---');
    console.log('[Browser] Executing page refresh (F5 / location.reload)...');
    await browser.reload();

    const postRefreshRecords = await browser.evaluate(`
      new Promise((resolve) => {
        const req = indexedDB.open('smartattend_offline_db', 1);
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('offline_attendance_queue', 'readonly');
          const store = tx.objectStore('offline_attendance_queue');
          const getAllReq = store.getAll();
          getAllReq.onsuccess = () => resolve(getAllReq.result);
        };
      })
    `);

    assert(postRefreshRecords.length >= 2, `After page refresh: All ${postRefreshRecords.length} records survived in IndexedDB`);
    assert(postRefreshRecords.every((r) => r.status === 'PENDING'), 'All records retain PENDING status across page refresh');

    await browser.navigateToDevicesDashboard();
    await browser.captureScreenshot('03_indexeddb_persisted_after_refresh.png');

    // --------------------------------------------------------------------------
    // PHASE 4: Verify Persistence Across Complete Browser Shutdown & Restart
    // --------------------------------------------------------------------------
    console.log('\n--- 4. Verifying IndexedDB Persistence Across Complete Browser Restart ---');
    console.log('[Browser] Shutting down Google Chrome completely...');
    await browser.close();
    await sleep(2500);

    console.log('[Browser] Relaunching Google Chrome with identical user data profile...');
    await browser.launch('http://localhost:5173');
    await sleep(3000);

    const postRestartRecords = await browser.evaluate(`
      new Promise((resolve) => {
        const req = indexedDB.open('smartattend_offline_db', 1);
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('offline_attendance_queue', 'readonly');
          const store = tx.objectStore('offline_attendance_queue');
          const getAllReq = store.getAll();
          getAllReq.onsuccess = () => resolve(getAllReq.result);
        };
      })
    `);

    assert(postRestartRecords.length >= 2, `After full browser restart: All ${postRestartRecords.length} records intact in IndexedDB LevelDB`);
    assert(postRestartRecords.some((r) => r.student_name === 'Aarav Mehta'), 'Aarav Mehta record intact');
    assert(postRestartRecords.some((r) => r.student_name === 'Ananya Kapoor'), 'Ananya Kapoor record intact');

    await browser.navigateToDevicesDashboard();
    await browser.captureScreenshot('04_indexeddb_persisted_after_browser_restart.png');

    // --------------------------------------------------------------------------
    // PHASE 5: Internet Reconnection & Actual Supabase Persistence Verification
    // --------------------------------------------------------------------------
    console.log('\n--- 5. Internet Reconnection & Actual Supabase Database Persistence ---');

    // Reconnect gateway in browser
    await browser.evaluate('window.offlineManager.setOnlineOverride(true)');
    const onlineState = await browser.evaluate('window.offlineManager.isOnline()');
    assert(onlineState === true, 'Internet gateway connectivity restored');

    // Await syncQueue in real browser
    const syncResult = await browser.evaluate('window.offlineManager.syncQueue()');
    console.log('  [Sync Output]', syncResult);
    assert((syncResult.synced + syncResult.duplicateResolved) >= 2, `Sync completed: ${syncResult.synced} persisted, ${syncResult.duplicateResolved} duplicates resolved`);

    await sleep(2000); // Allow Supabase round-trip and IndexedDB update

    // Inspect IndexedDB to verify status transitioned to SYNCED or DUPLICATE_RESOLVED
    const syncedRecordsInBrowser = await browser.evaluate(`
      new Promise((resolve) => {
        const req = indexedDB.open('smartattend_offline_db', 1);
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('offline_attendance_queue', 'readonly');
          const store = tx.objectStore('offline_attendance_queue');
          const getAllReq = store.getAll();
          getAllReq.onsuccess = () => resolve(getAllReq.result);
        };
      })
    `);

    assert(syncedRecordsInBrowser.every((r) => r.status === 'SYNCED' || r.status === 'DUPLICATE_RESOLVED'), 'All records updated to SYNCED or DUPLICATE_RESOLVED in browser IndexedDB');
    assert(syncedRecordsInBrowser.every((r) => Boolean(r.cloud_event_id)), 'Every synced record holds a valid Supabase cloud_event_id');

    // Direct Database Query: Query live Supabase PostgreSQL attendance_events table
    const { data: cloudEvents, error: supaErr } = await supabase
      .from('attendance_events')
      .select('id, student_id, verification_method, event_timestamp')
      .eq('student_id', '88888888-8888-8888-8888-888888888801')
      .order('event_timestamp', { ascending: false })
      .limit(1);

    assert(!supaErr && cloudEvents && cloudEvents.length > 0, 'Direct Supabase query confirmed attendance record persisted in PostgreSQL');
    console.log(`  ✓ Confirmed Supabase PostgreSQL Row ID: ${cloudEvents[0]?.id}`);

    await browser.navigateToDevicesDashboard();
    await browser.captureScreenshot('05_online_synced_to_supabase.png');

    // --------------------------------------------------------------------------
    // PHASE 6: Duplicate Prevention & Replay Interception
    // --------------------------------------------------------------------------
    console.log('\n--- 6. Duplicate Prevention & Conflict Handling ---');

    // Re-queue the exact same punch for Aarav Mehta
    await browser.evaluate(`
      window.offlineManager.queuePunch({
        school_id: '11111111-1111-1111-1111-111111111111',
        student_id: '88888888-8888-8888-8888-888888888801',
        student_name: 'Aarav Mehta',
        admission_number: 'DPS-2026-1001',
        class_division: 'Grade 10 - A',
        event_type: 'CHECK_IN',
        verification_method: 'FINGERPRINT',
        local_timestamp: '${sampleTime}',
        device_serial: 'ZK-K40-2026-001'
      })
    `);

    // Force sync attempt for duplicate
    const replaySync = await browser.evaluate('window.offlineManager.syncQueue()');
    console.log('  [Replay Sync Output]', replaySync);

    assert(replaySync.synced === 0, 'Duplicate punch was NOT doubly-inserted into Supabase');

    await browser.navigateToDevicesDashboard();
    await browser.captureScreenshot('06_duplicate_prevented.png');

    // --------------------------------------------------------------------------
    // PHASE 7: Safe Queue Removal Guarantee (Instruction 8)
    // --------------------------------------------------------------------------
    console.log('\n--- 7. Safe Queue Removal Guarantee Verification ---');

    // 7A: Engage offline mode before queuing unconfirmed punch
    await browser.evaluate('window.offlineManager.setOnlineOverride(false)');

    // 7B: Queue unconfirmed record for Rohan Verma
    const unconfirmedId = await browser.evaluate(`
      (() => {
        const rec = window.offlineManager.queuePunch({
          school_id: '11111111-1111-1111-1111-111111111111',
          student_id: '88888888-8888-8888-8888-888888888803',
          student_name: 'Rohan Verma',
          admission_number: 'DPS-2026-1003',
          class_division: 'Grade 10 - A',
          event_type: 'CHECK_IN',
          verification_method: 'FINGERPRINT',
          local_timestamp: '08:50:00'
        });
        return rec.id;
      })()
    `);

    // 7C: Verify unconfirmed record cannot be evicted
    const evictionTest = await browser.evaluate(`
      (() => {
        try {
          window.offlineManager.evictRecord('${unconfirmedId}');
          return { blocked: false };
        } catch (e) {
          return { blocked: true, message: e.message };
        }
      })()
    `);

    assert(evictionTest.blocked === true, `Eviction Guard: Blocked eviction of unpersisted record (${evictionTest.message})`);

    // 7D: Verify clearSyncedRecords only removes confirmed records
    const clearResult = await browser.evaluate('window.offlineManager.clearSyncedRecords()');
    assert(clearResult.evictedCount >= 2, `Safely evicted ${clearResult.evictedCount} verified persisted records from browser IndexedDB`);

    const finalRecordsInIDB = await browser.evaluate(`
      new Promise((resolve) => {
        const req = indexedDB.open('smartattend_offline_db', 1);
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('offline_attendance_queue', 'readonly');
          const store = tx.objectStore('offline_attendance_queue');
          const getAllReq = store.getAll();
          getAllReq.onsuccess = () => resolve(getAllReq.result);
        };
      })
    `);

    // The unconfirmed record for Rohan Verma must still remain in IndexedDB!
    assert(finalRecordsInIDB.some((r) => r.student_name === 'Rohan Verma' && r.status === 'PENDING'), 'Unconfirmed record for Rohan Verma remains strictly PENDING in IndexedDB');
    assert(!finalRecordsInIDB.some((r) => r.student_name === 'Aarav Mehta' && r.status === 'SYNCED'), 'Confirmed record for Aarav Mehta was safely evicted from browser IndexedDB');

    // 7E: Direct Supabase verification: Aarav Mehta record STILL exists in PostgreSQL
    const { data: supaCheckFinal } = await supabase
      .from('attendance_events')
      .select('id')
      .eq('student_id', '88888888-8888-8888-8888-888888888801')
      .limit(1);

    assert(supaCheckFinal && supaCheckFinal.length > 0, 'Supabase PostgreSQL record remains permanent after browser queue eviction');

    await browser.navigateToDevicesDashboard();
    await browser.captureScreenshot('07_safe_queue_removal.png');

    console.log('\n================================================================');
    console.log(`   Real Browser Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');

  } finally {
    await browser.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runRealBrowserVerification().catch((err) => {
  console.error('Fatal Browser Verification Error:', err);
  process.exit(1);
});
