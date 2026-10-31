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
        return <FileText className="w-4 h-4 text-[#858B70]" />;
      case 'CLAIM_CONFLICT_DETECTED':
        return <AlertTriangle className="w-4 h-4 text-[#B96645]" />;
      case 'GAP_REASSESSED':
        return <Sparkles className="w-4 h-4 text-[#B96645]" />;
      case 'RETRACTION_REGISTERED':
        return <ShieldAlert className="w-4 h-4 text-[#B96645]" />;
      default:
        return <GitCommit className="w-4 h-4 text-[#252622]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with trigger button */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#252622] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#858B70]" />
            <span>Continuous Research Tracking & Evidence Evolution</span>
          </h3>
          <p className="text-xs text-[#777873] mt-0.5 font-sans">
            Tracking how scientific claims, agreements, qualifications, and research gaps shift over time as new research appears.
          </p>
        </div>

        <button
          onClick={handleCheck}
          disabled={checking}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#252622] text-[#FDFCF9] hover:bg-[#383A34] disabled:opacity-50 transition-all shadow-[0_1px_2px_rgba(37,38,34,0.06)] active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#EFECE5] ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking TinyMonitor & Index...' : 'Check For New Research & Update Timeline'}</span>
        </button>
      </div>

      {/* Timeline Stream */}
      {events.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
          <Clock className="w-10 h-10 text-[#777873] mx-auto mb-3" />
          <h4 className="font-serif text-lg font-semibold text-[#252622]">No Evolution Events Recorded Yet</h4>
          <p className="text-xs text-[#777873] max-w-md mx-auto mt-1 font-sans">
            Click &ldquo;Check For New Research&rdquo; above to query TinyFish Monitor and scholarly providers for continuous research shifts.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E3E1D9]">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#FAF8F3] border-2 border-[#858B70] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#858B70]" />
              </div>

              {/* Event Card */}
              <div className="p-5 rounded-xl border border-[#E3E1D9] bg-[#FDFCF9] hover:border-[#CCC8BC] transition-all space-y-2 shadow-paper">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    {getEventIcon(event.event_type)}
                    <span className="font-semibold text-[#252622] uppercase tracking-wide">
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-[#777873] text-[11px]">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-[#252622] leading-relaxed font-sans">
                  {event.description}
                </p>

                {event.impact_summary?.evolution_delta && (
                  <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs space-y-1">
                    <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold">
                      Provenance & Impact Summary:
                    </span>
                    <p className="font-serif text-sm text-[#252622] italic leading-relaxed">
                      {event.impact_summary.evolution_delta}
                    </p>
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
