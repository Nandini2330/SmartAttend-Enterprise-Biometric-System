import { offlineManager } from '../apps/web/src/lib/offline-manager';
import { deviceRegistry } from '../services/device-bridge/src/services/device_registry';
import { punchForwarder } from '../services/device-bridge/src/services/punch_forwarder';

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

async function runSprint1Verification() {
  console.log('===============================================================');
  console.log('   SmartAttend Enterprise - Sprint 1 Verification Suite');
  console.log('   Feature 7: Offline-First Attendance & Conflict Resolution');
  console.log('   Feature 6: Biometric Device Fleet Health Monitoring');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Offline Attendance Queueing & Deduplication
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Offline-First Attendance Queueing & Driver ---');

  // Step 1: Verify storage driver availability
  const storageEngine = offlineManager.getStorageEngine();
  assert(['IndexedDB', 'LocalStorage', 'Memory'].includes(storageEngine), `Storage engine driver initialized: ${storageEngine}`);

  // Step 2: Force offline mode
  offlineManager.setOnlineOverride(false);
  assert(offlineManager.isOnline() === false, 'Offline mode successfully engaged');

  // Step 3: Queue 2 punches offline
  const sampleTime = '08:35:10';
  const punch1 = offlineManager.queuePunch({
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888801',
    student_name: 'Aarav Mehta',
    admission_number: 'DPS-2026-1001',
    class_division: 'Grade 10 - A',
    event_type: 'CHECK_IN',
    verification_method: 'FINGERPRINT',
    local_timestamp: sampleTime,
    device_serial: 'ZK-K40-2026-001',
    device_name: 'Main Gate - Terminal A'
  });

  const punch2 = offlineManager.queuePunch({
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888802',
    student_name: 'Ananya Kapoor',
    admission_number: 'DPS-2026-1002',
    class_division: 'Grade 10 - A',
    event_type: 'CHECK_IN',
    verification_method: 'FACE',
    local_timestamp: '08:36:22',
    device_serial: 'FACE-ZK-2026-001',
    device_name: 'Senior Wing Face Kiosk'
  });

  assert(punch1.status === 'PENDING', 'Punch 1 marked as PENDING in local queue');
  assert(punch1.local_timestamp === sampleTime, 'Punch 1 preserves original edge timestamp');
  assert(punch1.device_serial === 'ZK-K40-2026-001', 'Punch 1 preserves hardware device identifier');
  assert(offlineManager.getPendingCount() >= 2, `Offline queue has ${offlineManager.getPendingCount()} pending records`);

  // Step 4: Test deduplication in offline queue (same student same minute)
  const duplicateOffline = offlineManager.queuePunch({
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888801',
    student_name: 'Aarav Mehta',
    admission_number: 'DPS-2026-1001',
    class_division: 'Grade 10 - A',
    event_type: 'CHECK_IN',
    verification_method: 'FINGERPRINT',
    local_timestamp: sampleTime,
    device_serial: 'ZK-K40-2026-001'
  });
  assert(duplicateOffline.id === punch1.id, 'Duplicate punch within same window intercepted in local queue');

  // Step 5: Strict Persistence Rule: Ensure record is NOT marked as synced while offline
  const syncAttemptWhileOffline = await offlineManager.syncQueue();
  assert(syncAttemptWhileOffline.synced === 0, 'Sync halted while offline; records remain unconfirmed');
  assert(punch1.status === 'PENDING', 'Pending records remain PENDING when gateway is unreachable');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Strict Eviction Safety Guard (Instruction 8)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Strict Eviction Safety Guard (Instruction 8) ---');

  // Test: Attempting to evict unconfirmed PENDING punch must fail
  let unconfirmedEvictionBlocked = false;
  try {
    offlineManager.evictRecord(punch1.id);
  } catch (err: any) {
    if (err.message.includes('Safety Violation')) {
      unconfirmedEvictionBlocked = true;
    }
  }
  assert(unconfirmedEvictionBlocked, 'Safety Violation: Unconfirmed PENDING record cannot be evicted from queue');

  // Test: clearSyncedRecords() must NOT evict pending records
  const clearResult = offlineManager.clearSyncedRecords();
  assert(clearResult.evictedCount === 0, 'clearSyncedRecords() evicted 0 unconfirmed records');
  assert(offlineManager.getPendingCount() >= 2, 'All pending records strictly preserved in local storage');

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Batch Sync, Cloud Persistence Confirmation & Idempotency
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Batch Sync & Cloud Persistence Confirmation ---');

  const batchResult = await punchForwarder.forwardOfflineBatch([
    {
      id: punch1.id,
      school_id: punch1.school_id,
      student_id: punch1.student_id,
      student_name: punch1.student_name,
      admission_number: punch1.admission_number,
      device_serial: punch1.device_serial || 'ZK-K40-2026-001',
      verification_method: punch1.verification_method,
      timestamp: punch1.timestamp,
      local_timestamp: punch1.local_timestamp,
      event_type: 'CHECK_IN'
    },
    {
      id: punch2.id,
      school_id: punch2.school_id,
      student_id: punch2.student_id,
      student_name: punch2.student_name,
      admission_number: punch2.admission_number,
      device_serial: punch2.device_serial || 'FACE-ZK-2026-001',
      verification_method: punch2.verification_method,
      timestamp: punch2.timestamp,
      local_timestamp: punch2.local_timestamp,
      event_type: 'CHECK_IN'
    }
  ]);

  assert(batchResult.total === 2, 'Batch of 2 offline records ingested');
  assert(batchResult.persisted_ids.includes(punch1.id), 'Punch 1 confirmed and acknowledged by persistence gateway');

  // Step 6: Test Replay Idempotency (Sending the same batch again)
  const replayResult = await punchForwarder.forwardOfflineBatch([
    {
      id: punch1.id,
      student_id: punch1.student_id,
      device_serial: punch1.device_serial || 'ZK-K40-2026-001',
      verification_method: punch1.verification_method,
      timestamp: punch1.timestamp
    }
  ]);
  assert(replayResult.duplicate_resolved === 1, 'Replayed offline punch resolved as duplicate without double-counting');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Verified Eviction After Cloud Confirmation
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Verified Eviction After Cloud Confirmation ---');

  // Simulate persistence confirmation onto punch1
  punch1.status = 'SYNCED';
  punch1.cloud_event_id = 'supa-confirmed-' + Date.now();

  const evictSuccess = offlineManager.evictRecord(punch1.id);
  assert(evictSuccess.success === true, 'Confirmed record successfully evicted after cloud verification');

  const remainingRecords = offlineManager.getAllRecords();
  assert(!remainingRecords.some((r) => r.id === punch1.id), 'Evicted record safely removed from local queue');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Online Reconnection Handling
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Online Gateway Reconnection ---');

  offlineManager.setOnlineOverride(true);
  assert(offlineManager.isOnline() === true, 'Online connectivity restored');

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Biometric Device Fleet Health Monitoring & Auto-Recovery
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Biometric Device Health Monitoring & Auto-Recovery ---');

  const devices = deviceRegistry.getAllDevices();
  assert(devices.length >= 3, `Device registry loaded with ${devices.length} hardware terminals`);

  const initialMetrics = deviceRegistry.getHealthMetrics();
  assert(initialMetrics.length >= 3, 'Fleet health metrics calculated for all registered devices');
  assert(initialMetrics[0].ping_latency_ms > 0, `Recorded ping latency: ${initialMetrics[0].ping_latency_ms}ms`);

  // Step 7: Test Device Failure Detection & Critical Alert Generation
  const testSerial = 'ZK-K40-2026-001';
  deviceRegistry.updateHeartbeat(testSerial, 'OFFLINE', 999);
  deviceRegistry.updateHeartbeat(testSerial, 'OFFLINE', 999); // 2 missed beats

  const metricsAfterDrop = deviceRegistry.getHealthMetrics();
  const failedDev = metricsAfterDrop.find((m) => m.serial_number === testSerial);
  assert(failedDev?.status === 'OFFLINE', 'Device status accurately transitioned to OFFLINE');
  assert((failedDev?.health_score || 0) < 70, `Health score downgraded after missed heartbeats (${failedDev?.health_score}%)`);

  const alerts = deviceRegistry.getAlerts();
  assert(alerts.some((a) => a.serial_number === testSerial && a.alert_type === 'OFFLINE_DETECTED'), 'Critical OFFLINE_DETECTED alert generated');

  // Step 8: Test Auto-Reconnection & Health Restoration
  const reconnectResult = await deviceRegistry.triggerReconnect(testSerial);
  assert(reconnectResult.success === true, 'Device automatic TCP reconnection handshake succeeded');

  const restoredDev = deviceRegistry.getDevice(testSerial);
  assert(restoredDev?.status === 'ONLINE', 'Device status restored to ONLINE');
  assert(restoredDev?.failureCount === 0, 'Failure counter reset after successful reconnection');

  // Clean up
  offlineManager.resetForTesting();

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   Sprint 1 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint1Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
