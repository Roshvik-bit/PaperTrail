import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FinalCtaSectionProps {
  onStartExploring: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onStartExploring }) => {
  return (
    <section className="relative py-28 sm:py-36 bg-[#FDFCF9] overflow-hidden border-b border-[#E3E1D9]">
      {/* Background paper grid */}
      <div className="absolute inset-0 bg-paper-grid opacity-35 pointer-events-none" />

      {/* Elegant Editorial Scientific Graphic Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-40">
        <svg viewBox="0 0 600 600" className="w-full h-full" fill="none">
          <circle cx="300" cy="300" r="240" stroke="#E3E1D9" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="300" cy="300" r="160" stroke="#E3E1D9" strokeWidth="1" />
          <circle cx="300" cy="300" r="80" stroke="#E3E1D9" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="60" y1="300" x2="540" y2="300" stroke="#E3E1D9" strokeWidth="0.8" />
          <line x1="300" y1="60" x2="300" y2="540" stroke="#E3E1D9" strokeWidth="0.8" />
          <circle cx="300" cy="140" r="4" fill="#B96645" />
          <circle cx="460" cy="300" r="4" fill="#858B70" />
          <circle cx="220" cy="380" r="3" fill="#252622" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono uppercase tracking-widest text-[#777873]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
          <span>PaperTrail Autonomous Discovery</span>
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#252622] leading-[1.06]">
          There's more to discover <br className="hidden sm:inline" />
          <span className="italic text-[#B96645]">between the papers.</span>
        </h2>

        <p className="text-base sm:text-xl text-[#777873] max-w-2xl mx-auto font-sans leading-relaxed">
          Follow the evidence. Explore the connections. Find the questions worth asking.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartExploring}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#252622] text-[#FDFCF9] font-medium text-xs tracking-wide hover:bg-[#383A34] transition-all shadow-paper active:scale-[0.98]"
          >
            <span>Start exploring</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#CCC8BC]" />
          </button>
        </div>

        <p className="text-xs font-mono text-[#9D9E99] pt-2">
          An autonomous research intelligence platform for curious minds.
        </p>
      </div>
    </section>
  );
};
