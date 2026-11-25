import { BiometricDeviceAdapter, BiometricPunchEvent } from './base.js';
import * as net from 'net';

export interface ZKTecoConfig {
  ip: string;
  port?: number;
  serialNumber: string;
  timeoutMs?: number;
}

export class ZKTecoAdapter implements BiometricDeviceAdapter {
  readonly name = 'ZKTeco Terminal Adapter';
  readonly deviceType = 'FINGERPRINT_TERMINAL';
  
  private socket: net.Socket | null = null;
  private connected: boolean = false;
  private config: ZKTecoConfig | null = null;
  private punchCallback: ((punch: BiometricPunchEvent) => void) | null = null;

  async connect(config: Record<string, unknown>): Promise<boolean> {
    this.config = {
      ip: String(config.ip || '192.168.1.120'),
      port: Number(config.port || 4370),
      serialNumber: String(config.serialNumber || 'ZK-K40-2026-001'),
      timeoutMs: Number(config.timeoutMs || 5000)
    };

    return new Promise((resolve) => {
      try {
        this.socket = new net.Socket();
        this.socket.setTimeout(this.config!.timeoutMs || 5000);

        this.socket.connect(this.config!.port!, this.config!.ip, () => {
          this.connected = true;
          // Send ZK connection command (CMD_CONNECT: 1000)
          const connectPacket = Buffer.from([0x50, 0x50, 0x82, 0x7d, 0x08, 0x00, 0x00, 0x00, 0xe8, 0x03, 0x00, 0x00]);
          this.socket?.write(connectPacket);
          resolve(true);
        });

        this.socket.on('data', (data) => {
          this.handleIncomingData(data);
        });

        this.socket.on('error', (err) => {
          this.connected = false;
          resolve(false);
        });

        this.socket.on('timeout', () => {
          this.connected = false;
          this.socket?.destroy();
          resolve(false);
        });

        this.socket.on('close', () => {
          this.connected = false;
        });
      } catch (err) {
        this.connected = false;
        resolve(false);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
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

  private handleIncomingData(data: Buffer): void {
    // Parser for ZK Real-Time push logs
    if (data.length >= 8 && this.punchCallback && this.config) {
      // In production ZK protocol, attendance log packets contain User PIN and timestamp
      const pin = data.readUInt16LE(4).toString();
      this.punchCallback({
        deviceSerial: this.config.serialNumber,
        studentIdentifier: pin,
        timestamp: new Date(),
        verificationMethod: 'FINGERPRINT',
        confidence: 0.99,
        rawPayload: { bytes: data.toString('hex') }
      });
    }
  }
}
