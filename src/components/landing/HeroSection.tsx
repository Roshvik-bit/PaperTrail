import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { HeroGraph, GraphNode } from './HeroGraph';

interface HeroSectionProps {
  onExploreClick: () => void;
  onHowItWorksClick: () => void;
  onSelectGraphNode: (node: GraphNode) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onHowItWorksClick,
  onSelectGraphNode,
}) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#F7F6F2] overflow-hidden">
      {/* Precision grid backdrop */}
      <div className="absolute inset-0 bg-paper-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Eyebrow */}
        <div className="flex items-center gap-2 mb-6 text-xs font-mono tracking-widest uppercase text-[#777873]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
          <span>A New Perspective on Research</span>
          <span className="text-[#CCC8BC]">•</span>
          <span className="text-[#858B70]">Issue No. 01</span>
        </div>

        {/* Large Editorial Headline */}
        <div className="max-w-5xl">
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#252622] leading-[1.04]">
            Every discovery leaves a trail.{' '}
            <span className="italic font-normal text-[#B96645] block sm:inline">
              Follow where it leads.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#777873] max-w-2xl font-sans leading-relaxed font-normal">
            Explore the connections between research, uncover conflicting findings, 
            and discover questions that remain unanswered.
          </p>
        </div>

        {/* Actions & Research Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8 pt-2">
          <button
            onClick={onExploreClick}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#252622] text-[#FDFCF9] font-medium text-xs tracking-wide hover:bg-[#383A34] transition-all shadow-paper active:scale-[0.98]"
          >
            <span>Explore PaperTrail</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#CCC8BC]" />
          </button>

          <button
            onClick={onHowItWorksClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FDFCF9] text-[#252622] border border-[#E3E1D9] font-medium text-xs tracking-wide hover:bg-[#EFECE5] transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-[#777873]" />
            <span>Discover how it works</span>
          </button>
        </div>

        {/* Technical Citation Metabar */}
        <div className="mt-12 py-3.5 border-t border-b border-[#E3E1D9] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#777873]">
          <div className="flex items-center gap-3">
            <span className="text-[#252622] font-semibold">METHOD:</span>
            <span>Autonomous Web Traversal</span>
            <span className="text-[#CCC8BC]">/</span>
            <span>Multi-Hop Lineage</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Indexed Sources: 12,000+ Preprints</span>
            <span className="text-[#CCC8BC]">/</span>
            <span className="text-[#B96645] font-medium">Contradiction Engine Active</span>
          </div>
        </div>

        {/* Hero Illustration: Scientific Diagram */}
        <div className="mt-8">
          <HeroGraph onSelectNode={onSelectGraphNode} />
        </div>
      </div>
    </section>
  );
};
