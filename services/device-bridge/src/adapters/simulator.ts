import { BiometricDeviceAdapter, BiometricPunchEvent } from './base.js';

export interface SimulatorConfig {
  serialNumber: string;
  autoPunchIntervalSec?: number;
}

export class SimulatorAdapter implements BiometricDeviceAdapter {
  readonly name = 'SmartAttend Hardware Simulator (Development Mode)';
  readonly deviceType = 'FINGERPRINT_TERMINAL';

  private connected: boolean = true;
  private config: SimulatorConfig = { serialNumber: 'SIM-DEV-2026-999' };
  private punchCallback: ((punch: BiometricPunchEvent) => void) | null = null;
  private timer: NodeJS.Timeout | null = null;
  private offlineBuffer: BiometricPunchEvent[] = [];

  async connect(config: Record<string, unknown>): Promise<boolean> {
    this.config = {
      serialNumber: String(config.serialNumber || 'SIM-DEV-2026-999'),
      autoPunchIntervalSec: config.autoPunchIntervalSec ? Number(config.autoPunchIntervalSec) : undefined
    };
    this.connected = true;

    if (this.config.autoPunchIntervalSec && this.config.autoPunchIntervalSec > 0) {
      this.startAutoPunches(this.config.autoPunchIntervalSec);
    }
    return true;
  }

  async disconnect(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async ping(): Promise<boolean> {
    return this.connected;
  }

  onPunch(callback: (punch: BiometricPunchEvent) => void): void {
    this.punchCallback = callback;
  }

  /**
   * Generates an explicitly labelled simulated biometric punch
   */
  generatePunch(studentIdentifier: string, isOffline: boolean = false): BiometricPunchEvent {
    const punch: BiometricPunchEvent = {
      deviceSerial: this.config.serialNumber,
      studentIdentifier,
      timestamp: new Date(),
      verificationMethod: 'SIMULATED', // Explicitly distinguished from physical hardware
      confidence: 0.999,
      isOfflineSync: isOffline,
      rawPayload: {
        is_simulation: true,
        simulator_version: 'v1.0',
        generated_at: new Date().toISOString()
      }
    };

    if (isOffline) {
      this.offlineBuffer.push(punch);
    } else if (this.punchCallback) {
      this.punchCallback(punch);
    }

    return punch;
  }

  async syncOfflineLogs(): Promise<BiometricPunchEvent[]> {
    const synced = [...this.offlineBuffer];
    this.offlineBuffer = [];
    if (this.punchCallback) {
      for (const punch of synced) {
        this.punchCallback(punch);
      }
    }
    return synced;
  }

  private startAutoPunches(intervalSec: number) {
    const sampleStudents = ['DPS-2026-1001', 'DPS-2026-1002', 'DPS-2026-1003'];
    let idx = 0;
    this.timer = setInterval(() => {
      if (this.connected && this.punchCallback) {
        this.generatePunch(sampleStudents[idx % sampleStudents.length]);
        idx++;
      }
    }, intervalSec * 1000);
  }
}
