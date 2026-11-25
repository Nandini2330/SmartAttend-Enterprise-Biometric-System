import { supabase, isSupabaseConfigured } from './supabase';
import { evaluateAttendanceRecord } from './data-store';
import type { OfflineAttendanceRecord, OfflineRecordStatus } from '@smartattend/shared-types';

const OFFLINE_DB_NAME = 'smartattend_offline_db';
const OFFLINE_DB_VERSION = 1;
const OFFLINE_STORE_NAME = 'offline_attendance_queue';
const LEGACY_STORAGE_KEY = 'smartattend_offline_attendance_queue_v1';

/**
 * IndexedDB Driver with transparent fallbacks for headless/Node.js testing environments
 */
class IndexedDBStore {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isIndexedDBAvailable: boolean;
  private memoryFallback: Map<string, OfflineAttendanceRecord> = new Map();

  constructor() {
    this.isIndexedDBAvailable =
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).indexedDB !== 'undefined' &&
      (globalThis as any).indexedDB !== null;
  }

  isAvailable(): boolean {
    return this.isIndexedDBAvailable;
  }

  private async getDB(): Promise<IDBDatabase | null> {
    if (!this.isIndexedDBAvailable) return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const idb = (globalThis as any).indexedDB as IDBFactory;
        const request = idb.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
            const store = db.createObjectStore(OFFLINE_STORE_NAME, { keyPath: 'id' });
            store.createIndex('by_status', 'status', { unique: false });
            store.createIndex('by_student', 'student_id', { unique: false });
            store.createIndex('by_timestamp', 'timestamp', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          resolve(db);
        };

        request.onerror = (err) => {
          console.warn('[IndexedDB] Failed to open offline database, falling back to storage:', err);
          resolve(null);
        };
      } catch (err) {
        console.warn('[IndexedDB] Initialization exception:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  async getAll(): Promise<OfflineAttendanceRecord[]> {
    const db = await this.getDB();
    if (!db) {
      // Fallback: localStorage or memory map
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) return JSON.parse(raw);
        } catch {
          // ignore
        }
      }
      return Array.from(this.memoryFallback.values());
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(OFFLINE_STORE_NAME, 'readonly');
        const store = tx.objectStore(OFFLINE_STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (err) {
        console.warn('[IndexedDB] Error in getAll:', err);
        resolve([]);
      }
    });
  }

  async put(record: OfflineAttendanceRecord): Promise<void> {
    this.memoryFallback.set(record.id, record);

    // Fallback sync to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const existing = this.memoryFallback.values();
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(Array.from(existing)));
      } catch {
        // ignore
      }
    }

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(OFFLINE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(OFFLINE_STORE_NAME);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async putBatch(records: OfflineAttendanceRecord[]): Promise<void> {
    for (const r of records) {
      this.memoryFallback.set(r.id, r);
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(Array.from(this.memoryFallback.values())));
      } catch {
        // ignore
      }
    }

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(OFFLINE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(OFFLINE_STORE_NAME);
        for (const r of records) {
          store.put(r);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async delete(id: string): Promise<void> {
    this.memoryFallback.delete(id);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(Array.from(this.memoryFallback.values())));
      } catch {
        // ignore
      }
    }

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(OFFLINE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(OFFLINE_STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export class OfflineAttendanceManager {
  private queue: OfflineAttendanceRecord[] = [];
  private listeners: Set<() => void> = new Set();
  private isSyncing = false;
  private currentSyncPromise: Promise<{
    synced: number;
    duplicateResolved: number;
    failed: number;
    totalPending: number;
  }> | null = null;
  private onlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private idbStore: IndexedDBStore;
  private initializedPromise: Promise<void>;

  constructor() {
    this.idbStore = new IndexedDBStore();
    this.initializedPromise = this.initStore();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.onlineStatus = true;
        this.notify();
        this.syncQueue();
      });

      window.addEventListener('offline', () => {
        this.onlineStatus = false;
        this.notify();
      });
    }
  }

  private async initStore() {
    try {
      // 1. Check legacy localStorage for existing queue data
      let legacyRecords: OfflineAttendanceRecord[] = [];
      if (typeof localStorage !== 'undefined') {
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
          try {
            legacyRecords = JSON.parse(legacyData);
          } catch {
            legacyRecords = [];
          }
        }
      }

      // 2. Load from IndexedDB
      const idbRecords = await this.idbStore.getAll();

      // Merge and deduplicate by ID
      const map = new Map<string, OfflineAttendanceRecord>();
      for (const r of legacyRecords) map.set(r.id, r);
      for (const r of idbRecords) map.set(r.id, r);

      this.queue = Array.from(map.values());

      // If we had legacy records that weren't in IndexedDB, persist them
      if (legacyRecords.length > 0 && this.idbStore.isAvailable()) {
        await this.idbStore.putBatch(this.queue);
      }
    } catch (e) {
      console.warn('Failed to initialize offline attendance store:', e);
      this.queue = [];
    }
  }

  async waitForInitialization(): Promise<void> {
    return this.initializedPromise;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  isOnline(): boolean {
    return this.onlineStatus;
  }

  getStorageEngine(): 'IndexedDB' | 'LocalStorage' | 'Memory' {
    if (this.idbStore.isAvailable()) return 'IndexedDB';
    if (typeof localStorage !== 'undefined') return 'LocalStorage';
    return 'Memory';
  }

  setOnlineOverride(isOnline: boolean) {
    this.onlineStatus = isOnline;
    this.notify();
    if (isOnline) {
      this.syncQueue();
    }
  }

  /**
   * Queue attendance record in local offline store
   * Guaranteed: preserves original timestamp, device id, student info
   * Deduplicates matching punches within the same minute window
   */
  queuePunch(params: {
    school_id: string;
    student_id: string;
    student_name: string;
    admission_number: string;
    class_division: string;
    session_id?: string;
    event_type: 'CHECK_IN' | 'CHECK_OUT';
    verification_method: 'FACE' | 'FINGERPRINT' | 'MANUAL' | 'CARD' | 'SIMULATED';
    timestamp?: string;
    local_timestamp?: string;
    device_serial?: string;
    device_name?: string;
    confidence_score?: number;
  }): OfflineAttendanceRecord {
    const now = new Date();
    const isoTimestamp = params.timestamp || now.toISOString();
    const localTime = params.local_timestamp || now.toLocaleTimeString('en-GB', { hour12: false });

    // Deduplication check in pending queue
    const existing = this.queue.find(
      (r) =>
        r.student_id === params.student_id &&
        r.timestamp.split('T')[0] === isoTimestamp.split('T')[0] &&
        r.local_timestamp.slice(0, 5) === localTime.slice(0, 5) &&
        (r.status === 'PENDING' || r.status === 'SYNCING')
    );

    if (existing) {
      return existing;
    }

    const record: OfflineAttendanceRecord = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      school_id: params.school_id,
      student_id: params.student_id,
      student_name: params.student_name,
      admission_number: params.admission_number,
      class_division: params.class_division,
      session_id: params.session_id,
      event_type: params.event_type,
      verification_method: params.verification_method,
      timestamp: isoTimestamp,
      local_timestamp: localTime,
      device_serial: params.device_serial || 'OFFLINE-TERMINAL',
      device_name: params.device_name || 'Campus Gate Terminal (Offline)',
      confidence_score: params.confidence_score || 0.99,
      status: 'PENDING',
      retry_count: 0
    };

    this.queue.unshift(record);
    // Persist to IndexedDB
    this.idbStore.put(record);
    this.notify();

    // If online, attempt immediate sync
    if (this.onlineStatus) {
      this.syncQueue();
    }

    return record;
  }

  /**
   * Synchronize pending records to Supabase / Backend Bridge
   * IMPORTANT: Never mark offline records as cloud-synchronized until Supabase confirms successful persistence.
   */
  async syncQueue(): Promise<{
    synced: number;
    duplicateResolved: number;
    failed: number;
    totalPending: number;
  }> {
    if (this.currentSyncPromise) {
      return this.currentSyncPromise;
    }

    if (!this.onlineStatus) {
      return { synced: 0, duplicateResolved: 0, failed: 0, totalPending: this.getPendingCount() };
    }

    const pending = this.queue.filter((r) => r.status === 'PENDING' || r.status === 'FAILED');
    if (pending.length === 0) {
      return { synced: 0, duplicateResolved: 0, failed: 0, totalPending: 0 };
    }

    this.isSyncing = true;
    this.currentSyncPromise = this.performSync(pending);
    try {
      const result = await this.currentSyncPromise;
      return result;
    } finally {
      this.isSyncing = false;
      this.currentSyncPromise = null;
    }
  }

  private async performSync(pending: OfflineAttendanceRecord[]): Promise<{
    synced: number;
    duplicateResolved: number;
    failed: number;
    totalPending: number;
  }> {
    let synced = 0;
    let duplicateResolved = 0;
    let failed = 0;

    for (const record of pending) {
      record.status = 'SYNCING';
      record.last_attempt = new Date().toISOString();
      record.retry_count += 1;
      this.idbStore.put(record);
      this.notify();

      try {
        let confirmed = false;
        let eventId: string | undefined;

        // Try direct Supabase if configured
        if (isSupabaseConfigured && supabase) {
          const punchDate = record.timestamp.split('T')[0];

          // 1. Conflict/Deduplication Check in Cloud:
          // Check if record was already persisted or if attendance event already recorded for student on punchDate
          const { data: existingEvents, error: checkErr } = await (supabase.from('attendance_events') as any)
            .select('id, event_timestamp, raw_payload')
            .eq('student_id', record.student_id)
            .gte('event_timestamp', `${punchDate}T00:00:00.000Z`)
            .lte('event_timestamp', `${punchDate}T23:59:59.999Z`)
            .limit(1);

          if (!checkErr && existingEvents && existingEvents.length > 0) {
            // Found existing cloud event for this student on this day
            record.status = 'DUPLICATE_RESOLVED';
            record.cloud_event_id = existingEvents[0].id;
            record.synced_at = new Date().toISOString();
            record.sync_error = undefined;
            duplicateResolved++;
            confirmed = true;
          } else {
            // 2. Insert new event into Supabase attendance_events
            const { data: insertResult, error: insertErr } = await (supabase.from('attendance_events') as any)
              .insert([
                {
                  school_id: record.school_id,
                  student_id: record.student_id,
                  session_id: record.session_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                  event_type: record.event_type,
                  event_timestamp: record.timestamp,
                  local_timestamp: record.local_timestamp,
                  verification_method: record.verification_method,
                  confidence_score: record.confidence_score,
                  raw_payload: {
                    is_offline_sync: true,
                    original_offline_id: record.id,
                    device_serial: record.device_serial,
                    device_name: record.device_name,
                    synced_at: new Date().toISOString()
                  }
                }
              ])
              .select('id');

            if (!insertErr && insertResult && insertResult.length > 0) {
              eventId = insertResult[0].id;
              confirmed = true;

              // 3. Upsert into daily_attendance to ensure daily record is preserved with official timing rules
              try {
                const evaluation = evaluateAttendanceRecord({
                  arrivalTime: record.local_timestamp,
                  method: record.verification_method,
                  isOffline: true
                });

                await (supabase.from('daily_attendance') as any).upsert(
                  {
                    school_id: record.school_id,
                    student_id: record.student_id,
                    attendance_date: punchDate,
                    session_id: record.session_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    status: evaluation.status,
                    first_arrival_time: record.local_timestamp,
                    first_verification_method: record.verification_method,
                    is_late: evaluation.isLate,
                    minutes_late: evaluation.minutesLate,
                    remarks: `Offline arrival verified (${record.device_serial}) - ${evaluation.remarks}`,
                    reconciled_at: new Date().toISOString()
                  },
                  { onConflict: 'student_id,attendance_date,session_id' }
                );
              } catch {
                // Non-fatal if session constraint differs
              }
            } else if (insertErr) {
              // If conflict error (e.g. unique constraint 23505)
              if (insertErr.code === '23505' || insertErr.message?.includes('duplicate')) {
                record.status = 'DUPLICATE_RESOLVED';
                record.cloud_event_id = `cloud-dup-${Date.now()}`;
                record.synced_at = new Date().toISOString();
                duplicateResolved++;
                confirmed = true;
              } else {
                throw new Error(insertErr.message || 'Supabase insert error');
              }
            }
          }
        } else {
          // If Supabase not reachable directly, try Device Bridge batch sync endpoint
          try {
            const bridgeRes = await fetch('http://localhost:8002/api/v1/devices/offline-batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                records: [
                  {
                    id: record.id,
                    school_id: record.school_id,
                    student_id: record.student_id,
                    student_name: record.student_name,
                    admission_number: record.admission_number,
                    device_serial: record.device_serial,
                    verification_method: record.verification_method,
                    timestamp: record.timestamp,
                    local_timestamp: record.local_timestamp,
                    event_type: record.event_type
                  }
                ]
              })
            });

            if (bridgeRes.ok) {
              const resData = await bridgeRes.json();
              if (resData.persisted_ids?.includes(record.id)) {
                confirmed = true;
                eventId = `bridge-${Date.now()}`;
              }
            }
          } catch {
            throw new Error('Cloud persistence unconfirmed: remote gateway unreachable');
          }
        }

        // IMPORTANT: Only mark as SYNCED when persistence was confirmed!
        if (confirmed) {
          if (record.status !== 'DUPLICATE_RESOLVED') {
            record.status = 'SYNCED';
            record.cloud_event_id = eventId;
            record.synced_at = new Date().toISOString();
            record.sync_error = undefined;
            synced++;
          }
        } else {
          record.status = 'FAILED';
          record.sync_error = 'Persistence could not be verified by cloud gateway';
          failed++;
        }
      } catch (err: any) {
        // Leave in queue as FAILED so it can be retried
        record.status = 'FAILED';
        record.sync_error = err.message || 'Network sync failed';
        failed++;
      }

      await this.idbStore.put(record);
    }

    this.isSyncing = false;
    this.notify();

    return {
      synced,
      duplicateResolved,
      failed,
      totalPending: this.getPendingCount()
    };
  }

  getPendingCount(): number {
    return this.queue.filter((r) => r.status === 'PENDING' || r.status === 'FAILED' || r.status === 'SYNCING').length;
  }

  getSyncedCount(): number {
    return this.queue.filter((r) => r.status === 'SYNCED' || r.status === 'DUPLICATE_RESOLVED').length;
  }

  getPendingRecords(): OfflineAttendanceRecord[] {
    return this.queue.filter((r) => r.status === 'PENDING' || r.status === 'FAILED' || r.status === 'SYNCING');
  }

  getSyncedRecords(): OfflineAttendanceRecord[] {
    return this.queue.filter((r) => r.status === 'SYNCED' || r.status === 'DUPLICATE_RESOLVED');
  }

  getAllRecords(): OfflineAttendanceRecord[] {
    return [...this.queue];
  }

  /**
   * Safe Eviction Guarantee (Instruction 8):
   * Queued records are removed ONLY after successful database persistence.
   * If an unconfirmed or pending record is requested to be evicted, this method strictly throws or rejects.
   */
  evictRecord(id: string): { success: boolean; message: string } {
    const record = this.queue.find((r) => r.id === id);
    if (!record) {
      return { success: false, message: 'Record not found in offline queue' };
    }

    const isConfirmed = (record.status === 'SYNCED' || record.status === 'DUPLICATE_RESOLVED') && Boolean(record.cloud_event_id);
    if (!isConfirmed) {
      throw new Error(
        `Safety Violation: Cannot evict record "${id}" with status "${record.status}". Queued records are removed ONLY after successful cloud database persistence.`
      );
    }

    this.queue = this.queue.filter((r) => r.id !== id);
    this.idbStore.delete(id);
    this.notify();
    return { success: true, message: `Record "${id}" safely evicted after verified persistence (${record.cloud_event_id}).` };
  }

  /**
   * Clear confirmed records: Only removes records with verified cloud persistence.
   * All PENDING, SYNCING, and FAILED records are strictly preserved.
   */
  clearSyncedRecords(): { evictedCount: number } {
    const confirmed = this.queue.filter(
      (r) => (r.status === 'SYNCED' || r.status === 'DUPLICATE_RESOLVED') && Boolean(r.cloud_event_id)
    );

    for (const rec of confirmed) {
      this.idbStore.delete(rec.id);
    }

    this.queue = this.queue.filter(
      (r) => r.status !== 'SYNCED' && r.status !== 'DUPLICATE_RESOLVED'
    );

    this.notify();
    return { evictedCount: confirmed.length };
  }

  /**
   * Reset local queue (for test harness cleanup only)
   */
  resetForTesting() {
    this.queue = [];
    this.onlineStatus = true;
    this.isSyncing = false;
    this.notify();
  }
}

export const offlineManager = new OfflineAttendanceManager();

if (typeof window !== 'undefined') {
  (window as any).offlineManager = offlineManager;
}
