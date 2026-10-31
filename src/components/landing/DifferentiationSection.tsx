import React from 'react';
import { Check, X } from 'lucide-react';

export const DifferentiationSection: React.FC = () => {
  const comparisons = [
    {
      dimension: 'Paper Summaries',
      conventional: 'Static abstract summaries of single PDFs; summarizes what is already written.',
      conventionalSupport: 'Limited to isolated documents',
      papertrail: 'Contextual synthesis linked directly to underlying datasets, citations, and methodology details.',
      papertrailHighlight: 'Full provenance & evidence backing',
    },
    {
      dimension: 'Cross-Paper Connections',
      conventional: 'Basic keyword matching or simple citation counts without deep semantic understanding.',
      conventionalSupport: 'Shallow bibliographies',
      papertrail: 'Autonomous multi-hop relational mesh discovering hidden bridges across disciplines and datasets.',
      papertrailHighlight: 'Deep graph topology traversal',
    },
    {
      dimension: 'Contradiction Discovery',
      conventional: 'Rarely surfaces disagreements; treats conflicting papers as independent standalone documents.',
      conventionalSupport: 'Blind to empirical conflicts',
      papertrail: 'Automated claim dissonance analysis flagging conflicting sample sizes, timelines, and outcomes.',
      papertrailHighlight: 'Identifies methodology divergences',
    },
    {
      dimension: 'Research Evolution Tracking',
      conventional: 'Static snapshots sorted merely by publication date with no conceptual progression model.',
      conventionalSupport: 'Chronological list only',
      papertrail: 'Living progression timeline tracking how scientific consensus forms, shifts, and invalidates older claims.',
      papertrailHighlight: 'Maps paradigm evolution over time',
    },
    {
      dimension: 'Potential Research Gap Discovery',
      conventional: 'Cannot formulate what is missing; restricted strictly to provided document contents.',
      conventionalSupport: 'No hypothesis formulation',
      papertrail: 'Algorithmic white space detection surfacing unexplored intersections and viable grant/study questions.',
      papertrailHighlight: 'Novelty-ranked research opportunities',
    },
  ];

  return (
    <section id="differentiation" className="relative py-24 sm:py-32 bg-[#F7F6F2] border-b border-[#E3E1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-[#777873]">
            <span>Section 06</span>
            <span className="text-[#CCC8BC]">/</span>
            <span className="text-[#B96645] font-semibold">The Strategic Distinction</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#252622] leading-[1.08]">
            Not another <br />
            <span className="italic text-[#B96645]">research summarizer.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#777873] leading-relaxed">
            Other AI tools summarize what researchers already know. 
            PaperTrail helps discover what they haven't connected yet.
          </p>
        </div>

        {/* Editorial Comparison Matrix Table */}
        <div className="rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-[#FAF8F3] border-b border-[#E3E1D9] p-4 sm:p-6 text-xs font-mono text-[#777873]">
            <div className="col-span-12 md:col-span-4 uppercase font-semibold text-[#252622]">
              Capability Dimension
            </div>
            <div className="hidden md:block col-span-4 uppercase font-semibold text-[#777873]">
              Conventional Research Tools
            </div>
            <div className="hidden md:block col-span-4 uppercase font-semibold text-[#B96645]">
              PaperTrail Autonomous Discovery
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#E3E1D9]">
            {comparisons.map((row, idx) => (
              <div 
                key={idx}
                className="grid grid-cols-12 p-4 sm:p-6 gap-4 items-center hover:bg-[#FAF8F3]/60 transition-colors"
              >
                {/* Dimension Name */}
                <div className="col-span-12 md:col-span-4">
                  <span className="font-mono text-xs text-[#B96645] block md:hidden mb-1">
                    0{idx + 1}
                  </span>
                  <h4 className="font-serif text-lg font-semibold text-[#252622]">
                    {row.dimension}
                  </h4>
                </div>

                {/* Conventional Column */}
                <div className="col-span-12 md:col-span-4 p-3 rounded-lg bg-[#F7F6F2] md:bg-transparent border border-[#E3E1D9] md:border-none">
                  <div className="md:hidden text-[10px] font-mono text-[#777873] mb-1 uppercase font-semibold">
                    Conventional Tools:
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[#9D9E99] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#777873] leading-relaxed">
                        {row.conventional}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-[#9D9E99]">
                        {row.conventionalSupport}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PaperTrail Column */}
                <div className="col-span-12 md:col-span-4 p-3 rounded-lg bg-[#FAF8F3] md:bg-transparent border border-[#B96645]/30 md:border-none">
                  <div className="md:hidden text-[10px] font-mono text-[#B96645] mb-1 uppercase font-semibold">
                    PaperTrail:
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#B96645] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#252622] font-medium leading-relaxed">
                        {row.papertrail}
                      </p>
                      <span className="inline-block mt-1.5 text-[10px] font-mono text-[#858B70] bg-[#EBECE6] px-2 py-0.5 rounded font-semibold">
                        {row.papertrailHighlight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Footer Quote */}
          <div className="p-4 sm:p-6 bg-[#FAF8F3] border-t border-[#E3E1D9] text-center font-serif italic text-base text-[#777873]">
            "The most significant scientific breakthroughs happen at the uncharted seams between disciplines."
          </div>
        </div>
      </div>
    </section>
  );
};
