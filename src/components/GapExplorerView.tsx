'use client';

import React, { useState } from 'react';
import { ResearchGap, GapInvestigationReport, ProposedExperiment } from '@/types';
import { GapStatusBadge } from './Badges';
import { Sparkles, ShieldAlert, FlaskConical, FileSearch, ArrowRight, CheckCircle2, AlertOctagon, X, Download } from 'lucide-react';

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
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface">
        <Sparkles className="w-10 h-10 text-accent/50 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-content-primary">No Candidate Gaps Generated Yet</h3>
        <p className="text-sm text-content-secondary max-w-md mx-auto mt-1">
          Add research papers and run the multi-stage analysis engine to discover candidate scientific research gaps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-content-primary flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span>Candidate Research Gaps & Falsification Audits</span>
          </h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Every candidate gap is subjected to automated counter-evidence falsification before experimental protocol design.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-surface border border-border text-content-secondary">
          {gaps.length} candidate{gaps.length > 1 ? 's' : ''} detected
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="rounded-xl border border-border bg-surface hover:border-accent/40 transition-all p-6 space-y-4 shadow-sm"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center space-x-3">
                <GapStatusBadge status={gap.status} />
                <span className="text-xs font-mono text-content-muted uppercase">
                  Category: {gap.gap_type.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs font-mono text-accent">
                Confidence: {(gap.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Title & Question */}
            <div>
              <h4 className="text-base font-bold text-content-primary tracking-tight">
                {gap.title}
              </h4>
              <div className="mt-2 p-3 rounded-lg bg-surface-elevated border border-border">
                <span className="text-[10px] font-mono text-secondary uppercase block font-semibold">
                  Testable Research Question:
                </span>
                <p className="text-sm font-semibold text-content-primary mt-0.5">
                  {gap.research_question}
                </p>
              </div>
            </div>

            {/* Description & Evidence */}
            <p className="text-xs text-content-secondary leading-relaxed">
              {gap.description}
            </p>

            {/* Supporting Studies */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-content-muted uppercase block">
                Supporting Studies & Motivating Limitations:
              </span>
              <div className="flex flex-wrap gap-2">
                {gap.supporting_papers.map((sp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-surface-elevated border border-border text-xs text-content-secondary"
                  >
                    <span className="font-medium text-content-primary truncate max-w-[200px]">
                      {sp.title}
                    </span>
                    {sp.year && <span className="text-content-muted">({sp.year})</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-content-muted">
                Audit Status: <span className="text-content-secondary uppercase">{gap.status}</span>
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleRunFalsify(gap.id)}
                  disabled={loadingFalsifyId === gap.id}
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-elevated border border-border hover:border-amber-400 hover:text-amber-400 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {loadingFalsifyId === gap.id ? 'Running 6-Stage Audit...' : 'Run Falsification Audit'}
                  </span>
                </button>

                <button
                  onClick={() => handlePlanExperiment(gap.id)}
                  disabled={loadingPlanId === gap.id}
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-background hover:bg-accent-hover transition-colors"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-surface-elevated border border-border p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <FileSearch className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-content-primary">
                  Research-Gap Falsification Audit Report
                </h3>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="text-content-muted hover:text-content-primary p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-content-muted uppercase">Target Gap:</span>
                <h4 className="text-sm font-bold text-content-primary">{activeReport.original_gap_title}</h4>
                <p className="text-content-secondary mt-0.5">{activeReport.original_question}</p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-content-muted uppercase block">
                    Falsification Outcome Verdict:
                  </span>
                  <div className="mt-1">
                    <GapStatusBadge status={activeReport.outcome} />
                  </div>
                </div>
                <div className="text-right font-mono text-content-muted">
                  <span>{activeReport.papers_retrieved_count} scholarly works audited</span>
                </div>
              </div>

              {/* Justification */}
              <div>
                <span className="font-mono text-[10px] text-content-muted uppercase block">
                  Investigation Justification & Synthesis:
                </span>
                <p className="text-content-primary mt-1 leading-relaxed bg-surface p-3 rounded border border-border">
                  {activeReport.reasoning_summary}
                </p>
              </div>

              {/* Counter-Evidence Found */}
              {activeReport.counter_evidence_papers.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-amber-400 uppercase block font-semibold">
                    Discovered Prior Work & Counter-Evidence:
                  </span>
                  {activeReport.counter_evidence_papers.map((cp, idx) => (
                    <div key={idx} className="p-3 rounded bg-surface border border-border space-y-1">
                      <div className="flex justify-between font-medium text-content-primary">
                        <span>{cp.title}</span>
                        {cp.year && <span className="font-mono text-content-muted">{cp.year}</span>}
                      </div>
                      <p className="text-content-secondary">{cp.summary}</p>
                      <p className="text-[11px] text-amber-400 font-mono">
                        Impact on Gap: {cp.relevance_to_gap}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Revised Question */}
              {activeReport.revised_question && (
                <div className="p-3 rounded bg-purple-950/20 border border-purple-500/30">
                  <span className="font-mono text-[10px] text-purple-400 uppercase block font-semibold">
                    Scoped & Refined Research Question:
                  </span>
                  <p className="text-sm font-semibold text-content-primary mt-1">
                    {activeReport.revised_question}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              <div className="p-3 rounded bg-surface border border-border text-content-secondary">
                <span className="font-mono text-[10px] text-content-muted uppercase block">
                  Expert Review Recommendation:
                </span>
                <p className="mt-1">{activeReport.human_review_recommendation}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setActiveReport(null)}
                className="px-4 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-content-primary hover:bg-surface-elevated"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experiment Protocol Modal */}
      {activeExperiment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-surface-elevated border border-border p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-accent" />
                <h3 className="text-base font-bold text-content-primary">
                  Practical Experiment Protocol & Feasibility Plan
                </h3>
              </div>
              <button
                onClick={() => setActiveExperiment(null)}
                className="text-content-muted hover:text-content-primary p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-content-muted uppercase">Objective:</span>
                <h4 className="text-sm font-bold text-content-primary">{activeExperiment.objective}</h4>
              </div>

              {/* Hypothesis */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-[10px] font-mono text-accent uppercase block font-semibold">
                  Testable Hypothesis (H1):
                </span>
                <p className="text-sm font-semibold text-content-primary mt-1">
                  {activeExperiment.testable_hypothesis}
                </p>
              </div>

              {/* Variables breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded bg-surface border border-border space-y-1">
                  <span className="text-[10px] font-mono text-accent uppercase font-bold block">
                    Independent Variables:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-content-secondary">
                    {activeExperiment.variables.independent.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
                <div className="p-3 rounded bg-surface border border-border space-y-1">
                  <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
                    Dependent Variables:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-content-secondary">
                    {activeExperiment.variables.dependent.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
                <div className="p-3 rounded bg-surface border border-border space-y-1">
                  <span className="text-[10px] font-mono text-content-muted uppercase font-bold block">
                    Controlled Constants:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-content-secondary">
                    {activeExperiment.variables.controlled.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
              </div>

              {/* Hardware & Feasibility */}
              <div className="p-3 rounded bg-surface border border-border space-y-2">
                <span className="text-[10px] font-mono text-content-muted uppercase block font-semibold">
                  Hardware Feasibility & Resource Budget:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-content-muted block text-[10px]">Target Hardware:</span>
                    <span className="text-content-primary font-semibold">{activeExperiment.hardware_requirements.target_hardware}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block text-[10px]">Est. Compute:</span>
                    <span className="text-accent font-semibold">{activeExperiment.estimated_resources.compute_hours} hours</span>
                  </div>
                  <div>
                    <span className="text-content-muted block text-[10px]">Est. Cost:</span>
                    <span className="text-accent font-semibold">${activeExperiment.estimated_resources.estimated_cost_usd.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block text-[10px]">Confidence:</span>
                    <span className="text-secondary font-semibold">{activeExperiment.estimated_resources.estimation_confidence}</span>
                  </div>
                </div>
              </div>

              {/* Step-by-step Methodology */}
              <div>
                <span className="font-mono text-[10px] text-content-muted uppercase block mb-1">
                  Step-by-Step Execution Protocol:
                </span>
                <pre className="p-3 rounded bg-surface border border-border font-mono text-[11px] text-content-secondary whitespace-pre-wrap">
                  {activeExperiment.methodology}
                </pre>
              </div>

              {/* Checklist */}
              <div>
                <span className="font-mono text-[10px] text-content-muted uppercase block mb-1">
                  Experimental Pre-flight Checklist:
                </span>
                <div className="space-y-1.5">
                  {activeExperiment.checklist.map((c, i) => (
                    <div key={i} className="flex items-center space-x-2 text-content-secondary">
                      <div className="w-3.5 h-3.5 rounded border border-accent/40 bg-accent/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-accent" />
                      </div>
                      <span>{c.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(activeExperiment, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `experiment_plan_${activeExperiment.id}.json`;
                  a.click();
                }}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-content-secondary hover:text-content-primary"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Protocol (JSON)</span>
              </button>

              <button
                onClick={() => setActiveExperiment(null)}
                className="px-4 py-1.5 rounded-lg bg-accent text-background text-xs font-semibold hover:bg-accent-hover"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
