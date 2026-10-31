'use client';

import React, { useState } from 'react';
import { ResearchGap, GapInvestigationReport, ProposedExperiment } from '@/types';
import { GapStatusBadge } from './Badges';
import { 
  Sparkles, 
  ShieldAlert, 
  FlaskConical, 
  FileSearch, 
  ArrowRight, 
  CheckCircle2, 
  AlertOctagon, 
  X, 
  Download,
  BookOpen,
  Cpu,
  Layers,
  Clock,
  Compass
} from 'lucide-react';

interface Props {
  gaps: ResearchGap[];
  onFalsify: (gapId: string) => Promise<GapInvestigationReport>;
  onPlanExperiment: (gapId: string) => Promise<ProposedExperiment>;
}

export function GapExplorerView({ gaps, onFalsify, onPlanExperiment }: Props) {
  const [loadingFalsifyId, setLoadingFalsifyId] = useState<string | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<GapInvestigationReport | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<ProposedExperiment | null>(null);

  const handleRunFalsify = async (gapId: string) => {
    try {
      setLoadingFalsifyId(gapId);
      const report = await onFalsify(gapId);
      setActiveReport(report);
    } catch (err: any) {
      alert(`Falsification audit error: ${err.message}`);
    } finally {
      setLoadingFalsifyId(null);
    }
  };

  const handlePlanExperiment = async (gapId: string) => {
    try {
      setLoadingPlanId(gapId);
      const exp = await onPlanExperiment(gapId);
      setActiveExperiment(exp);
    } catch (err: any) {
      alert(`Experiment planning error: ${err.message}`);
    } finally {
      setLoadingPlanId(null);
    }
  };

  if (gaps.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
        <Sparkles className="w-10 h-10 text-[#B96645] mx-auto mb-3" />
        <h3 className="font-serif text-lg font-semibold text-[#252622]">No Candidate Gaps Discovered Yet</h3>
        <p className="text-xs text-[#777873] max-w-md mx-auto mt-1 font-sans">
          Execute multi-provider literature retrieval and grounded claim extraction to synthesize candidate research gaps and untested frontiers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E1D9]">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#252622] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B96645]" />
            <span>Candidate Research Gaps & Falsification Audits</span>
          </h3>
          <p className="text-xs text-[#777873] mt-0.5 font-sans">
            Every proposed gap remains a candidate until audited against historical literature across OpenAlex, arXiv, and Crossref via a 6-stage counter-evidence pipeline.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] self-start sm:self-auto">
          {gaps.length} candidate{gaps.length > 1 ? 's' : ''} detected
        </span>
      </div>

      {/* Gaps Grid */}
      <div className="grid grid-cols-1 gap-6">
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="rounded-xl border border-[#E3E1D9] bg-[#FDFCF9] hover:border-[#CCC8BC] transition-all p-6 space-y-4 shadow-paper"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E3E1D9]">
              <div className="flex items-center gap-3">
                <GapStatusBadge status={gap.status} />
                <span className="text-xs font-mono text-[#777873] uppercase">
                  Category: {gap.gap_type.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs font-mono text-[#858B70] font-medium">
                Extraction Confidence: {(gap.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Title & Research Question */}
            <div>
              <h4 className="font-serif text-lg font-semibold text-[#252622] tracking-tight">
                {gap.title}
              </h4>
              <div className="mt-2.5 p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <span className="text-[10px] font-mono text-[#B96645] uppercase block font-semibold tracking-wider">
                  Testable Research Question:
                </span>
                <p className="font-serif text-base font-medium text-[#252622] mt-0.5 italic">
                  {gap.research_question}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#777873] leading-relaxed font-sans">
              {gap.description}
            </p>

            {/* Supporting Studies */}
            {gap.supporting_papers && gap.supporting_papers.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider block font-semibold">
                  Motivating Studies & Limitations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {gap.supporting_papers.map((sp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono text-[#777873]"
                    >
                      <BookOpen className="w-3 h-3 text-[#858B70]" />
                      <span className="font-medium text-[#252622] truncate max-w-[220px]">
                        {sp.title}
                      </span>
                      {sp.year && <span className="text-[#9D9E99]">({sp.year})</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[#E3E1D9] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-[#777873]">
                Audit State: <span className="text-[#252622] font-semibold uppercase">{gap.status}</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRunFalsify(gap.id)}
                  disabled={loadingFalsifyId === gap.id}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] hover:text-[#B96645] hover:border-[#B96645] transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#B96645]" />
                  <span>
                    {loadingFalsifyId === gap.id ? 'Running 6-Stage Audit...' : 'Run Falsification Audit'}
                  </span>
                </button>

                <button
                  onClick={() => handlePlanExperiment(gap.id)}
                  disabled={loadingPlanId === gap.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#252622] text-[#FDFCF9] hover:bg-[#383A34] transition-all shadow-[0_1px_2px_rgba(37,38,34,0.06)] active:scale-[0.98]"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-[#EFECE5]" />
                  <span>
                    {loadingPlanId === gap.id ? 'Synthesizing...' : 'Plan Experiment'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Falsification Investigation Report Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252622]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] p-6 shadow-paper-lg space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E3E1D9]">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-[#B96645]" />
                <h3 className="font-serif text-lg font-semibold text-[#252622]">
                  Research-Gap Adversarial Falsification Report
                </h3>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="text-[#777873] hover:text-[#252622] p-1 rounded hover:bg-[#FAF8F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider font-semibold">Audited Gap:</span>
                <h4 className="font-serif text-base font-semibold text-[#252622] mt-0.5">{activeReport.original_gap_title}</h4>
                <p className="text-xs text-[#777873] mt-0.5 font-mono">{activeReport.original_question}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider block font-semibold">
                    Falsification Outcome:
                  </span>
                  <div className="mt-1">
                    <GapStatusBadge status={activeReport.outcome} />
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-[#777873]">
                  <span>{activeReport.papers_retrieved_count} publications evaluated</span>
                </div>
              </div>

              {/* Justification */}
              <div>
                <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold mb-1">
                  Adversarial Audit Reasoning & Synthesis:
                </span>
                <p className="text-xs text-[#252622] leading-relaxed bg-[#FAF8F3] p-3 rounded-lg border border-[#E3E1D9]">
                  {activeReport.reasoning_summary}
                </p>
              </div>

              {/* Counter-evidence found */}
              {activeReport.counter_evidence_papers.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-[#B96645] uppercase tracking-wider block font-bold">
                    Discovered Counter-Evidence & Prior Work:
                  </span>
                  {activeReport.counter_evidence_papers.map((cp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#FAF8F3] border border-[#B96645]/30 space-y-1">
                      <div className="flex justify-between font-serif text-sm font-semibold text-[#252622]">
                        <span>{cp.title}</span>
                        {cp.year && <span className="font-mono text-xs text-[#777873] font-normal">{cp.year}</span>}
                      </div>
                      <p className="text-xs text-[#777873]">{cp.summary}</p>
                      <p className="text-[11px] text-[#B96645] font-mono font-medium">
                        Relevance: {cp.relevance_to_gap}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Revised question */}
              {activeReport.revised_question && (
                <div className="p-3.5 rounded-lg bg-[#858B70]/10 border border-[#858B70]/30">
                  <span className="font-mono text-[10px] text-[#5A6048] uppercase tracking-wider block font-bold">
                    Scoped & Scrutinized Research Question:
                  </span>
                  <p className="font-serif text-base font-semibold text-[#252622] mt-1 italic">
                    {activeReport.revised_question}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs text-[#777873]">
                <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold">
                  Methodological Recommendation:
                </span>
                <p className="mt-1 text-[#252622]">{activeReport.human_review_recommendation}</p>
              </div>
            </div>

            <div className="pt-3.5 border-t border-[#E3E1D9] flex justify-end">
              <button
                onClick={() => setActiveReport(null)}
                className="px-4 py-2 rounded-lg bg-[#252622] text-[#FDFCF9] text-xs font-mono font-medium hover:bg-[#383A34]"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experiment Protocol Modal */}
      {activeExperiment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252622]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] p-6 shadow-paper-lg space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E3E1D9]">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#858B70]" />
                <h3 className="font-serif text-lg font-semibold text-[#252622]">
                  Practical Experiment Protocol & Resource Plan
                </h3>
              </div>
              <button
                onClick={() => setActiveExperiment(null)}
                className="text-[#777873] hover:text-[#252622] p-1 rounded hover:bg-[#FAF8F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider font-semibold">Core Objective:</span>
                <h4 className="font-serif text-base font-semibold text-[#252622] mt-0.5">{activeExperiment.objective}</h4>
              </div>

              {/* Hypothesis */}
              <div className="p-3.5 rounded-lg bg-[#858B70]/10 border border-[#858B70]/30">
                <span className="text-[10px] font-mono text-[#5A6048] uppercase tracking-wider block font-bold">
                  Testable Hypothesis:
                </span>
                <p className="font-serif text-base font-semibold text-[#252622] mt-1 italic">
                  {activeExperiment.testable_hypothesis}
                </p>
              </div>

              {/* Variables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                  <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold mb-1">
                    Independent Variables:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#252622] font-mono">
                    {activeExperiment.variables.independent.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                  <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold mb-1">
                    Dependent Variables / Metrics:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#252622] font-mono">
                    {activeExperiment.variables.dependent.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Controlled Variables */}
              {activeExperiment.variables.controlled.length > 0 && (
                <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                  <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold mb-1">
                    Controlled Variables:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeExperiment.variables.controlled.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[11px] font-mono text-[#252622]">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Step by step protocol */}
              <div>
                <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold mb-1.5">
                  Execution Methodology & Protocol:
                </span>
                <pre className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] font-mono text-xs text-[#252622] whitespace-pre-wrap leading-relaxed">
                  {activeExperiment.methodology}
                </pre>
              </div>

              {/* Hardware & Feasibility */}
              <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-2">
                <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider block font-semibold">
                  Required Resources & Hardware:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2 rounded bg-[#FDFCF9] border border-[#E3E1D9]">
                    <span className="text-[#9D9E99] text-[9px] block">HARDWARE:</span>
                    <span className="text-[#252622] font-semibold">{activeExperiment.hardware_requirements?.target_hardware || 'Standard Edge SoC / GPU'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#FDFCF9] border border-[#E3E1D9]">
                    <span className="text-[#9D9E99] text-[9px] block">ESTIMATED COMPUTE:</span>
                    <span className="text-[#252622] font-semibold">{activeExperiment.estimated_resources?.compute_hours || 0} hours</span>
                  </div>
                  <div className="p-2 rounded bg-[#FDFCF9] border border-[#E3E1D9]">
                    <span className="text-[#9D9E99] text-[9px] block">ESTIMATED COST:</span>
                    <span className="text-[#858B70] font-semibold">${activeExperiment.estimated_resources?.estimated_cost_usd || 0} USD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-[#E3E1D9] flex justify-end">
              <button
                onClick={() => setActiveExperiment(null)}
                className="px-4 py-2 rounded-lg bg-[#252622] text-[#FDFCF9] text-xs font-mono font-medium hover:bg-[#383A34]"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
