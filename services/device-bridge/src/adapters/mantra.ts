import { BiometricDeviceAdapter, BiometricPunchEvent } from './base.js';

export interface MantraConfig {
  rdServiceUrl?: string; // Default http://127.0.0.1:11100
  serialNumber: string;
}

export class MantraAdapter implements BiometricDeviceAdapter {
  readonly name = 'Mantra MFS100 RD Service Adapter';
  readonly deviceType = 'FINGERPRINT_TERMINAL';

  private connected: boolean = false;
  private config: MantraConfig | null = null;
  private punchCallback: ((punch: BiometricPunchEvent) => void) | null = null;

  async connect(config: Record<string, unknown>): Promise<boolean> {
    this.config = {
      rdServiceUrl: String(config.rdServiceUrl || 'http://127.0.0.1:11100'),
      serialNumber: String(config.serialNumber || 'MAN-HYB-2026-002')
    };

    try {
      // Check RD Service /RD/info status
      const response = await fetch(`${this.config.rdServiceUrl}/RD/info`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        this.connected = true;
        return true;
      }
    } catch {
      this.connected = false;
    }
    return false;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async ping(): Promise<boolean> {
    if (!this.config) return false;
    try {
      const response = await fetch(`${this.config.rdServiceUrl}/RD/info`, { signal: AbortSignal.timeout(2000) });
      this.connected = response.ok;
      return response.ok;
    } catch {
      this.connected = false;
      return false;
    }
  }

  onPunch(callback: (punch: BiometricPunchEvent) => void): void {
    this.punchCallback = callback;
  }

  /**
   * Triggers active fingerprint capture via Mantra RD Service CAPTURE endpoint
   */
  async triggerCapture(studentIdentifier: string): Promise<boolean> {
    if (!this.config || !this.punchCallback) return false;
    try {
      const captureXml = `<PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" env="P" /></PidOptions>`;
      const res = await fetch(`${this.config.rdServiceUrl}/RD/capture`, {
        method: 'CAPTURE',
        headers: { 'Content-Type': 'text/xml' },
        body: captureXml
      });
      if (res.ok) {
        this.punchCallback({
          deviceSerial: this.config.serialNumber,
          studentIdentifier,
          timestamp: new Date(),
          verificationMethod: 'FINGERPRINT',
          confidence: 0.985
        });
        return true;
      }
    } catch (e) {
      console.error('Mantra RD capture failed:', e);
    }
    return false;
  }
}
