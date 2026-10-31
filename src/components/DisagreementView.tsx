'use client';

import React from 'react';
import { EvidenceRelationship } from '@/types';
import { RelationshipBadge, ClaimTypeBadge } from './Badges';
import { 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  Cpu, 
  ArrowRightLeft, 
  ShieldCheck, 
  AlertTriangle,
  Scale,
  Sparkles,
  GitCompare
} from 'lucide-react';

interface Props {
  disagreements: EvidenceRelationship[];
}

export function DisagreementView({ disagreements }: Props) {
  if (disagreements.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
        <Scale className="w-10 h-10 text-[#777873] mx-auto mb-3" />
        <h3 className="font-serif text-lg font-semibold text-[#252622]">No Conflicting Evidence Identified</h3>
        <p className="text-xs text-[#777873] max-w-md mx-auto mt-1 font-sans">
          Execute multi-provider literature retrieval and claim extraction across papers to isolate potential empirical divergences and parameter boundaries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E1D9]">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#252622] flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#B96645]" />
            <span>Context-Aware Disagreement Investigation</span>
          </h3>
          <p className="text-xs text-[#777873] mt-0.5 font-sans">
            Rigorously distinguishing apparent contradictions (caused by hardware, precision, context length, or thermal boundaries) from genuine scientific conflicts.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] self-start sm:self-auto">
          {disagreements.length} relationship{disagreements.length > 1 ? 's' : ''} evaluated
        </span>
      </div>

      {/* Disagreements List */}
      <div className="grid grid-cols-1 gap-6">
        {disagreements.map((rel) => {
          const comp = rel.context_comparison;
          const isGenuine = comp?.is_genuine_contradiction ?? false;

          return (
            <div
              key={rel.id}
              className={`rounded-xl border p-6 bg-[#FDFCF9] shadow-paper transition-all ${
                isGenuine
                  ? 'border-[#B96645] bg-[#FDFCF9]'
                  : 'border-[#E3E1D9] hover:border-[#CCC8BC]'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#E3E1D9]">
                <div className="flex items-center gap-3">
                  <RelationshipBadge type={rel.relationship_type} />
                  <span className="text-xs font-mono text-[#777873]">
                    Confidence: {(rel.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isGenuine ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#B96645]/15 text-[#B96645] border border-[#B96645]/30 text-xs font-mono font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>GENUINE SCIENTIFIC CONTRADICTION</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#858B70]/15 text-[#5A6048] border border-[#858B70]/30 text-xs font-mono font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>APPARENT CONTRADICTION (EXPERIMENTAL DIFFERENCE)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-side Evidence Claims */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                {/* Observation A */}
                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#858B70] uppercase font-semibold tracking-wider">
                      Observation A
                    </span>
                    {rel.source_claim && <ClaimTypeBadge type={rel.source_claim.claim_type} />}
                  </div>
                  <p className="font-serif text-sm font-medium text-[#252622] leading-relaxed italic">
                    &ldquo;{rel.source_claim?.claim_text || 'Claim assertion'}&rdquo;
                  </p>
                  <div className="p-2.5 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[11px] text-[#777873] font-mono leading-relaxed">
                    <span className="text-[9px] text-[#9D9E99] block uppercase tracking-wider font-semibold mb-0.5">
                      Grounding Passage:
                    </span>
                    {rel.source_claim?.supporting_passage || 'Verbatim document excerpt'}
                  </div>
                </div>

                {/* Observation B */}
                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#B96645] uppercase font-semibold tracking-wider">
                      Observation B (Contrasting)
                    </span>
                    {rel.target_claim && <ClaimTypeBadge type={rel.target_claim.claim_type} />}
                  </div>
                  <p className="font-serif text-sm font-medium text-[#252622] leading-relaxed italic">
                    &ldquo;{rel.target_claim?.claim_text || 'Target assertion'}&rdquo;
                  </p>
                  <div className="p-2.5 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[11px] text-[#777873] font-mono leading-relaxed">
                    <span className="text-[9px] text-[#9D9E99] block uppercase tracking-wider font-semibold mb-0.5">
                      Grounding Passage:
                    </span>
                    {rel.target_claim?.supporting_passage || 'Verbatim document excerpt'}
                  </div>
                </div>
              </div>

              {/* Context Difference Matrix */}
              {comp && (
                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#777873] font-semibold flex items-center gap-1.5">
                      <GitCompare className="w-3.5 h-3.5 text-[#B96645]" />
                      <span>Experimental Divergence Analysis</span>
                    </span>
                  </div>

                  {/* Differences Table */}
                  {comp.differences && comp.differences.length > 0 && (
                    <div className="rounded-lg border border-[#E3E1D9] bg-[#FDFCF9] overflow-hidden">
                      <div className="px-3.5 py-2 bg-[#FAF8F3] border-b border-[#E3E1D9] flex items-center gap-2 text-[11px] font-mono font-semibold text-[#777873]">
                        <Cpu className="w-3.5 h-3.5 text-[#858B70]" />
                        <span>Experimental Variable Divergences</span>
                      </div>
                      <div className="divide-y divide-[#E3E1D9]">
                        {comp.differences.map((diff, idx) => (
                          <div key={idx} className="p-2.5 text-xs font-mono grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="text-[#252622] font-semibold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                              <span>{diff.variable}</span>
                            </div>
                            <div className="text-[#777873]">Obs A: {diff.source_val}</div>
                            <div className="text-[#B96645]">Obs B: {diff.target_val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary / Explanation */}
                  <p className="text-xs text-[#252622] leading-relaxed font-sans bg-[#FDFCF9] p-3 rounded border border-[#E3E1D9]">
                    {rel.supporting_evidence}
                  </p>

                  {/* Remaining Empirical Uncertainty */}
                  {comp.remaining_uncertainty && (
                    <div className="p-3 rounded bg-[#858B70]/10 border border-[#858B70]/25 text-xs">
                      <span className="font-mono text-[10px] text-[#5A6048] uppercase tracking-wider block font-semibold mb-1">
                        Empirical Boundary Assessment:
                      </span>
                      <p className="font-serif text-sm text-[#252622] italic leading-relaxed">
                        {comp.remaining_uncertainty}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
