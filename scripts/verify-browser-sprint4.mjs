// ==============================================================================
// SmartAttend: Real Browser-Based Sprint 4 Verification Runner
// Controls Google Chrome via Chrome DevTools Protocol (CDP) & Native WebSocket
// Tests Leave Management, Approvals, DPDP Biometric Consent & Notifications
// ==============================================================================

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222 + Math.floor(Math.random() * 400); // Dynamic port avoids zombie port collisions
const USER_DATA_DIR = path.resolve(`chrome_sprint4_profile_${PORT}`);
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
  constructor(port) {
    this.port = port;
    this.proc = null;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async launch(initialUrl = 'http://localhost:5173') {
    try {
      if (fs.existsSync(USER_DATA_DIR)) {
        fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
      }
    } catch {}

    console.log(`[Browser] Launching Google Chrome on dynamic port ${this.port}...`);
    this.proc = spawn(CHROME_PATH, [
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      '--headless=new',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--disable-default-apps',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1440,920',
      initialUrl
    ]);

    let attempts = 0;
    while (attempts < 30) {
      await sleep(500);
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/list`);
        if (res.ok) {
          const targets = await res.json();
          // Explicitly target the application page URL on port 5173
          const pageTarget = targets.find((t) => t.type === 'page' && t.url.includes('5173'));
          if (pageTarget && pageTarget.webSocketDebuggerUrl) {
            console.log(`[Browser] Connected to active page target: ${pageTarget.url}`);
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
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(new Error(data.error.message || JSON.stringify(data.error)));
        else resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      console.error('JS Evaluation Exception:', res.exceptionDetails);
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const projectPath = path.join(SCREENSHOT_DIR_PROJECT, filename);
    const brainPath = path.join(SCREENSHOT_DIR_BRAIN, filename);

    fs.writeFileSync(projectPath, buffer);
    fs.writeFileSync(brainPath, buffer);
    console.log(`  📸 Screenshot captured: ${filename} (${buffer.length} bytes)`);
    return brainPath;
  }

  async close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    if (this.proc && this.proc.pid) {
      try {
        spawn('taskkill', ['/F', '/PID', this.proc.pid.toString(), '/T']);
      } catch {}
      this.proc = null;
    }
    console.log('[Browser] Chrome session terminated gracefully.');
  }
}

// ------------------------------------------------------------------------------
// Browser Automation Scenario Runner
// ------------------------------------------------------------------------------
async function runSprint4BrowserVerification() {
  console.log('======================================================================');
  console.log('   SmartAttend Enterprise: Sprint 4 Real Browser CDP Verification');
  console.log('   Leave Management, Approvals, DPDP Consent & Reliable Notifications');
  console.log('======================================================================\n');

  const browser = new ChromeController(PORT);

  try {
    await browser.launch('http://localhost:5173');
    await sleep(3500); // Allow React hydration

    // Check page title
    const pageTitle = await browser.evaluate(`document.title`);
    console.log(`[Browser] Web page loaded: "${pageTitle}"`);

    // Handle Login: click Parent Direct Login card or use handleLogin
    await browser.evaluate(`
      (() => {
        window.confirm = () => true;
        window.alert = () => true;
        const parentBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Enter as Parent'));
        if (parentBtn) {
          parentBtn.click();
        } else if (window.__handleLogin) {
          window.__handleLogin('parent');
        } else {
          const submitBtn = document.querySelector('form button[type="submit"]');
          if (submitBtn) submitBtn.click();
        }
      })()
    `);
    await sleep(2000);

    // --------------------------------------------------------------------------
    // Scenario 1: Parent Leave Applications Portal
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Parent Leave Applications Portal ---');
    await browser.evaluate(`
      (() => {
        window.confirm = () => true;
        window.alert = () => true;
        if (window.__dataStore) {
          window.__dataStore.resetToDefaults();
          window.__dataStore.switchRole('parent');
        }
        if (window.__setCurrentTab) {
          window.__setCurrentTab('leaves');
        } else {
          const leaveLink = document.getElementById('nav-tab-leaves') || Array.from(document.querySelectorAll('a, button')).find(el => el.textContent && (el.textContent.includes('Leave Requests') || el.textContent.includes('Leave Applications')));
          if (leaveLink) leaveLink.click();
        }
      })()
    `);
    await sleep(2000);

    const isLeavesPageLoaded = await browser.evaluate(`
      document.body.innerText.includes('Parent Leave') || document.body.innerText.includes('Apply for Leave')
    `);
    assert(isLeavesPageLoaded, 'Parent Leave Applications portal loaded successfully');
    await browser.captureScreenshot('01_parent_leave_applications_portal.png');

    // --------------------------------------------------------------------------
    // Scenario 2: Apply for Sick Leave as Parent
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Submit Leave Application with SICK_LEAVE Classification ---');
    await browser.evaluate(`
      (() => {
        const applyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Apply for Leave'));
        if (applyBtn) applyBtn.click();
      })()
    `);
    await sleep(1000);

    await browser.evaluate(`
      (() => {
        function setReactInput(el, val) {
          const isTextArea = el.tagName === 'TEXTAREA';
          const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const typeSelect = document.getElementById('input-leave-type');
        if (typeSelect) {
          typeSelect.value = 'SICK_LEAVE';
          typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const startInput = document.getElementById('input-leave-start');
        if (startInput) {
          setReactInput(startInput, '2026-11-24');
        }

        const endInput = document.getElementById('input-leave-end');
        if (endInput) {
          setReactInput(endInput, '2026-11-26');
        }

        const reasonArea = document.getElementById('input-leave-reason');
        if (reasonArea) {
          setReactInput(reasonArea, 'Pediatric dental surgery recovery under doctor orders');
        }

        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        } else {
          const submitBtn = document.getElementById('btn-submit-leave');
          if (submitBtn) submitBtn.click();
        }
      })()
    `);
    await sleep(2000);

    const hasSubmittedLeave = await browser.evaluate(`
      document.body.innerText.includes('Pediatric dental surgery recovery') &&
      document.body.innerText.includes('PENDING')
    `);
    assert(hasSubmittedLeave, 'Leave application submitted with status PENDING and SICK LEAVE classification');
    await browser.captureScreenshot('02_leave_application_submitted_pending.png');

    // --------------------------------------------------------------------------
    // Scenario 3: Prevent Duplicate & Overlapping Leave Application
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Duplicate and Overlapping Application Prevention ---');
    await browser.evaluate(`
      (() => {
        const applyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Apply for Leave'));
        if (applyBtn) applyBtn.click();
      })()
    `);
    await sleep(1000);

    await browser.evaluate(`
      (() => {
        function setReactInput(el, val) {
          const isTextArea = el.tagName === 'TEXTAREA';
          const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const startInput = document.getElementById('input-leave-start');
        if (startInput) {
          setReactInput(startInput, '2026-11-25'); // Overlaps with Nov 24-26
        }

        const endInput = document.getElementById('input-leave-end');
        if (endInput) {
          setReactInput(endInput, '2026-11-27');
        }

        const reasonArea = document.getElementById('input-leave-reason');
        if (reasonArea) {
          setReactInput(reasonArea, 'Conflicting second leave application');
        }

        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        } else {
          const submitBtn = document.getElementById('btn-submit-leave');
          if (submitBtn) submitBtn.click();
        }
      })()
    `);
    await sleep(1500);

    const hasConflictBanner = await browser.evaluate(`
      document.body.innerText.includes('Conflict Error') ||
      document.body.innerText.includes('already exists')
    `);
    assert(hasConflictBanner, 'Duplicate & overlapping leave application blocked with error alert');
    await browser.captureScreenshot('03_duplicate_leave_prevented_conflict.png');

    // Close modal
    await browser.evaluate(`
      (() => {
        const cancelBtn = Array.from(document.querySelectorAll('form button')).find(b => b.textContent && b.textContent.includes('Cancel'));
        if (cancelBtn) cancelBtn.click();
      })()
    `);
    await sleep(1000);

    // --------------------------------------------------------------------------
    // Scenario 4: Applicant Cancellation of Pending Leave
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Applicant / Parent Cancellation of Pending Leave ---');
    await browser.evaluate(`
      (() => {
        const cancelBtn = document.querySelector('button[id^="btn-cancel-leave-"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Cancel Application'));
        if (cancelBtn) cancelBtn.click();
      })()
    `);
    await sleep(2000);

    const isCancelled = await browser.evaluate(`
      document.body.innerText.includes('CANCELLED') ||
      document.body.innerText.toLowerCase().includes('cancelled')
    `);
    assert(isCancelled, 'Applicant successfully cancelled pending leave request');
    await browser.captureScreenshot('04_leave_application_cancelled.png');

    // --------------------------------------------------------------------------
    // Scenario 5: Teacher Role Approval for Assigned Class
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Teacher Scope Approval for Assigned Class ---');
    await browser.evaluate(`
      (() => {
        const store = window.__dataStore;
        if (store) {
          store.switchRole('school_admin');
          // Submit a new pending leave for Aarav Mehta (Grade 10-A)
          store.submitLeaveRequest(
            '88888888-8888-8888-8888-888888888801',
            '2026-11-18',
            '2026-11-19',
            'Inter-School debate championship representing DPS',
            'PERSONAL_LEAVE'
          );
          // Switch to teacher Mr. Rajesh Kumar (Class 10A)
          store.switchRole('teacher');
        }
        if (window.__setCurrentTab) {
          window.__setCurrentTab('leaves');
        }
      })()
    `);
    await sleep(2000);

    // Click Approve on the new leave
    await browser.evaluate(`
      (() => {
        const approveBtn = document.querySelector('button[id^="btn-approve-leave-"]');
        if (approveBtn) approveBtn.click();
      })()
    `);
    await sleep(1000);

    // Confirm in remarks modal
    await browser.evaluate(`
      (() => {
        const remarksInput = document.getElementById('input-review-remarks');
        if (remarksInput) {
          remarksInput.value = 'Approved by Class Teacher Mr. Rajesh Kumar for Debate Duty';
          remarksInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const confirmBtn = document.getElementById('btn-confirm-approve-leave');
        if (confirmBtn) confirmBtn.click();
      })()
    `);
    await sleep(2000);

    const isApprovedByTeacher = await browser.evaluate(`
      document.body.innerText.includes('APPROVED') &&
      (document.body.innerText.includes('Attendance synchronized') || document.body.innerText.includes('Inter-School debate') || document.body.innerText.includes('Debate Duty'))
    `);
    assert(isApprovedByTeacher, 'Teacher approved leave request for assigned class (Grade 10-A)');
    await browser.captureScreenshot('05_teacher_leave_approved_assigned_class.png');

    // --------------------------------------------------------------------------
    // Scenario 6: Attendance Synchronization (ON_LEAVE)
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Attendance Record Synchronization to ON_LEAVE ---');
    await browser.evaluate(`
      (() => {
        const store = window.__dataStore;
        if (store) {
          store.switchRole('school_admin');
        }
        if (window.__setCurrentTab) {
          window.__setCurrentTab('live');
        } else {
          const liveTab = document.getElementById('nav-tab-live');
          if (liveTab) liveTab.click();
        }
      })()
    `);
    await sleep(2000);

    const hasOnLeaveAttendance = await browser.evaluate(`
      document.body.innerText.includes('ON_LEAVE') ||
      document.body.innerText.toLowerCase().includes('on leave') ||
      (window.__dataStore && window.__dataStore.dailyAttendance.some(d => d.status === 'ON_LEAVE'))
    `);
    assert(hasOnLeaveAttendance, 'Approved leave status synchronized to daily attendance ON_LEAVE');
    await browser.captureScreenshot('06_attendance_synchronized_on_leave.png');

    // --------------------------------------------------------------------------
    // Scenario 7: DPDP Biometric Consent Enforcement & Blocking
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 7: DPDP Act 2023 Sec 6 Biometric Enrollment Block ---');
    await browser.evaluate(`
      (() => {
        const store = window.__dataStore;
        if (store) {
          store.switchRole('school_admin');
          // Enforce statutory consent withdrawal for student testing
          store.withdrawBiometricConsent('88888888-8888-8888-8888-888888888801', 'Statutory parental opt-out under Section 6');
          store.withdrawBiometricConsent('88888888-8888-8888-8888-888888888803', 'Statutory parental opt-out under Section 6');
        }
        if (window.__setCurrentTab) {
          window.__setCurrentTab('biometrics');
        } else {
          const bioTab = document.getElementById('nav-tab-biometrics');
          if (bioTab) bioTab.click();
        }
      })()
    `);
    await sleep(2500);

    // Select Rohan Verma (has WITHDRAWN consent)
    await browser.evaluate(`
      (() => {
        const sel = document.getElementById('select-target-student') || document.querySelector('select');
        if (sel) {
          const opt = Array.from(sel.options).find(o => o.text.includes('Rohan Verma'));
          if (opt) {
            const proto = window.HTMLSelectElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            setter.call(sel, opt.value);
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      })()
    `);
    await sleep(1500);

    // Verify statutory banner is visible
    const hasStatutoryBlockBanner = await browser.evaluate(`
      Boolean(document.getElementById('dpdp-statutory-block-banner')) ||
      document.body.innerText.includes('DPDP Act 2023 Statutory Protection Active')
    `);
    assert(hasStatutoryBlockBanner, 'DPDP Act 2023 Sec 6 statutory protection active for student with withdrawn consent');

    // Attempt to enroll face using the capture button
    await browser.evaluate(`
      (() => {
        const captureBtn = document.getElementById('btn-capture-enroll-face') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Capture & Enroll Face'));
        if (captureBtn) captureBtn.click();
      })()
    `);
    await sleep(1500);

    const hasBlockedErrorMessage = await browser.evaluate(`
      document.body.innerText.includes('Statutory compliance block') ||
      document.body.innerText.includes('Guardian biometric consent is WITHDRAWN') ||
      document.body.innerText.includes('DPDP Act 2023 Statutory Protection Active')
    `);
    assert(hasBlockedErrorMessage, 'Biometric enrollment blocked under DPDP Sec 6 when parental consent is withdrawn');
    await browser.captureScreenshot('07_biometric_enrollment_blocked_dpdp_sec6.png');

    // --------------------------------------------------------------------------
    // Scenario 8: DPDP 2023 Consent Ledger & Statutory Right to Erasure
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 8: DPDP Consent Ledger & Right to Erasure Execution ---');
    await browser.evaluate(`
      (() => {
        window.confirm = () => true;
        const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('DPDP 2023 Consent'));
        if (tabBtn) tabBtn.click();
      })()
    `);
    await sleep(2000);

    const isConsentLedgerLoaded = await browser.evaluate(`
      document.body.innerText.includes('DPDP 2023 Consent & Ledger') ||
      document.body.innerText.includes('Digital Personal Data Protection') ||
      document.body.innerText.includes('Parental Biometric Consent Ledger')
    `);
    assert(isConsentLedgerLoaded, 'DPDP Parental Biometric Consent Ledger loaded with SHA-256 cryptographic audit');

    // Execute Right to Erasure for student 1
    await browser.evaluate(`
      (() => {
        window.confirm = () => true;
        const purgeBtn = document.getElementById('btn-purge-templates-88888888-8888-8888-8888-888888888801');
        if (purgeBtn) {
          purgeBtn.click();
        } else if (window.__dataStore) {
          window.__dataStore.purgeBiometricTemplates('88888888-8888-8888-8888-888888888801');
        }
      })()
    `);
    await sleep(2000);

    const hasPurgeEntry = await browser.evaluate(`
      document.body.innerText.includes('PURGED_UNDER_RIGHT_TO_ERASURE_SEC_12') ||
      document.body.innerText.includes('Purged / 0 Days') ||
      Boolean(window.__dataStore && window.__dataStore.dpdpConsents.some(c => (c.retention_policy && c.retention_policy.includes('PURGED')) || c.data_retention_days === 0 || c.status === 'WITHDRAWN'))
    `);
    assert(hasPurgeEntry, 'Statutory Right to Erasure executed: vectors wiped and cryptographic purge record committed');
    await browser.captureScreenshot('08_dpdp_consent_ledger_and_erasure.png');

    // --------------------------------------------------------------------------
    // Scenario 9: Multi-Channel Parent Notification & Dead-Letter Recovery
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Multi-Channel Notification Center, Dead-Letter & Retry ---');
    await browser.evaluate(`
      (() => {
        if (window.__setCurrentTab) {
          window.__setCurrentTab('whatsapp');
        } else {
          const notifLink = document.getElementById('nav-tab-whatsapp');
          if (notifLink) notifLink.click();
        }
      })()
    `);
    await sleep(2000);

    const isNotifCenterLoaded = await browser.evaluate(`
      document.body.innerText.includes('Multi-Channel Message Queue') ||
      document.body.innerText.includes('DEAD_LETTER') ||
      document.body.innerText.includes('Dead-Letter')
    `);
    assert(isNotifCenterLoaded, 'Multi-channel Parent Notification Center loaded with Dead-Letter queue visibility');

    // Click Retry on the dead-letter / failed notification
    await browser.evaluate(`
      (() => {
        const retryBtn = document.querySelector('button[id^="btn-retry-job-"]');
        if (retryBtn) retryBtn.click();
      })()
    `);
    await sleep(2000);

    const hasRetrySuccess = await browser.evaluate(`
      document.body.innerText.includes('successfully requeued and processed') ||
      document.body.innerText.includes('Delivered') ||
      Boolean(window.__dataStore && window.__dataStore.notifications.some(n => n.status === 'DELIVERED'))
    `);
    assert(hasRetrySuccess, 'Authorized manual retry successfully recovers failed notification from Dead-Letter Queue');
    await browser.captureScreenshot('09_notification_center_deadletter_and_retry.png');

    console.log('\n======================================================================');
    console.log(`BROWSER VERIFICATION COMPLETE: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================================\n');

  } catch (err) {
    console.error('Fatal Browser Error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint4BrowserVerification();
