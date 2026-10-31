import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const TinyFishSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: '1.0',
      title: 'Research Question',
      role: 'Query Formulation',
      detail: 'Formulates multi-angle search queries and semantic hypotheses from natural language prompts.',
      telemetry: 'Query tokenized: "delayed retention deficit in conversational AI tutoring"'
    },
    {
      num: '2.0',
      title: 'Web Exploration',
      role: 'TinyFish Autonomous Crawl',
      detail: 'Navigates research portals, indexes, and digital libraries; resolves paywalls and handles pagination.',
      telemetry: 'TinyFish traversing arXiv, PubMed, Nature, IEEE Xplore, and Zenodo.'
    },
    {
      num: '3.0',
      title: 'Source Discovery',
      role: 'Document Harvesting',
      detail: 'Identifies open-access preprints, peer-reviewed articles, supplementary CSV files, and code repositories.',
      telemetry: 'Discovered 24 candidate papers, 8 public datasets, and 12 author profile networks.'
    },
    {
      num: '4.0',
      title: 'Reference Traversal',
      role: 'Citation Lineage Crawl',
      detail: 'Follows citations forward and backward through web links, identifying forgotten foundational precursors.',
      telemetry: 'Traversed 2nd-degree citation graph; mapped 1956 Miller baseline to 2025 modern trials.'
    },
    {
      num: '5.0',
      title: 'Research Analysis',
      role: 'PaperTrail Synthesis Core',
      detail: 'Synthesizes empirical parameters, flags methodology discrepancies, and constructs the navigable knowledge graph.',
      telemetry: '1 core contradiction flagged; 3 novel research gap hypotheses formulated.'
    }
  ];

  return (
    <section id="methodology" className="relative py-24 sm:py-32 bg-[#F7F6F2] border-b border-[#E3E1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-[#777873]">
            <span>Section 03</span>
            <span className="text-[#CCC8BC]">/</span>
            <span className="text-[#B96645] font-semibold">Autonomous Web Traversal</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#252622] leading-[1.08]">
            From one reference to an <br />
            <span className="italic text-[#B96645]">entire research trail.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#777873] leading-relaxed">
            Powered by TinyFish autonomous web exploration, PaperTrail navigates open research repositories, 
            follows citation trails across journal websites, and retrieves the evidence researchers need.
          </p>
        </div>

        {/* Sophisticated Editorial Process Diagram */}
        <div className="rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper p-6 sm:p-10 mb-8">
          <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-4 mb-8">
            <span className="font-mono text-xs uppercase tracking-wider text-[#777873]">
              Fig. 4.0 — Autonomous Reference Pipeline Schema
            </span>
            <span className="text-xs font-mono text-[#858B70] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#858B70]" />
              TinyFish Engine Connected
            </span>
          </div>

          {/* 5-Step Editorial Process Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-[#F7F6F2] border-[#252622] shadow-paper-subtle'
                      : 'bg-[#FDFCF9] border-[#E3E1D9] hover:bg-[#FAF8F3]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs text-[#777873] mb-2">
                    <span className="font-bold text-[#252622]">{step.num}</span>
                    {idx < steps.length - 1 && (
                      <span className="hidden md:inline text-[#CCC8BC]">&rarr;</span>
                    )}
                  </div>

                  <h4 className="font-serif text-base font-semibold text-[#252622] mb-1">
                    {step.title}
                  </h4>

                  <p className="text-[11px] font-mono text-[#B96645] mb-2">
                    {step.role}
                  </p>

                  <p className="text-xs text-[#777873] leading-relaxed line-clamp-3">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Interactive Step Telemetry Box */}
          <div className="mt-8 p-4 rounded-lg bg-[#F7F6F2] border border-[#E3E1D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#252622]">
              <span className="font-bold text-[#B96645]">[Telemetry Step {steps[activeStep].num}]:</span>
              <span className="text-[#777873]">{steps[activeStep].telemetry}</span>
            </div>
            <span className="text-[10px] text-[#777873] uppercase tracking-wider">
              Latency: 38ms • Status: 200 OK
            </span>
          </div>
        </div>

        {/* Clear Scope Distinction Notice */}
        <div className="p-5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#858B70] flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-[#777873] leading-relaxed">
              <strong className="text-[#252622]">Architectural Clarity:</strong> TinyFish operates strictly as an autonomous web navigation and source retrieval technology. Scientific synthesis, contradiction detection, and research gap formulation are conducted by PaperTrail’s analysis layer.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[#777873] whitespace-nowrap">
            Web Exploration Layer
          </span>
        </div>
      </div>
    </section>
  );
};
