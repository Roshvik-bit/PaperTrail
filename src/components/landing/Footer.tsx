import React from 'react';
import { PaperTrailLogo } from '../PaperTrailLogo';
import { Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="about" className="bg-[#F7F6F2] pt-20 pb-14 text-sm text-[#777873]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#E3E1D9]">
          {/* Brand & Publication Description */}
          <div className="md:col-span-5 space-y-4">
            <PaperTrailLogo />
            <p className="text-xs text-[#777873] leading-relaxed max-w-sm font-sans pt-1">
              PaperTrail is an AI-powered autonomous research discovery platform. 
              We uncover connections between scientific research, identify contradictory findings, 
              and surface unexplored questions waiting to be answered.
            </p>
            <div className="font-mono text-xs text-[#858B70] flex items-center gap-2 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#858B70]" />
              <span>Research Intelligence Engine v2.4</span>
            </div>
          </div>

          {/* Navigation Column 1: Editorial Sections */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <h5 className="font-semibold uppercase tracking-wider text-[#252622]">
              Navigation
            </h5>
            <ul className="space-y-2">
              <li>
                <a href="#discover" className="hover:text-[#252622] transition-colors">
                  Product Preview
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#252622] transition-colors">
                  Capabilities
                </a>
              </li>
              <li>
                <a href="#methodology" className="hover:text-[#252622] transition-colors">
                  Methodology
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#252622] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#differentiation" className="hover:text-[#252622] transition-colors">
                  The Distinction
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Core Capabilities */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <h5 className="font-semibold uppercase tracking-wider text-[#252622]">
              Capabilities
            </h5>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-[#252622] transition-colors">
                  Connected Research
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#252622] transition-colors">
                  Contradictory Evidence
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#252622] transition-colors">
                  Evolving Knowledge
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#252622] transition-colors">
                  Unanswered Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Technology & Credits */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#252622]">
              Technology & Credits
            </h5>
            <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#252622] font-semibold font-mono">
                <Globe className="w-3.5 h-3.5 text-[#B96645]" />
                <span>TinyFish Autonomous Web Crawl</span>
              </div>
              <p className="text-[11px] text-[#777873] leading-relaxed">
                Autonomous navigation across digital research archives, reference traversal, and multi-source document harvesting is powered by TinyFish technology.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#9D9E99]">
          <div>
            &copy; 2026 PaperTrail Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Autonomous Web Traversal Powered by TinyFish</span>
            <span>•</span>
            <span>Swiss Editorial Research Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
