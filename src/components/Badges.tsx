import React from 'react';
import { ClaimType, EvidenceRelationshipType, GapStatus, OpenAccessStatus } from '@/types';

export function ClaimTypeBadge({ type }: { type: ClaimType }) {
  const styles: Record<ClaimType, { bg: string; text: string; border: string }> = {
    FINDING: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    HYPOTHESIS: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    METHODOLOGY: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    LIMITATION: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    BENCHMARK_RESULT: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    THEORETICAL_BOUND: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  };

  const current = styles[type] || styles.FINDING;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${current.bg} ${current.text} ${current.border}`}>
      {type}
    </span>
  );
}

export function RelationshipBadge({ type }: { type: EvidenceRelationshipType }) {
  const styles: Record<EvidenceRelationshipType, { bg: string; text: string; border: string }> = {
    SUPPORTS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    CHALLENGES: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    CONTRADICTS: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    QUALIFIES: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    EXTENDS: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    REPLICATES: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
    PARTIALLY_REPLICATES: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    USES_SIMILAR_METHOD: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    DIFFERENT_EXPERIMENTAL_CONTEXT: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    INSUFFICIENT_EVIDENCE: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  };

  const current = styles[type] || styles.INSUFFICIENT_EVIDENCE;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}

export function GapStatusBadge({ status }: { status: GapStatus }) {
  const styles: Record<GapStatus, { bg: string; text: string; border: string; label: string }> = {
    CANDIDATE: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'CANDIDATE GAP' },
    RETAINED_CANDIDATE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'FALSIFICATION RESISTANT' },
    NARROWED_CANDIDATE: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'SCOPED & NARROWED' },
    EXISTING_WORK_FOUND: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'PRIOR WORK FOUND' },
    INSUFFICIENT_COVERAGE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'INCOMPLETE COVERAGE' },
    REQUIRES_HUMAN_REVIEW: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'REQUIRES EXPERT REVIEW' },
  };

  const current = styles[status] || styles.CANDIDATE;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold tracking-wide border ${current.bg} ${current.text} ${current.border}`}>
      {current.label}
    </span>
  );
}

export function OpenAccessBadge({ status }: { status: OpenAccessStatus }) {
  const isOA = status === 'gold' || status === 'green' || status === 'hybrid';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
        isOA
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-slate-800 text-slate-400 border-border'
      }`}
    >
      {isOA ? 'OPEN ACCESS' : 'RESTRICTED / CLOSED'}
    </span>
  );
}
