import React from 'react';
import { ClaimType, EvidenceRelationshipType, GapStatus, OpenAccessStatus } from '@/types';

export function ClaimTypeBadge({ type }: { type: ClaimType }) {
  const styles: Record<ClaimType, { bg: string; text: string; border: string }> = {
    FINDING: { bg: 'bg-[#858B70]/15', text: 'text-[#5A6048]', border: 'border-[#858B70]/30' },
    HYPOTHESIS: { bg: 'bg-[#B96645]/10', text: 'text-[#B96645]', border: 'border-[#B96645]/30' },
    METHODOLOGY: { bg: 'bg-[#EFECE5]', text: 'text-[#252622]', border: 'border-[#E3E1D9]' },
    LIMITATION: { bg: 'bg-[#B96645]/15', text: 'text-[#934E32]', border: 'border-[#B96645]/35' },
    BENCHMARK_RESULT: { bg: 'bg-[#FAF8F3]', text: 'text-[#777873]', border: 'border-[#CCC8BC]' },
    THEORETICAL_BOUND: { bg: 'bg-[#FAF8F3]', text: 'text-[#252622]', border: 'border-[#CCC8BC]' },
  };

  const current = styles[type] || styles.FINDING;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${current.bg} ${current.text} ${current.border}`}>
      {type}
    </span>
  );
}

export function RelationshipBadge({ type }: { type: EvidenceRelationshipType }) {
  const styles: Record<EvidenceRelationshipType, { bg: string; text: string; border: string }> = {
    SUPPORTS: { bg: 'bg-[#858B70]/15', text: 'text-[#5A6048]', border: 'border-[#858B70]/30' },
    CHALLENGES: { bg: 'bg-[#B96645]/15', text: 'text-[#B96645]', border: 'border-[#B96645]/35' },
    CONTRADICTS: { bg: 'bg-[#B96645]/20', text: 'text-[#934E32]', border: 'border-[#B96645]/40' },
    QUALIFIES: { bg: 'bg-[#FAF8F3]', text: 'text-[#777873]', border: 'border-[#E3E1D9]' },
    EXTENDS: { bg: 'bg-[#EFECE5]', text: 'text-[#252622]', border: 'border-[#CCC8BC]' },
    REPLICATES: { bg: 'bg-[#858B70]/15', text: 'text-[#5A6048]', border: 'border-[#858B70]/30' },
    PARTIALLY_REPLICATES: { bg: 'bg-[#858B70]/10', text: 'text-[#686E55]', border: 'border-[#858B70]/25' },
    USES_SIMILAR_METHOD: { bg: 'bg-[#FAF8F3]', text: 'text-[#252622]', border: 'border-[#E3E1D9]' },
    DIFFERENT_EXPERIMENTAL_CONTEXT: { bg: 'bg-[#B96645]/10', text: 'text-[#B96645]', border: 'border-[#B96645]/25' },
    INSUFFICIENT_EVIDENCE: { bg: 'bg-[#FAF8F3]', text: 'text-[#9D9E99]', border: 'border-[#E3E1D9]' },
  };

  const current = styles[type] || styles.INSUFFICIENT_EVIDENCE;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${current.bg} ${current.text} ${current.border}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}

export function GapStatusBadge({ status }: { status: GapStatus }) {
  const styles: Record<GapStatus, { bg: string; text: string; border: string; label: string }> = {
    CANDIDATE: { bg: 'bg-[#FAF8F3]', text: 'text-[#777873]', border: 'border-[#CCC8BC]', label: 'CANDIDATE RESEARCH GAP' },
    RETAINED_CANDIDATE: { bg: 'bg-[#858B70]/15', text: 'text-[#5A6048]', border: 'border-[#858B70]/35', label: 'FALSIFICATION RESISTANT' },
    NARROWED_CANDIDATE: { bg: 'bg-[#FAF8F3]', text: 'text-[#252622]', border: 'border-[#B96645]/30', label: 'SCOPED & NARROWED' },
    EXISTING_WORK_FOUND: { bg: 'bg-[#B96645]/15', text: 'text-[#B96645]', border: 'border-[#B96645]/35', label: 'PRIOR WORK FOUND' },
    INSUFFICIENT_COVERAGE: { bg: 'bg-[#EFECE5]', text: 'text-[#777873]', border: 'border-[#E3E1D9]', label: 'INCOMPLETE COVERAGE' },
    REQUIRES_HUMAN_REVIEW: { bg: 'bg-[#FAF8F3]', text: 'text-[#B96645]', border: 'border-[#E3E1D9]', label: 'EXPERT AUDIT REQUIRED' },
  };

  const current = styles[status] || styles.CANDIDATE;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-semibold tracking-wide border ${current.bg} ${current.text} ${current.border}`}>
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
          ? 'bg-[#858B70]/15 text-[#5A6048] border-[#858B70]/30'
          : 'bg-[#FAF8F3] text-[#777873] border-[#E3E1D9]'
      }`}
    >
      {isOA ? 'OPEN ACCESS' : 'RESTRICTED ACCESS'}
    </span>
  );
}
