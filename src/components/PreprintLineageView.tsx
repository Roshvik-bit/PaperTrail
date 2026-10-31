'use client';

import React from 'react';
import { PaperLineage } from '@/types';
import { GitCompare, ArrowRight, CheckCircle2, FileText, HelpCircle } from 'lucide-react';

interface Props {
  lineages: PaperLineage[];
}

export function PreprintLineageView({ lineages }: Props) {
  if (lineages.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface">
        <GitCompare className="w-10 h-10 text-content-muted mx-auto mb-3" />
        <h4 className="text-base font-semibold text-content-primary">No Preprint-to-Publication Lineages Detected</h4>
        <p className="text-xs text-content-secondary max-w-md mx-auto mt-1">
          PaperTrail continuously cross-references arXiv preprints with eventual peer-reviewed proceedings in Crossref and OpenAlex.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-content-primary flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-secondary" />
            <span>Preprint-to-Publication Lineage Mapping</span>
          </h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Tracing early arXiv preprints to their final peer-reviewed conference or journal publications without prematurely merging differing versions.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-surface border border-border text-content-secondary">
          {lineages.length} verified lineage{lineages.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {lineages.map((lineage) => (
          <div
            key={lineage.id}
            className="p-5 rounded-xl border border-border bg-surface hover:border-secondary/40 transition-all space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border text-xs">
              <span className="px-2.5 py-0.5 rounded font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30 uppercase">
                Lineage Confirmed ({(lineage.confidence * 100).toFixed(0)}%)
              </span>
              <div className="flex items-center space-x-4 font-mono text-content-muted text-[11px]">
                <span>Title Match: {(lineage.match_evidence.title_similarity * 100).toFixed(0)}%</span>
                <span>Author Overlap: {(lineage.match_evidence.author_overlap * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Side-by-side versions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
                  Original Preprint ({lineage.preprint_venue})
                </span>
                <h5 className="text-sm font-semibold text-content-primary">{lineage.preprint_title}</h5>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono text-accent uppercase font-bold block">
                  Formal Publication ({lineage.published_venue})
                </span>
                <h5 className="text-sm font-semibold text-content-primary">{lineage.published_title}</h5>
              </div>
            </div>

            {/* Diffs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded bg-background/50 border border-border">
                <span className="text-content-muted block text-[10px] uppercase">Methodology Shifts:</span>
                <p className="text-content-secondary mt-1">{lineage.methodology_diff || 'Consistent methodology across versions.'}</p>
              </div>
              <div className="p-3 rounded bg-background/50 border border-border">
                <span className="text-content-muted block text-[10px] uppercase">Findings & Benchmark Refinement:</span>
                <p className="text-content-secondary mt-1">{lineage.findings_diff || 'Results corroborated in final peer review.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

