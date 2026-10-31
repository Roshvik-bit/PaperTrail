'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PaperTrailLogo } from './PaperTrailLogo';
import { Network, ArrowUpRight, Compass, HardDrive, Sparkles } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: Compass },
    { href: '/workspace', label: 'Investigation Workspace', icon: Network },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E3E1D9] bg-[#FDFCF9]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <PaperTrailLogo size={28} />
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#E3E1D9]">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-[#FAF8F3] text-[#252622] font-semibold border border-[#E3E1D9]'
                      : 'text-[#777873] hover:text-[#252622] hover:bg-[#FAF8F3]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#B96645]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side status & action */}
        <div className="flex items-center space-x-3">
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[11px] font-mono text-[#777873]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#858B70]" />
            <span>Multi-Provider Discovery: OpenAlex • arXiv • S2 • Crossref</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[11px] font-mono text-[#858B70]">
            <HardDrive className="w-3.5 h-3.5" />
            <span>SQLite & Supabase Ready</span>
          </div>

          <Link
            href="/workspace"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#252622] text-[#FDFCF9] hover:bg-[#383A34] transition-all shadow-[0_1px_3px_rgba(37,38,34,0.08)] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EFECE5]" />
            <span>Enter Workspace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
