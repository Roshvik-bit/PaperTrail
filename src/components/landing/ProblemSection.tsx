import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
    <section id="problem" className="relative py-24 sm:py-32 bg-[#F7F6F2] border-t border-[#E3E1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Metadata Header */}
        <div className="flex items-center gap-3 mb-8 text-xs font-mono uppercase tracking-widest text-[#777873]">
          <span>Section 01</span>
          <span className="text-[#CCC8BC]">/</span>
          <span className="text-[#B96645] font-semibold">The Discovery Dilemma</span>
        </div>

        {/* Editorial Headline */}
        <div className="max-w-4xl mb-16">
          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#252622] leading-[1.08]">
            Research is connected.{' '}
            <span className="italic text-[#B96645] block sm:inline">
              Discovery is still fragmented.
            </span>
          </h2>
        </div>

        {/* Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Column 1: Editorial Essay & Deep Context */}
          <div className="lg:col-span-6 space-y-6 text-[#252622] leading-relaxed">
            <p className="text-lg text-[#252622] leading-relaxed font-sans drop-cap">
              Thousands of research papers are published every day across disconnected archives, 
              institutional repositories, and closed journal ecosystems. Crucial findings, raw datasets, 
              and conflicting empirical trials remain trapped within disciplinary boundaries.
            </p>

            <p className="text-sm text-[#777873] leading-relaxed">
              When a neuroscience laboratory investigates cognitive offloading, they seldom cross-reference 
              the parallel ergonomics literature published by software human-factors researchers five years earlier. 
              Search engines index text keywords; they do not understand whether two studies arrived at conflicting 
              conclusions under divergent experimental timelines.
            </p>

            <p className="text-sm text-[#777873] leading-relaxed">
              Consequently, researchers spend up to 70% of literature review hours executing repetitive manual queries. 
              Hidden contradictions go undetected until months into expensive bench trials, while profound scientific 
              questions remain buried in the unmapped seams between established papers.
            </p>

            {/* Publication Pull-Quote */}
            <div className="mt-8 p-6 rounded-lg bg-[#FDFCF9] border-l-2 border-[#B96645] border-t border-r border-b border-[#E3E1D9] shadow-paper-subtle">
              <blockquote className="font-serif italic text-lg sm:text-xl text-[#252622] leading-snug">
                "The fundamental bottleneck of modern inquiry is no longer access to data. 
                It is the inability to perceive how distant findings relate, dispute, or complete one another."
              </blockquote>
              <div className="mt-3 font-mono text-xs text-[#777873]">
                — PaperTrail Research Manifesto • Working Paper No. 1
              </div>
            </div>
          </div>

          {/* Column 2: Custom Scientific Research Metric Visualization */}
          <div className="lg:col-span-6">
            <div className="rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#777873]">
                    Empirical Analysis
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#252622] mt-0.5">
                    Fig. 2.0 — The Literature Disconnection Index
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#EBECE6] text-[#858B70] font-semibold">
                  Crossref & arXiv Audit
                </span>
              </div>

              {/* Four Empirical Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                  <div className="font-serif text-3xl font-normal text-[#252622]">3,400+</div>
                  <div className="font-mono text-[11px] text-[#777873] mt-1 uppercase tracking-wide">
                    New papers per day
                  </div>
                  <p className="text-[11px] text-[#777873] mt-2 leading-tight">
                    Surpasses the human reading bandwidth of any specialized research team.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                  <div className="font-serif text-3xl font-normal text-[#B96645]">74%</div>
                  <div className="font-mono text-[11px] text-[#777873] mt-1 uppercase tracking-wide">
                    Cross-domain gap
                  </div>
                  <p className="text-[11px] text-[#777873] mt-2 leading-tight">
                    Inter-disciplinary citations missed during standard single-database queries.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                  <div className="font-serif text-3xl font-normal text-[#858B70]">18.4 mos</div>
                  <div className="font-mono text-[11px] text-[#777873] mt-1 uppercase tracking-wide">
                    Contradiction latency
                  </div>
                  <p className="text-[11px] text-[#777873] mt-2 leading-tight">
                    Average delay before contradictory evidence becomes widely acknowledged.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                  <div className="font-serif text-3xl font-normal text-[#252622]">0.08%</div>
                  <div className="font-mono text-[11px] text-[#777873] mt-1 uppercase tracking-wide">
                    Dataset co-indexing
                  </div>
                  <p className="text-[11px] text-[#777873] mt-2 leading-tight">
                    Open datasets with explicit, bi-directional lineage mapped back to published claims.
                  </p>
                </div>
              </div>

              {/* Graphic Representation: The Silo Effect */}
              <div className="p-4 rounded-lg border border-[#E3E1D9] bg-[#FAF8F3] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[#777873] text-[11px]">
                  <span>TRADITIONAL SEARCH</span>
                  <span className="text-[#B96645]">Linear Keyword Query</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[#252622]">arXiv</span>
                  <span className="text-[#CCC8BC]">&ne;</span>
                  <span className="px-2 py-1 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[#252622]">PubMed</span>
                  <span className="text-[#CCC8BC]">&ne;</span>
                  <span className="px-2 py-1 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[#252622]">IEEE</span>
                  <span className="text-[#CCC8BC]">&ne;</span>
                  <span className="px-2 py-1 rounded bg-[#FDFCF9] border border-[#E3E1D9] text-[#252622]">Zenodo</span>
                </div>
                <div className="pt-2 border-t border-[#E3E1D9] flex items-center justify-between text-[11px]">
                  <span className="text-[#777873]">PAPERTRAIL SYNTHESIS</span>
                  <span className="text-[#858B70] font-semibold">Navigable Knowledge Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
