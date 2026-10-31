'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { TinyFishSection } from '@/components/landing/TinyFishSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ProductPreviewSection } from '@/components/landing/ProductPreviewSection';
import { DifferentiationSection } from '@/components/landing/DifferentiationSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';
import { Footer } from '@/components/landing/Footer';
import { InteractiveExplorerModal } from '@/components/landing/InteractiveExplorerModal';
import { GraphNode } from '@/components/landing/HeroGraph';
import { X, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [demoTopic] = useState('Impact of artificial intelligence on human learning');

  const handleLaunchApp = () => {
    setIsModalOpen(true);
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#F7F6F2] text-[#252622] font-sans selection:bg-[#B96645]/15 selection:text-[#252622] overflow-x-hidden">
      {/* Sticky Editorial Navbar */}
      <Navigation />

      {/* Main Publication Sections */}
      <main>
        {/* Hero Section with Interactive Academic Topology Diagram */}
        <HeroSection
          onExploreClick={handleLaunchApp}
          onHowItWorksClick={handleScrollToHowItWorks}
          onSelectGraphNode={(node) => setSelectedNode(node)}
        />

        {/* The Problem (2-Column Editorial with Research Metrics) */}
        <ProblemSection />

        {/* Four Core Capabilities (Alternating Editorial Features) */}
        <SolutionSection />

        {/* TinyFish Technology (Process Diagram) */}
        <TinyFishSection />

        {/* How It Works (Four-Stage Diagram) */}
        <HowItWorksSection onLaunchDemo={handleLaunchApp} />

        {/* Product Preview (Warm Light Academic Workspace) */}
        <ProductPreviewSection />

        {/* Strategic Distinction Matrix */}
        <DifferentiationSection />

        {/* Final Publication Call to Action */}
        <FinalCtaSection onStartExploring={handleLaunchApp} />
      </main>

      {/* Publication Footer */}
      <Footer />

      {/* Interactive Explorer / Discovery Demo Modal */}
      <InteractiveExplorerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic={demoTopic}
      />

      {/* Selected Node Inspector Drawer (Persistent bottom-right card) */}
      {selectedNode && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-5 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper-lg animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] font-semibold">
              Selected Entity • {selectedNode.type.toUpperCase()}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded text-[#777873] hover:text-[#252622] hover:bg-[#FAF8F3]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-serif text-lg font-bold text-[#252622] leading-snug">
            {selectedNode.label}
          </h4>
          <p className="text-xs font-mono text-[#858B70] mt-0.5">
            {selectedNode.sublabel}
          </p>
          <p className="text-xs text-[#777873] leading-relaxed mt-2 font-sans">
            {selectedNode.summary}
          </p>

          <div className="mt-4 pt-3 border-t border-[#E3E1D9] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#777873]">
              {selectedNode.citations ? `${selectedNode.citations} verified citations` : 'Primary Evidence Entity'}
            </span>
            <Link
              href={`/workspace?q=${encodeURIComponent(selectedNode.label)}`}
              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#B96645] hover:underline"
            >
              <span>Investigate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
