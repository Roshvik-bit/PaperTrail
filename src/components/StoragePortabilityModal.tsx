'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  HardDrive,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileArchive,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';

interface StoragePortabilityModalProps {
  activeSessionId?: string;
  onSessionImported?: (sessionId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  showTriggerButton?: boolean;
}

export function StoragePortabilityModal({
  activeSessionId,
  onSessionImported,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  showTriggerButton = false,
}: StoragePortabilityModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };
  const handleOpen = () => setInternalIsOpen(true);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'CREATE_NEW' | 'MERGE' | 'REPLACE'>('CREATE_NEW');
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStorageStatus();
    }
  }, [isOpen]);

  const loadStorageStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/storage/status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setError(`Failed to fetch storage status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (action: 'CLOUD_TO_LOCAL' | 'LOCAL_TO_CLOUD') => {
    if (!activeSessionId) return;
    setSyncing(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/storage/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          sessionId: activeSessionId,
          overwriteConfirmed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setMessage(data.message || 'Synchronization complete.');
      await loadStorageStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImporting(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', importMode);
      formData.append('overwriteConfirmed', String(overwriteConfirmed));

      const res = await fetch('/api/research/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setMessage(
        `Successfully restored investigation! Imported ${data.result.imported_counts.papers} papers, ${data.result.imported_counts.claims} claims, and ${data.result.imported_counts.gaps} research gaps.`
      );
      setSelectedFile(null);
      await loadStorageStatus();

      if (onSessionImported && data.result?.session_id) {
        onSessionImported(data.result.session_id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <>
      {showTriggerButton && (
        <button
          onClick={handleOpen}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#FAF8F3] border border-[#E3E1D9] hover:border-[#CCC8BC] text-[#777873] hover:text-[#252622] transition-all"
          title="Research Storage, SQLite & Import"
        >
          <Database className="w-3.5 h-3.5 text-[#858B70]" />
          <span>Storage & Local DB</span>
          <span className="w-2 h-2 rounded-full bg-[#858B70]" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252622]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E3E1D9] flex items-center justify-between bg-[#FAF8F3]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#858B70]/10 border border-[#858B70]/20">
                  <Database className="w-5 h-5 text-[#858B70]" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-[#252622] text-lg">
                    Research Storage & Portability
                  </h3>
                  <p className="text-xs font-mono text-[#777873]">
                    Dual-Tier Cloud (Supabase) + Local-First (SQLite) Storage Architecture
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-[#777873] hover:text-[#252622] hover:bg-[#FDFCF9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {message && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cloud Status */}
                <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-xs font-semibold text-content-primary">
                      <Cloud className="w-4 h-4 text-sky-400" />
                      <span>Cloud Primary (Supabase)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {status?.current_storage?.cloud_connected ? 'CONNECTED' : 'STANDBY'}
                    </span>
                  </div>
                  <div className="text-xs text-content-muted space-y-1">
                    <div>
                      Active Sessions: <span className="font-semibold text-content-primary">{status?.current_storage?.active_sessions_count || 0}</span>
                    </div>
                    <div>
                      Indexed Papers: <span className="font-semibold text-content-primary">{status?.current_storage?.total_papers_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Local SQLite Status */}
                <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-xs font-semibold text-content-primary">
                      <HardDrive className="w-4 h-4 text-accent" />
                      <span>Local SQLite Store</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {status?.sqlite_available ? 'READY' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="text-xs text-content-muted space-y-1">
                    <div>
                      Database Size: <span className="font-semibold text-content-primary">{formatBytes(status?.sqlite_size_bytes)}</span>
                    </div>
                    <div>
                      Local Sessions: <span className="font-semibold text-content-primary">{status?.sqlite_sessions_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Action Section */}
              <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-content-primary">
                    Explicit Cloud $\leftrightarrow$ Local Synchronization
                  </div>
                  <button
                    onClick={loadStorageStatus}
                    disabled={loading}
                    className="p-1 rounded text-content-muted hover:text-content-primary transition-colors"
                    title="Refresh status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-[11px] text-content-muted">
                  Synchronize the active research investigation to your private, offline-accessible local SQLite database (.papertrail-data/papertrail.db).
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleSync('CLOUD_TO_LOCAL')}
                    disabled={syncing || !activeSessionId}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated border border-border hover:border-accent text-content-primary disabled:opacity-50 transition-all"
                  >
                    {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5 text-accent" />}
                    <span>Sync Active Session $\rightarrow$ Local SQLite</span>
                  </button>

                  <button
                    onClick={() => handleSync('LOCAL_TO_CLOUD')}
                    disabled={syncing || !activeSessionId}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated border border-border hover:border-sky-400 text-content-primary disabled:opacity-50 transition-all"
                  >
                    {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5 text-sky-400" />}
                    <span>Sync Local SQLite $\rightarrow$ Cloud</span>
                  </button>
                </div>
              </div>

              {/* Import Archive Section */}
              <form onSubmit={handleImportSubmit} className="p-4 rounded-xl border border-border bg-surface space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-content-primary">
                  <Upload className="w-4 h-4 text-accent" />
                  <span>Restore or Import PaperTrail Archive</span>
                </div>
                <p className="text-[11px] text-content-muted">
                  Upload a previously exported PaperTrail archive (.zip or .json) to restore research sessions, papers, claims, and verified gap falsification audits.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="file"
                    accept=".zip,.json"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="text-xs text-content-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-elevated file:text-content-primary hover:file:bg-accent/10 cursor-pointer w-full sm:w-auto"
                  />

                  <select
                    value={importMode}
                    onChange={(e: any) => setImportMode(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs text-content-primary focus:outline-none focus:border-accent"
                  >
                    <option value="CREATE_NEW">Create New Investigation</option>
                    <option value="MERGE">Merge with Existing</option>
                    <option value="REPLACE">Replace (Overwrites)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={importing || !selectedFile}
                    className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent text-background hover:bg-accent-hover disabled:opacity-50 transition-all shadow-sm shrink-0"
                  >
                    {importing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5" />}
                    <span>Import Archive</span>
                  </button>
                </div>

                {importMode === 'REPLACE' && (
                  <label className="flex items-center space-x-2 text-xs text-amber-300 pt-1">
                    <input
                      type="checkbox"
                      checked={overwriteConfirmed}
                      onChange={(e) => setOverwriteConfirmed(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>I confirm replacement of existing investigation data if an ID collision occurs.</span>
                  </label>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border bg-surface-elevated flex items-center justify-between text-[11px] text-content-muted">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Path-traversal and schema validation enforced. Secrets omitted.</span>
              </span>
              <button
                onClick={handleClose}
                className="px-4 py-1.5 rounded-lg bg-[#252622] text-[#FDFCF9] hover:bg-[#383A34] transition-colors text-xs font-mono font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

