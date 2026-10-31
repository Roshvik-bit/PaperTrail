'use client';

import React from 'react';
import { EvidenceRelationship } from '@/types';
import { RelationshipBadge, ClaimTypeBadge } from './Badges';
import { AlertCircle, HelpCircle, Layers, Cpu, ArrowRightLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  disagreements: EvidenceRelationship[];
}

export function DisagreementView({ disagreements }: Props) {
  if (disagreements.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface">
        <HelpCircle className="w-10 h-10 text-content-muted mx-auto mb-3" />
        <h3 className="text-base font-semibold text-content-primary">No Conflicting Evidence Identified</h3>
        <p className="text-sm text-content-secondary max-w-md mx-auto mt-1">
          Run analysis across multiple papers in the workspace to discover potential disagreements and experimental context variations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-content-primary flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-accent" />
            <span>Context-Aware Disagreement Investigations</span>
          </h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Differentiating apparent contradictions (driven by hardware and benchmark boundary variations) from genuine scientific conflicts.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-surface border border-border text-content-secondary">
          {disagreements.length} relationship{disagreements.length > 1 ? 's' : ''} evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {disagreements.map((rel) => {
          const comp = rel.context_comparison;
          const isGenuine = comp?.is_genuine_contradiction ?? false;

          return (
            <div
              key={rel.id}
              className={`rounded-xl border p-5 bg-surface transition-all ${
                isGenuine
                  ? 'border-red-500/40 bg-red-950/10'
                  : 'border-border hover:border-border-highlight'
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center space-x-3">
                  <RelationshipBadge type={rel.relationship_type} />
                  <span className="text-xs font-mono text-content-secondary">
                    Confidence: {(rel.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {isGenuine ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>GENUINE SCIENTIFIC CONTRADICTION</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>APPARENT CONTRADICTION (EXPERIMENTAL DIFFERENCE)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Side by side claims */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* Claim A */}
                <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-secondary uppercase font-semibold">
                      Observation A
                    </span>
                    {rel.source_claim && <ClaimTypeBadge type={rel.source_claim.claim_type} />}
                  </div>
                  <p className="text-sm text-content-primary font-medium leading-snug">
                    "{rel.source_claim?.claim_text || 'Claim assertion'}"
                  </p>
                  <div className="p-2 rounded bg-background/50 border border-border text-[11px] text-content-secondary font-mono">
                    <span className="text-[9px] text-content-muted block uppercase">Source Passage:</span>
                    {rel.source_claim?.supporting_passage || 'Document excerpt'}
                  </div>
                </div>

                {/* Claim B */}
                <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-accent uppercase font-semibold">
                      Observation B
                    </span>
                    {rel.target_claim && <ClaimTypeBadge type={rel.target_claim.claim_type} />}
                  </div>
                  <p className="text-sm text-content-primary font-medium leading-snug">
                    "{rel.target_claim?.claim_text || 'Contrasting assertion'}"
                  </p>
                  <div className="p-2 rounded bg-background/50 border border-border text-[11px] text-content-secondary font-mono">
                    <span className="text-[9px] text-content-muted block uppercase">Source Passage:</span>
                    {rel.target_claim?.supporting_passage || 'Document excerpt'}
                  </div>
                </div>
              </div>

              {/* Experimental Context Differences Table */}
              {comp && comp.differences && comp.differences.length > 0 && (
                <div className="my-4 rounded-lg border border-border bg-surface-elevated/60 overflow-hidden">
                  <div className="px-4 py-2 bg-surface-elevated border-b border-border flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-accent" />
                    <span className="text-xs font-mono font-semibold text-content-primary">
                      Experimental Condition Divergences
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {comp.differences.map((diff, idx) => (
                      <div key={idx} className="p-3 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="font-mono text-content-secondary flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>{diff.variable}</span>
                        </div>
                        <div className="text-secondary font-mono">{diff.source_val}</div>
                        <div className="text-accent font-mono">{diff.target_val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanations & Uncertainty */}
              <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                <div>
                  <span className="font-mono text-[10px] text-content-muted uppercase block">
                    Investigative Explanation:
                  </span>
                  <p className="text-content-secondary mt-0.5 leading-relaxed">
                    {rel.supporting_evidence}
                  </p>
                </div>

                {comp?.remaining_uncertainty && (
                  <div className="p-2.5 rounded bg-background/70 border border-border flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[10px] text-amber-400 font-semibold block uppercase">
                        Remaining Empirical Uncertainty:
                      </span>
                      <p className="text-content-secondary mt-0.5">
                        {comp.remaining_uncertainty}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
