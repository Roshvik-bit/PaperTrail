'use client';

import React, { useState } from 'react';
import { EvidenceEvolutionEvent } from '@/types';
import { Clock, RefreshCw, Sparkles, AlertTriangle, Layers, GitCommit, FileText, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  sessionId: string;
  events: EvidenceEvolutionEvent[];
  onCheckEvolution: () => Promise<void>;
}

export function TimelineEvolutionView({ sessionId, events, onCheckEvolution }: Props) {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    try {
      setChecking(true);
      await onCheckEvolution();
    } catch (err: any) {
      alert(`Evolution check notice: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  const getEventIcon = (type: EvidenceEvolutionEvent['event_type']) => {
    switch (type) {
      case 'NEW_PUBLICATION_INGESTED':
        return <FileText className="w-4 h-4 text-secondary" />;
      case 'CLAIM_CONFLICT_DETECTED':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'GAP_REASSESSED':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'RETRACTION_REGISTERED':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <GitCommit className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with trigger button */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface">
        <div>
          <h3 className="text-lg font-bold text-content-primary flex items-center space-x-2">
            <Clock className="w-5 h-5 text-accent" />
            <span>Evidence Evolution Timeline</span>
          </h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Tracking how scientific claims, agreements, qualifications, and research gaps shift over time as new research appears.
          </p>
        </div>

        <button
          onClick={handleCheck}
          disabled={checking}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-background hover:bg-accent-hover disabled:opacity-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking TinyMonitor & Index...' : 'Check For New Research & Update Timeline'}</span>
        </button>
      </div>

      {/* Timeline Stream */}
      {events.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface">
          <Clock className="w-10 h-10 text-content-muted mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-content-primary">No Evolution Events Recorded Yet</h4>
          <p className="text-xs text-content-secondary max-w-sm mx-auto mt-1">
            Click "Check For New Research" to poll scholarly sources and see how new evidence alters the existing knowledge graph.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {events.map((event, idx) => (
            <div key={event.id || idx} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shadow-md group-hover:border-accent transition-colors">
                {getEventIcon(event.event_type)}
              </div>

              {/* Event Card */}
              <div className="p-5 rounded-xl bg-surface border border-border hover:border-border-highlight transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-accent text-[11px] font-semibold uppercase">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-content-muted text-[10px]">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-content-primary">
                  {event.title}
                </h4>

                <p className="text-xs text-content-secondary leading-relaxed">
                  {event.description}
                </p>

                {event.impact_summary && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-[11px] font-mono text-content-muted">
                    {event.impact_summary.new_claims_count !== undefined && (
                      <span>+ {event.impact_summary.new_claims_count} Grounded Claims</span>
                    )}
                    {event.impact_summary.gap_updates && event.impact_summary.gap_updates.length > 0 && (
                      <span className="text-purple-400">
                        {event.impact_summary.gap_updates.length} Gap Re-evaluation(s)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

