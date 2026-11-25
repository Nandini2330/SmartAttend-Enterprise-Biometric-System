import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { deviceRegistry } from './services/device_registry.js';
import { punchForwarder } from './services/punch_forwarder.js';
import { SimulatorAdapter } from './adapters/simulator.js';
import { parentPortalRouter } from './routes/parent_portal.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.DEVICE_BRIDGE_PORT || 8002);
const API_KEY = process.env.DEVICE_BRIDGE_API_KEY || 'smartattend_device_bridge_key_secret';

app.use(cors());
app.use(express.json());

// Mount Parent Portal Attendance & Reports API with Strict Authorization
app.use('/api/v1/parent', parentPortalRouter);

// Attach forwarder to simulator adapter
const simDevice = deviceRegistry.getDevice('SIM-DEV-2026-999');
if (simDevice && simDevice.adapter instanceof SimulatorAdapter) {
  simDevice.adapter.onPunch(async (punch) => {
    console.log(`[Simulator Event] Punch received for student ${punch.studentIdentifier}`);
    await punchForwarder.forwardPunch(punch);
  });
}

// 1. Health & Status
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'SmartAttend Biometric Device Bridge',
    timestamp: new Date().toISOString(),
    total_devices: deviceRegistry.getAllDevices().length,
    mode: process.env.DEVICE_BRIDGE_MODE || 'simulator'
  });
});

// 2. List Registered Devices
app.get('/api/v1/devices', (req: Request, res: Response) => {
  const devices = deviceRegistry.getAllDevices().map((d) => ({
    id: d.id,
    serial_number: d.serialNumber,
    device_name: d.name,
    device_model: d.model,
    device_type: d.type,
    status: d.status,
    last_heartbeat: d.lastHeartbeat,
    last_sync_at: d.lastSyncAt,
    ping_latency_ms: d.pingLatencyMs,
    failure_count: d.failureCount,
    is_connected: d.adapter.isConnected()
  }));
  res.json({ devices });
});

// 3. Device Telemetry & Health Metrics
app.get('/api/v1/devices/health', (req: Request, res: Response) => {
  const metrics = deviceRegistry.getHealthMetrics();
  const alerts = deviceRegistry.getAlerts();
  const onlineCount = metrics.filter((m) => m.status === 'ONLINE').length;
  const offlineCount = metrics.filter((m) => m.status === 'OFFLINE').length;
  const avgLatency = Math.round(metrics.reduce((acc, m) => acc + m.ping_latency_ms, 0) / (metrics.length || 1));
  const avgHealthScore = Math.round(metrics.reduce((acc, m) => acc + m.health_score, 0) / (metrics.length || 1));

  res.json({
    summary: {
      total_devices: metrics.length,
      online: onlineCount,
      offline: offlineCount,
      average_latency_ms: avgLatency,
      system_health_score: avgHealthScore,
      active_alerts: alerts.filter((a) => !a.acknowledged).length
    },
    devices: metrics,
    alerts
  });
});

// 4. Ping Specific Device
app.post('/api/v1/devices/:serial/ping', async (req: Request, res: Response) => {
  const { serial } = req.params;
  const result = await deviceRegistry.pingDevice(serial);
  res.json({
    serial_number: serial,
    ...result
  });
});

// 5. Trigger Device Reconnection
app.post('/api/v1/devices/:serial/reconnect', async (req: Request, res: Response) => {
  const { serial } = req.params;
  const result = await deviceRegistry.triggerReconnect(serial);
  res.json({
    serial_number: serial,
    ...result
  });
});

// 6. Ingest Hardware Punch
app.post('/api/v1/devices/punch', async (req: Request, res: Response) => {
  const { device_serial, student_identifier, verification_method, confidence_score } = req.body;

  if (!device_serial || !student_identifier) {
    return res.status(400).json({ error: 'Missing device_serial or student_identifier' });
  }

  const device = deviceRegistry.getDevice(device_serial);
  if (!device) {
    return res.status(404).json({ error: 'Device not registered in SmartAttend bridge' });
  }

  const result = await punchForwarder.forwardPunch({
    deviceSerial: device_serial,
    studentIdentifier: student_identifier,
    timestamp: new Date(),
    verificationMethod: verification_method || 'FINGERPRINT',
    confidence: confidence_score || 0.99
  });

  deviceRegistry.updateHeartbeat(device_serial, 'ONLINE');
  deviceRegistry.updateSyncTimestamp(device_serial);
  res.json(result);
});

// 7. Offline Batch Sync (Processed with idempotency & persistence confirmation)
app.post('/api/v1/devices/offline-batch', async (req: Request, res: Response) => {
  const { records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Expected non-empty records array' });
  }

  const result = await punchForwarder.forwardOfflineBatch(records);
  res.json({
    message: `Batch sync finished: ${result.synced} new, ${result.duplicate_resolved} duplicates resolved, ${result.failed} failed.`,
    ...result
  });
});

// 8. Lab Simulator Trigger (Explicitly simulated)
app.post('/api/v1/devices/simulator/trigger', async (req: Request, res: Response) => {
  const { student_identifier, admission_number } = req.body;
  const targetId = student_identifier || admission_number || 'DPS-2026-1001';

  if (!simDevice || !(simDevice.adapter instanceof SimulatorAdapter)) {
    return res.status(500).json({ error: 'Simulator adapter not initialized' });
  }

  const punch = simDevice.adapter.generatePunch(targetId);
  const forwardResult = await punchForwarder.forwardPunch(punch);
  deviceRegistry.updateSyncTimestamp('SIM-DEV-2026-999');

  res.json({
    message: 'Simulated biometric punch generated and processed.',
    punch,
    result: forwardResult
  });
});

// 9. Offline Sync Replay (Local hardware buffer replay)
app.post('/api/v1/devices/sync', async (req: Request, res: Response) => {
  if (simDevice && simDevice.adapter instanceof SimulatorAdapter) {
    const synced = await simDevice.adapter.syncOfflineLogs();
    deviceRegistry.updateSyncTimestamp('SIM-DEV-2026-999');
    return res.json({
      message: `Replayed ${synced.length} offline biometric logs.`,
      events_replayed: synced.length
    });
  }
  res.json({ message: 'No offline events in buffer', events_replayed: 0 });
});

app.listen(PORT, () => {
  console.log(`[SmartAttend Device Bridge] Running on port ${PORT}`);
});
