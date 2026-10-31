import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC<{ onLaunchDemo: () => void }> = ({ onLaunchDemo }) => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      num: '01',
      title: 'Discover',
      headline: 'Enter a research question.',
      desc: 'Formulate any inquiry, theoretical dilemma, or paper DOI. PaperTrail translates natural language into semantic vectors across multi-domain knowledge bases.',
      detailMock: 'Input: "Does conversational AI scaffolding impair long-term memory retrieval in STEM learners?"',
      tags: ['#CognitiveLoad', '#DelayedRecall', '#STEMPedagogy']
    },
    {
      num: '02',
      title: 'Explore',
      headline: 'Navigate relevant research sources.',
      desc: 'Powered by TinyFish, PaperTrail autonomously explores open repositories (arXiv, Nature, PubMed, IEEE), following citations backward and forward across sources.',
      detailMock: 'Indexed: 24 relevant papers, 8 open datasets on Zenodo & Dryad, 142 citation vertices resolved.',
      tags: ['arXiv:2409.11283', 'doi:10.1038/s41562', 'Zenodo #81299']
    },
    {
      num: '03',
      title: 'Connect',
      headline: 'Organize related findings and evidence.',
      desc: 'The platform correlates empirical cohorts, weights methodology nuances, and highlights findings that dispute each other under varying experimental conditions.',
      detailMock: 'Contradiction flagged: Chen (2025) vs Vogel (2024) divergence isolated to 48h vs 60-day test latency.',
      tags: ['Dissonance Ledger', 'Sample Auditing', 'Cohort Comparison']
    },
    {
      num: '04',
      title: 'Uncover',
      headline: 'Investigate potential unanswered questions.',
      desc: 'PaperTrail maps the uncharted white space between existing findings, surfacing viable research questions ready for laboratory experimentation or doctoral study.',
      detailMock: 'Generated Hypothesis: Forced Socratic interleaving prior to AI response generation to preserve delayed retention.',
      tags: ['Novelty 94/100', 'Grant Proposal Ready', 'High Viability']
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-[#F7F6F2] border-b border-[#E3E1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-[#777873]">
            <span>Section 04</span>
            <span className="text-[#CCC8BC]">/</span>
            <span className="text-[#B96645] font-semibold">The Method</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#252622] leading-[1.08]">
            An idea becomes <br />
            <span className="italic text-[#B96645]">an investigation.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#777873] leading-relaxed">
            Four disciplined steps from an initial research curiosity into a structured, 
            navigable network of papers, empirical evidence, and unexplored opportunities.
          </p>
        </div>

        {/* Minimal Horizontal Process Diagram with Four Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Subtle horizontal connecting hairline */}
          <div className="hidden md:block absolute top-10 left-12 right-12 h-[1px] bg-[#E3E1D9] z-0" />

          {stages.map((stage, idx) => {
            const isSelected = activeStage === idx;
            return (
              <div
                key={stage.num}
                onClick={() => setActiveStage(idx)}
                className={`relative z-10 cursor-pointer p-6 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FDFCF9] border-[#252622] shadow-paper'
                    : 'bg-[#FDFCF9] border-[#E3E1D9] hover:bg-[#FAF8F3]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif text-3xl font-normal text-[#252622]">
                      {stage.num}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#777873] px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9]">
                      Stage {stage.num}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#252622] mb-1">
                    {stage.title}
                  </h3>

                  <h4 className="font-sans text-xs font-medium text-[#B96645] mb-3">
                    {stage.headline}
                  </h4>

                  <p className="text-xs text-[#777873] leading-relaxed mb-4 font-normal">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E3E1D9] font-mono text-[11px] text-[#252622] flex items-center justify-between">
                  <span>Inspect Step</span>
                  <span className="text-[#B96645]">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        <div className="mt-8 p-6 sm:p-8 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E3E1D9] pb-4 mb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#B96645] font-semibold">
                Active Protocol Detail • Stage {stages[activeStage].num}
              </span>
              <h4 className="font-serif text-2xl font-normal text-[#252622] mt-0.5">
                {stages[activeStage].title}: {stages[activeStage].headline}
              </h4>
            </div>

            <button
              onClick={onLaunchDemo}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#252622] text-[#FDFCF9] text-xs font-medium hover:bg-[#383A34] transition-colors"
            >
              <span>Test with Query</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">
              <span className="text-[#777873] block text-[10px] uppercase mb-1">Simulated Output Stream:</span>
              <span>{stages[activeStage].detailMock}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#777873] text-[11px]">Indexed Entities:</span>
              {stages[activeStage].tags.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-[#F7F6F2] border border-[#E3E1D9] text-[#252622] text-[10px]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
