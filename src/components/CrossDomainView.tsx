'use client';

import React from 'react';
import { CrossDomainConnection } from '@/types';
import { Network, Shuffle, ArrowRight, Lightbulb, HelpCircle, Layers } from 'lucide-react';

interface Props {
  connections: CrossDomainConnection[];
}

export function CrossDomainView({ connections }: Props) {
  if (connections.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface">
        <Shuffle className="w-10 h-10 text-content-muted mx-auto mb-3" />
        <h4 className="text-base font-semibold text-content-primary">No Cross-Domain Transfers Detected</h4>
        <p className="text-xs text-content-secondary max-w-md mx-auto mt-1">
          PaperTrail evaluates shared physical phenomena, variables, and analogies across disciplines to produce candidate interdisciplinary hypotheses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-content-primary flex items-center space-x-2">
            <Shuffle className="w-5 h-5 text-purple-400" />
            <span>Cross-Domain Scientific Connections</span>
          </h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Surfacing structural analogies, shared mechanisms, and methodological transfers between Edge AI and adjacent scientific fields.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-surface border border-border text-content-secondary">
          {connections.length} candidate connection{connections.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className="p-5 rounded-xl border border-border bg-surface hover:border-purple-400/40 transition-all space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border text-xs">
              <span className="px-2.5 py-0.5 rounded font-mono font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {conn.status.replace(/_/g, ' ')}
              </span>
              <span className="font-mono text-content-muted text-[11px]">
                Transfer Plausibility: {(conn.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Disciplines */}
            <div className="flex items-center space-x-3 text-xs font-mono font-semibold">
              <span className="text-secondary">{conn.source_domain}</span>
              <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-accent">{conn.target_domain}</span>
            </div>

            {/* Shared Phenomenon */}
            <div className="p-3 rounded-lg bg-surface-elevated border border-border text-xs space-y-1">
              <span className="text-[10px] font-mono text-content-muted uppercase block font-semibold">
                Shared Underlying Phenomenon:
              </span>
              <p className="font-medium text-content-primary leading-snug">
                {conn.shared_phenomenon}
              </p>
            </div>

            {/* Hypothesis statement */}
            <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-purple-400 font-mono text-[10px] uppercase font-bold">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Interdisciplinary Transfer Hypothesis:</span>
              </div>
              <p className="text-content-primary italic leading-relaxed">
                "{conn.hypothesis_statement}"
              </p>
            </div>

            {/* Terminology mapping */}
            {conn.differing_terminology && conn.differing_terminology.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-content-muted uppercase block">
                  Cross-Disciplinary Terminology Alignment:
                </span>
                <div className="rounded border border-border divide-y divide-border overflow-hidden bg-background/50 font-mono text-[11px]">
                  {conn.differing_terminology.map((t, i) => (
                    <div key={i} className="p-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="text-secondary">{t.source_term}</span>
                      <span className="text-accent">{t.target_term}</span>
                      <span className="text-content-muted text-[10px]">{t.context}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
