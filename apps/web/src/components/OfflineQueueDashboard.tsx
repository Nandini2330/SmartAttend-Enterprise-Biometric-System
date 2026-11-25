import React, { useState, useEffect } from 'react';
import {
  Database,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Server,
  XCircle,
  Filter
} from 'lucide-react';
import { offlineManager } from '../lib/offline-manager';
import type { OfflineAttendanceRecord, OfflineRecordStatus } from '@smartattend/shared-types';

export const OfflineQueueDashboard: React.FC = () => {
  const [, setTick] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [inspectedRecord, setInspectedRecord] = useState<OfflineAttendanceRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    return offlineManager.subscribe(() => setTick((t) => t + 1));
  }, []);

  const isOnline = offlineManager.isOnline();
  const storageEngine = offlineManager.getStorageEngine();
  const allRecords = offlineManager.getAllRecords();
  const pendingRecords = offlineManager.getPendingRecords();
  const syncedRecords = offlineManager.getSyncedRecords();
  const duplicateResolved = allRecords.filter((r) => r.status === 'DUPLICATE_RESOLVED');
  const failedRecords = allRecords.filter((r) => r.status === 'FAILED');

  const filteredRecords = allRecords.filter((r) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return r.status === 'PENDING' || r.status === 'SYNCING';
    if (filterStatus === 'SYNCED') return r.status === 'SYNCED';
    if (filterStatus === 'DUPLICATE_RESOLVED') return r.status === 'DUPLICATE_RESOLVED';
    if (filterStatus === 'FAILED') return r.status === 'FAILED';
    return true;
  });

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await offlineManager.syncQueue();
      setSyncFeedback(
        `Sync complete: ${res.synced} persisted to Supabase, ${res.duplicateResolved} duplicates handled, ${res.failed} failed.`
      );
    } catch (err: any) {
      setSyncFeedback(`Sync encountered error: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleEvictConfirmed = () => {
    const { evictedCount } = offlineManager.clearSyncedRecords();
    setSyncFeedback(`Safely evicted ${evictedCount} confirmed records from IndexedDB storage.`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleEvictSingle = (id: string) => {
    try {
      const res = offlineManager.evictRecord(id);
      setSyncFeedback(res.message);
    } catch (err: any) {
      setSyncFeedback(err.message);
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OfflineRecordStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Pending Sync</span>
          </span>
        );
      case 'SYNCING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
            <span>Syncing</span>
          </span>
        );
      case 'SYNCED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Cloud Persisted</span>
          </span>
        );
      case 'DUPLICATE_RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            <span>Duplicate Resolved</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Sync Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Server className="w-3.5 h-3.5" />
                <span>Driver: {storageEngine} Persistent Store</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>{isOnline ? 'Online (Supabase Mumbai Gateway)' : 'Offline Simulation Active'}</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              Offline-First Attendance Queue & Conflict Resolution Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Browser-side IndexedDB buffer ensuring continuous attendance logging during internet outages. Records are evicted strictly after confirmed Supabase persistence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => offlineManager.setOnlineOverride(!isOnline)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isOnline ? 'Simulate Disconnect' : 'Restore Online'}
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline || pendingRecords.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                pendingRecords.length > 0 && isOnline
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Queue Now'}</span>
            </button>

            {syncedRecords.length > 0 && (
              <button
                onClick={handleEvictConfirmed}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
                title="Safely evicts only records with verified cloud confirmation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Confirmed</span>
              </button>
            )}
          </div>
        </div>

        {syncFeedback && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Metric Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Queued</span>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1 block">
              {allRecords.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Pending Sync</span>
            <span className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1 block">
              {pendingRecords.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Confirmed Persisted</span>
            <span className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-1 block">
              {syncedRecords.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40">
            <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">Duplicates Resolved</span>
            <span className="text-xl font-bold font-mono text-indigo-800 dark:text-indigo-300 mt-1 block">
              {duplicateResolved.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Sync Failed</span>
            <span className="text-xl font-bold font-mono text-rose-800 dark:text-rose-300 mt-1 block">
              {failedRecords.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Queue Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {['ALL', 'PENDING', 'SYNCED', 'DUPLICATE_RESOLVED', 'FAILED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterStatus === tab
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredRecords.length} of {allRecords.length} records
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Database className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-medium">No offline attendance records match the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5">Student Details</th>
                  <th className="py-2.5">Edge Timestamp</th>
                  <th className="py-2.5">Hardware Device</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Cloud Event ID</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((rec) => {
                  const isConfirmed =
                    (rec.status === 'SYNCED' || rec.status === 'DUPLICATE_RESOLVED') &&
                    Boolean(rec.cloud_event_id);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        <div>{rec.student_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rec.admission_number} • {rec.class_division}
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {rec.local_timestamp}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rec.timestamp.split('T')[0]}
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{rec.device_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rec.device_serial}</div>
                      </td>

                      <td className="py-3">
                        <span className="font-mono font-semibold text-[11px] text-indigo-600 dark:text-indigo-400">
                          {rec.verification_method}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {Math.round((rec.confidence_score || 0.99) * 100)}% match
                        </div>
                      </td>

                      <td className="py-3">{getStatusBadge(rec.status)}</td>

                      <td className="py-3 font-mono text-[11px] text-slate-500">
                        {rec.cloud_event_id ? (
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[120px]">{rec.cloud_event_id}</span>
                            <button
                              onClick={() => copyToClipboard(rec.cloud_event_id || '')}
                              className="text-slate-400 hover:text-indigo-600"
                              title="Copy Supabase ID"
                            >
                              {copiedId === rec.cloud_event_id ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        ) : rec.sync_error ? (
                          <span className="text-rose-500 text-[10px] line-clamp-1" title={rec.sync_error}>
                            {rec.sync_error}
                          </span>
                        ) : (
                          <span className="text-slate-400">Awaiting sync</span>
                        )}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectedRecord(rec)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Inspect Raw Payload"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {isConfirmed && (
                            <button
                              onClick={() => handleEvictSingle(rec.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Safely evict confirmed record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw Payload Inspector Modal */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>IndexedDB Raw Record Payload</span>
              </h3>
              <button
                onClick={() => setInspectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-80">
              {JSON.stringify(inspectedRecord, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
