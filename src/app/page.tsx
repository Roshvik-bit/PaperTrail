'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  Compass,
  Network,
  ArrowRightLeft,
  Sparkles,
  FlaskConical,
  Database,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ExternalLink,
  Layers,
  FileSearch,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-border">
        {/* Subtle radial glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-accent/10 via-secondary/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-xs font-mono text-accent shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Evidence-Driven Research Intelligence Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-content-primary tracking-tight max-w-4xl mx-auto leading-tight font-sans">
            Discover the connections.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary to-accent">
              Challenge the evidence.
            </span>{' '}
            Find what to investigate next.
          </h1>

          <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed">
            PaperTrail automates scientific evidence investigation: extracting grounded claims, resolving apparent contradictions across experimental conditions, falsifying candidate research gaps against prior work, and producing testable experiments.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/workspace"
              className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-accent text-background hover:bg-accent-hover transition-all shadow-lg hover:shadow-accent/20"
            >
              <span>Open Research Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#capabilities"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold bg-surface-elevated border border-border hover:border-border-highlight text-content-primary transition-colors"
            >
              <span>Explore Capabilities</span>
            </a>
          </div>

          {/* Initial Domain Indicator */}
          <div className="pt-8 flex items-center justify-center space-x-3 text-xs text-content-muted">
            <Cpu className="w-4 h-4 text-secondary" />
            <span>Initial Investigation Domain:</span>
            <span className="font-mono text-content-primary font-medium">
              Edge AI, On-Device AI, Small Language Models & Resource-Constrained Inference
            </span>
          </div>
        </div>
      </section>

      {/* Core Differentiation vs Generic AI Summarizers */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Beyond Chatbots & Literature Summarizers
            </h2>
            <p className="text-sm text-content-secondary">
              PaperTrail never treats an AI hallucination as a scientific discovery. Every conclusion is strictly grounded in verifiable, cross-checked literature evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface-elevated border border-border space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-accent">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Grounded Claim Extraction</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Extracts structured scientific assertions, metrics, hardware environments, and limitations. Every claim preserves exact supporting passages and extraction confidence.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-elevated border border-border space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Disagreement Investigation</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Compares the experimental conditions behind conflicting findings (quantization, precision, hardware, thermal state) to separate apparent contradictions from genuine scientific conflicts.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-elevated border border-border space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Research-Gap Falsification</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Applies an aggressive 6-stage counter-evidence search against every proposed research gap. Candidate gaps are narrowed or rejected if prior work already addressed the question.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Interconnected Capabilities Deep Dive */}
      <section id="capabilities" className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-accent uppercase font-semibold">
              The Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-content-primary tracking-tight">
              Five Interconnected Scientific Capabilities
            </h2>
          </div>

          {/* Interactive Demonstration Cards */}
          <div className="space-y-8">
            {/* Capability B Walkthrough: AWQ vs Thermal Throttling Disagreement */}
            <div className="p-8 rounded-2xl bg-surface border border-border shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-amber-400 uppercase font-semibold">
                    Capability B Demonstration
                  </span>
                  <h3 className="text-xl font-bold text-content-primary">
                    Resolving Apparent Disagreements: AWQ vs Thermal Throttling
                  </h3>
                </div>
                <span className="px-3 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono">
                  CLASSIFICATION: QUALIFIES (APPARENT CONTRADICTION)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-secondary font-semibold">Observation 1 (Lin et al., MLSys 2024)</span>
                    <span className="text-content-muted">Paper: AWQ</span>
                  </div>
                  <p className="text-sm text-content-primary font-medium italic">
                    "On mobile GPUs, 4-bit AWQ achieves 3.2x latency speedup over FP16 while maintaining zero-shot perplexity."
                  </p>
                  <p className="text-xs text-content-secondary font-mono bg-background/50 p-2 rounded border border-border">
                    Condition: Short burst evaluation on discrete mobile GPU cluster.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-accent font-semibold">Observation 2 (Chen et al., IEEE 2024)</span>
                    <span className="text-content-muted">Paper: Thermal Throttling Dynamics</span>
                  </div>
                  <p className="text-sm text-content-primary font-medium italic">
                    "Token generation drops by 43% to 61% from initial burst performance due to DVFS downclocking within 90 seconds."
                  </p>
                  <p className="text-xs text-content-secondary font-mono bg-background/50 p-2 rounded border border-border">
                    Condition: Continuous sustained generation under passively cooled mobile SoC.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated border border-border text-xs space-y-2">
                <span className="text-[10px] font-mono text-accent uppercase font-bold block">
                  PaperTrail Engine Resolution:
                </span>
                <p className="text-content-secondary leading-relaxed">
                  Both studies report accurate empirical results under their respective test boundaries. The discrepancy is not a scientific error: burst benchmarks fail to reach the thermal inflection point of passively cooled mobile devices. Claim 2 <span className="text-sky-400 font-semibold">qualifies</span> Claim 1 for production deployment contexts.
                </p>
              </div>
            </div>

            {/* Capability D & E Walkthrough: Research-Gap Falsification & Experiment Planning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Capability D */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center space-x-2 text-purple-400">
                  <FileSearch className="w-5 h-5" />
                  <span className="text-xs font-mono uppercase font-semibold">Capability D</span>
                </div>
                <h3 className="text-lg font-bold text-content-primary">
                  6-Stage Research-Gap Falsification
                </h3>
                <p className="text-xs text-content-secondary leading-relaxed">
                  Before a research gap is validated, PaperTrail executes an automated adversarial counter-evidence audit:
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center space-x-2 text-content-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Stage 1: Gap decomposition & alternate terminology</span>
                  </div>
                  <div className="flex items-center space-x-2 text-content-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Stage 2: Scholarly API search expansion</span>
                  </div>
                  <div className="flex items-center space-x-2 text-content-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Stage 3: Citation & benchmark exploration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-content-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Stage 4: Counter-evidence comparative analysis</span>
                  </div>
                  <div className="flex items-center space-x-2 text-content-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Stage 5: Narrow, retain, or reject candidate gap</span>
                  </div>
                  <div className="flex items-center space-x-2 text-content-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Stage 6: Auditable investigation provenance report</span>
                  </div>
                </div>
              </div>

              {/* Capability E */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center space-x-2 text-accent">
                  <FlaskConical className="w-5 h-5" />
                  <span className="text-xs font-mono uppercase font-semibold">Capability E</span>
                </div>
                <h3 className="text-lg font-bold text-content-primary">
                  Practical Experiment Planning & Feasibility
                </h3>
                <p className="text-xs text-content-secondary leading-relaxed">
                  Converts validated candidate gaps into concrete, feasible experiment protocols with realistic resource estimates:
                </p>
                <div className="p-4 rounded-xl bg-surface-elevated border border-border text-xs space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-content-muted">Target Hardware:</span>
                    <span className="text-content-primary font-semibold">Snapdragon 8 Gen 2 / Apple M2</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-content-muted">Variables:</span>
                    <span className="text-accent">Independent, Dependent, Controlled</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-content-muted">Resource Assessment:</span>
                    <span className="text-secondary font-semibold">14 Compute Hours ($18.50)</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-content-muted">Feasibility Confidence:</span>
                    <span className="text-accent font-semibold">CALCULATED (Not Fabricated)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scholarly Data Sources Transparency */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Database className="w-6 h-6 text-secondary mx-auto" />
            <h2 className="text-2xl font-bold text-content-primary">
              Multi-Provider Scholarly Integration
            </h2>
            <p className="text-xs text-content-secondary">
              PaperTrail connects to independent scholarly providers with deduplication and provenance tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-1">
              <span className="font-bold text-sm text-content-primary block">OpenAlex</span>
              <span className="text-[11px] text-content-muted font-mono block">Works, Topics, Citations</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-1">
              <span className="font-bold text-sm text-content-primary block">Semantic Scholar</span>
              <span className="text-[11px] text-content-muted font-mono block">Abstracts & Citations</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-1">
              <span className="font-bold text-sm text-content-primary block">Crossref</span>
              <span className="text-[11px] text-content-muted font-mono block">DOI Metadata & Venues</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-1">
              <span className="font-bold text-sm text-content-primary block">arXiv</span>
              <span className="text-[11px] text-content-muted font-mono block">Preprints & Full PDFs</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-1">
              <span className="font-bold text-sm text-content-primary block">TinyFish</span>
              <span className="text-[11px] text-content-muted font-mono block">Autonomous Web Research</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border text-center text-xs text-content-muted space-y-2">
        <p>PaperTrail — Autonomous Scientific Research Intelligence Engine</p>
        <p className="font-mono text-[11px]">
          Edge AI, On-Device Small Language Models & Resource-Constrained Inference
        </p>
      </footer>
    </div>
  );
}
