'use client';

import React from 'react';
import { PaperLineage } from '@/types';
import { GitCompare, ArrowRight, CheckCircle2, FileText, HelpCircle, BookOpen } from 'lucide-react';

interface Props {
  lineages: PaperLineage[];
}

export function PreprintLineageView({ lineages }: Props) {
  if (lineages.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
        <GitCompare className="w-10 h-10 text-[#777873] mx-auto mb-3" />
        <h4 className="font-serif text-lg font-semibold text-[#252622]">No Preprint-to-Publication Lineages Detected</h4>
        <p className="text-xs text-[#777873] max-w-md mx-auto mt-1 font-sans">
          PaperTrail continuously cross-references early preprints with eventual peer-reviewed proceedings in Crossref and OpenAlex while preserving version distinctions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E1D9]">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#252622] flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#858B70]" />
            <span>Preprint-to-Publication Lineage Mapping</span>
          </h3>
          <p className="text-xs text-[#777873] mt-0.5 font-sans">
            Tracing early arXiv preprints to their final peer-reviewed conference or journal publications without prematurely merging differing methodologies.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] self-start sm:self-auto">
          {lineages.length} verified lineage{lineages.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {lineages.map((lineage) => (
          <div
            key={lineage.id}
            className="p-6 rounded-xl border border-[#E3E1D9] bg-[#FDFCF9] hover:border-[#CCC8BC] transition-all space-y-4 shadow-paper"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E3E1D9] text-xs">
              <span className="px-2.5 py-0.5 rounded font-mono font-semibold bg-[#858B70]/15 text-[#5A6048] border border-[#858B70]/30 uppercase text-[10px]">
                Lineage Confirmed ({(lineage.confidence * 100).toFixed(0)}%)
              </span>
              <div className="flex items-center gap-4 font-mono text-[#777873] text-[11px]">
                <span>Title Match: {(lineage.match_evidence.title_similarity * 100).toFixed(0)}%</span>
                <span>Author Overlap: {(lineage.match_evidence.author_overlap * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Side-by-side versions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-1.5">
                <span className="text-[10px] font-mono text-[#777873] uppercase font-bold block tracking-wider">
                  Original Preprint ({lineage.preprint_venue})
                </span>
                <h5 className="font-serif text-sm font-semibold text-[#252622]">{lineage.preprint_title}</h5>
              </div>

              <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-1.5">
                <span className="text-[10px] font-mono text-[#858B70] uppercase font-bold block tracking-wider">
                  Formal Publication ({lineage.published_venue})
                </span>
                <h5 className="font-serif text-sm font-semibold text-[#252622]">{lineage.published_title}</h5>
              </div>
            </div>

            {/* Methodology & Findings Differences */}
            {(lineage.methodology_diff || lineage.findings_diff) && (
              <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-1.5 text-xs">
                <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold">
                  Methodology & Benchmark Refinements:
                </span>
                {lineage.methodology_diff && (
                  <p className="text-[#252622] font-sans">
                    <span className="font-semibold text-[#858B70]">Methodology Shift:</span> {lineage.methodology_diff}
                  </p>
                )}
                {lineage.findings_diff && (
                  <p className="text-[#252622] font-sans">
                    <span className="font-semibold text-[#B96645]">Findings Shift:</span> {lineage.findings_diff}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
