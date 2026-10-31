import React from 'react';

export const SolutionSection: React.FC = () => {
  return (
    <section id="features" className="relative py-24 sm:py-36 bg-[#FDFCF9] border-t border-b border-[#E3E1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-20 sm:mb-28">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-[#777873]">
            <span>Section 02</span>
            <span className="text-[#CCC8BC]">/</span>
            <span className="text-[#B96645] font-semibold">Core Capabilities</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#252622] leading-[1.08]">
            From scattered papers to <br />
            <span className="italic text-[#B96645]">connected intelligence.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#777873] leading-relaxed">
            PaperTrail transforms disjointed scientific repositories into an editorial, 
            navigable knowledge mesh that surfaces relationships researchers haven't connected yet.
          </p>
        </div>

        {/* 4 Distinct Editorial Sections with Alternating Layouts */}
        <div className="space-y-24 sm:space-y-36">
          {/* ==================== CAPABILITY 01 ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Text Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="font-serif text-5xl sm:text-6xl font-normal text-[#B96645]">
                01
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#858B70] font-semibold">
                  Relational Knowledge Mesh
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#252622] leading-snug">
                  Connected Research
                </h3>
              </div>

              <p className="text-base text-[#777873] leading-relaxed">
                Discover relationships between papers, datasets, authors, and findings. 
                PaperTrail traverses multi-hop citation graphs and identifies cross-disciplinary bridges 
                that traditional bibliographic searches overlook.
              </p>

              <div className="pt-2 space-y-2 font-mono text-xs text-[#252622]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Bi-directional dataset-to-thesis lineage mapping</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Multi-hop citation traversal across 14 scientific repositories</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Cross-domain methodology transfer detection</span>
                </div>
              </div>
            </div>

            {/* Illustration Column: Reference Traversal Tree */}
            <div className="lg:col-span-6">
              <div className="rounded-xl bg-[#F7F6F2] border border-[#E3E1D9] p-6 sm:p-8 shadow-paper-subtle space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3 text-[#777873]">
                  <span className="text-[11px] uppercase tracking-wider">Fig. 3.1 — Multi-Hop Relational Lineage</span>
                  <span className="text-[#858B70] text-[10px]">Verified Path</span>
                </div>

                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#CCC8BC]">
                  <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9]">
                    <div className="text-[10px] text-[#858B70] font-semibold uppercase">Root Origin • 1956</div>
                    <div className="text-xs font-serif text-[#252622] font-semibold mt-0.5">
                      Miller: "The Magical Number Seven, Plus or Minus Two"
                    </div>
                    <div className="text-[10px] text-[#777873] mt-1">Cognitive working memory constraints baseline</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9]">
                    <div className="text-[10px] text-[#B96645] font-semibold uppercase">Intermediate Bridge • 2019</div>
                    <div className="text-xs font-serif text-[#252622] font-semibold mt-0.5">
                      Amershi et al.: Guidelines for Human-AI Interaction
                    </div>
                    <div className="text-[10px] text-[#777873] mt-1">Applied cognitive ergonomics to conversational interfaces</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#252622]">
                    <div className="text-[10px] text-[#252622] font-semibold uppercase">Contemporary Frontier • 2025</div>
                    <div className="text-xs font-serif text-[#252622] font-semibold mt-0.5">
                      Chen et al.: Scaffolding & Problem Decomposition via LLMs
                    </div>
                    <div className="text-[10px] text-[#777873] mt-1">Direct empirical extension with Zenodo dataset #81299</div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#777873] flex justify-between items-center border-t border-[#E3E1D9]">
                  <span>Semantic affinity confidence:</span>
                  <span className="font-semibold text-[#252622]">96.8%</span>
                </div>
              </div>
            </div>
          </div>


          {/* ==================== CAPABILITY 02 ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Illustration Column (Alternating on Left) */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-xl bg-[#F7F6F2] border border-[#E3E1D9] p-6 sm:p-8 shadow-paper-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3 text-xs font-mono text-[#777873]">
                  <span className="text-[11px] uppercase tracking-wider">Fig. 3.2 — Dissonance Ledger [C-01]</span>
                  <span className="px-2 py-0.5 rounded bg-[#F3E8E2] text-[#B96645] text-[10px] font-semibold">
                    Flagged Discrepancy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Claim A */}
                  <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#858B70] font-semibold">Claim A (Positive)</span>
                      <span className="text-[#777873]">N = 1,420</span>
                    </div>
                    <p className="font-serif text-sm text-[#252622] leading-snug">
                      "Scaffolded assistance increased comprehension benchmark scores by 34%."
                    </p>
                    <div className="text-[10px] text-[#777873] pt-1">
                      Tested: 48h post-intervention
                    </div>
                  </div>

                  {/* Claim B */}
                  <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#B96645]/40 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#B96645] font-semibold">Claim B (Divergent)</span>
                      <span className="text-[#777873]">N = 980</span>
                    </div>
                    <p className="font-serif text-sm text-[#252622] leading-snug">
                      "Long-term retention dropped 22% on unassisted delayed evaluations."
                    </p>
                    <div className="text-[10px] text-[#777873] pt-1">
                      Tested: 60 days post-intervention
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] text-xs font-mono text-[#252622]">
                  <span className="font-semibold text-[#B96645]">PaperTrail Resolution:</span>{' '}
                  <span className="text-[#777873]">
                    The divergence is driven by measurement latency rather than theoretical conflict. Immediate fluency does not translate to 60-day memory consolidation.
                  </span>
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="font-serif text-5xl sm:text-6xl font-normal text-[#B96645]">
                02
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#B96645] font-semibold">
                  Empirical Conflict Analysis
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#252622] leading-snug">
                  Contradictory Evidence
                </h3>
              </div>

              <p className="text-base text-[#777873] leading-relaxed">
                Investigate findings that appear to disagree and understand their differences. 
                Rather than treating papers as isolated truths, PaperTrail compares experimental cohorts, 
                timeline constraints, and statistical power to clarify why conclusions diverge.
              </p>

              <div className="pt-2 space-y-2 font-mono text-xs text-[#252622]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Methodology and sample size disparity auditing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Evaluation interval variance isolation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Automated confidence-weighted conflict scores</span>
                </div>
              </div>
            </div>
          </div>


          {/* ==================== CAPABILITY 03 ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Text Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="font-serif text-5xl sm:text-6xl font-normal text-[#B96645]">
                03
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#858B70] font-semibold">
                  Temporal Paradigm Shifts
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#252622] leading-snug">
                  Evolving Knowledge
                </h3>
              </div>

              <p className="text-base text-[#777873] leading-relaxed">
                Explore how research conclusions and evidence change over time. 
                Track the trajectory of scientific consensus from foundational hypotheses 
                through replication milestones and paradigm pivots.
              </p>

              <div className="pt-2 space-y-2 font-mono text-xs text-[#252622]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Chronological hypothesis refinement tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Consensus shift and debunked theory flagging</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Citation momentum and derivative adoption curves</span>
                </div>
              </div>
            </div>

            {/* Illustration Column: Progression Ledger */}
            <div className="lg:col-span-6">
              <div className="rounded-xl bg-[#F7F6F2] border border-[#E3E1D9] p-6 sm:p-8 shadow-paper-subtle space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3 text-[#777873]">
                  <span className="text-[11px] uppercase tracking-wider">Fig. 3.3 — Consensus Progression</span>
                  <span className="text-[#252622] text-[10px]">2017 &rarr; 2026</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { year: '2017', milestone: 'Transformer Architecture Introduced', note: 'Self-attention replaces recurrent gates for NLP.', status: 'Foundation' },
                    { year: '2021', milestone: 'Scaling Laws Formulated', note: 'Predictable loss curves across compute and parameters.', status: 'Consensus' },
                    { year: '2024', milestone: 'State-Space & Linear Hybrids', note: 'Mamba architectures challenge quadratic complexity.', status: 'Paradigm Shift' },
                    { year: '2026', milestone: 'Autonomous Multi-Hop Synthesis', note: 'PaperTrail maps unbounded literature reference webs.', status: 'Current Frontier' },
                  ].map((step, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] flex items-start gap-3">
                      <span className="font-serif text-base font-bold text-[#252622] w-12 pt-0.5">{step.year}</span>
                      <div className="flex-1">
                        <div className="font-serif text-sm font-semibold text-[#252622]">{step.milestone}</div>
                        <div className="text-[11px] text-[#777873] mt-0.5">{step.note}</div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873]">
                        {step.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* ==================== CAPABILITY 04 ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Illustration Column (Alternating on Left) */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-xl bg-[#F7F6F2] border border-[#E3E1D9] p-6 sm:p-8 shadow-paper-subtle space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3 text-[#777873]">
                  <span className="text-[11px] uppercase tracking-wider">Fig. 3.4 — Unexplored Hypothesis Spec</span>
                  <span className="px-2 py-0.5 rounded bg-[#F3E8E2] text-[#B96645] text-[10px] font-semibold">
                    Novelty: 94 / 100
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] space-y-2">
                  <div className="text-[10px] uppercase text-[#B96645] font-semibold">
                    Opportunity Candidate [GAP-01]
                  </div>
                  <h5 className="font-serif text-base text-[#252622] leading-snug">
                    "Does forced Socratic interleaving during AI scaffolding offset 60-day delayed recall deficits?"
                  </h5>
                  <p className="text-xs text-[#777873] leading-relaxed">
                    Identified in the intersection between Sweller’s cognitive load theory and Bjork’s desirable difficulties framework. Zero published double-blind trials currently exist.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                    <span className="text-[#777873] block text-[10px]">Methodology Type</span>
                    <span className="text-[#252622] font-semibold mt-0.5 block">Randomized Controlled Trial</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                    <span className="text-[#777873] block text-[10px]">Recommended Cohort</span>
                    <span className="text-[#858B70] font-semibold mt-0.5 block">N &ge; 400 • 90-Day Retest</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="font-serif text-5xl sm:text-6xl font-normal text-[#B96645]">
                04
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#B96645] font-semibold">
                  Uncharted Hypotheses
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#252622] leading-snug">
                  Unanswered Questions
                </h3>
              </div>

              <p className="text-base text-[#777873] leading-relaxed">
                Identify potential research gaps and opportunities for further investigation. 
                PaperTrail isolates the negative space between published findings, surfacing promising 
                questions that warrant grant proposals, doctoral dissertations, and laboratory trials.
              </p>

              <div className="pt-2 space-y-2 font-mono text-xs text-[#252622]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Algorithmic white space detection between disciplines</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Novelty and feasibility index ranking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
                  <span>Automated grant-ready study parameter recommendations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
