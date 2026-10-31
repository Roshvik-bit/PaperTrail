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
      <div className="p-12 text-center rounded-xl border border-dashed border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
        <Shuffle className="w-10 h-10 text-[#777873] mx-auto mb-3" />
        <h4 className="font-serif text-lg font-semibold text-[#252622]">No Cross-Domain Transfers Detected</h4>
        <p className="text-xs text-[#777873] max-w-md mx-auto mt-1 font-sans">
          PaperTrail evaluates shared physical phenomena, variables, and analogies across disciplines to produce candidate interdisciplinary hypotheses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E1D9]">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#252622] flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-[#858B70]" />
            <span>Cross-Domain Scientific Connections</span>
          </h3>
          <p className="text-xs text-[#777873] mt-0.5 font-sans">
            Surfacing structural analogies, shared mechanisms, and methodological transfers between primary research and adjacent scientific fields.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] self-start sm:self-auto">
          {connections.length} candidate connection{connections.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className="p-6 rounded-xl border border-[#E3E1D9] bg-[#FDFCF9] hover:border-[#CCC8BC] transition-all space-y-4 shadow-paper"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E3E1D9] text-xs">
              <span className="px-2.5 py-0.5 rounded font-mono font-bold uppercase bg-[#FAF8F3] text-[#252622] border border-[#CCC8BC] text-[10px]">
                {conn.status.replace(/_/g, ' ')}
              </span>
              <span className="font-mono text-[#777873] text-[11px]">
                Transfer Plausibility: {(conn.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Disciplines */}
            <div className="flex items-center gap-3 text-xs font-mono font-semibold">
              <span className="px-2.5 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">{conn.source_domain}</span>
              <ArrowRight className="w-4 h-4 text-[#B96645] shrink-0" />
              <span className="px-2.5 py-1 rounded bg-[#858B70]/15 border border-[#858B70]/30 text-[#5A6048]">{conn.target_domain}</span>
            </div>

            {/* Shared Phenomenon */}
            <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs space-y-1">
              <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider block font-semibold">
                Shared Underlying Phenomenon:
              </span>
              <p className="font-serif text-base font-semibold text-[#252622] leading-snug">
                {conn.shared_phenomenon}
              </p>
            </div>

            {/* Formulated Hypothesis */}
            <div className="p-3.5 rounded-lg bg-[#858B70]/10 border border-[#858B70]/30 text-xs space-y-1">
              <span className="text-[10px] font-mono text-[#5A6048] uppercase tracking-wider block font-bold">
                Transferred Testable Hypothesis:
              </span>
              <p className="font-serif text-base font-medium text-[#252622] italic leading-relaxed">
                &ldquo;{conn.hypothesis_statement}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
