export interface BiometricPunchEvent {
  deviceSerial: string;
  studentIdentifier: string; // Admission number e.g. "DPS-2026-1001" or terminal PIN "10101"
  timestamp: Date;
  verificationMethod: 'FINGERPRINT' | 'FACE' | 'CARD' | 'SIMULATED';
  confidence: number;
  isOfflineSync?: boolean;
  rawPayload?: Record<string, unknown>;
}

export interface BiometricDeviceAdapter {
  readonly name: string;
  readonly deviceType: string;
  connect(config: Record<string, unknown>): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  ping(): Promise<boolean>;
  onPunch(callback: (punch: BiometricPunchEvent) => void): void;
  syncOfflineLogs?(): Promise<BiometricPunchEvent[]>;
}
