'use client';

import React from 'react';
import Link from 'next/link';
import { PaperTrailLogo } from '../PaperTrailLogo';
import { ExportDropdown } from '../ExportDropdown';
import { 
  HardDrive, 
  Plus, 
  Search, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Database,
  ArrowRight
} from 'lucide-react';
import { ResearchSession } from '@/types';

interface PaperTrailTopbarProps {
  activeSession: ResearchSession | null;
  onNewInquiry: () => void;
  onOpenStorage: () => void;
  paperCount?: number;
  claimCount?: number;
}

export const PaperTrailTopbar: React.FC<PaperTrailTopbarProps> = ({
  activeSession,
  onNewInquiry,
  onOpenStorage,
  paperCount = 0,
  claimCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF9] border-b border-[#E3E1D9] shadow-[0_1px_2px_rgba(37,38,34,0.03)]">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="hover:opacity-90 transition-opacity flex-shrink-0">
            <PaperTrailLogo size={24} showText={true} />
          </Link>

          <span className="text-[#CCC8BC] select-none">/</span>

          <div className="flex items-center gap-2 min-w-0">
            {activeSession ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] flex-shrink-0">
                  {activeSession.id.slice(0, 14)}
                </span>
                <span 
                  className="font-serif text-sm text-[#252622] truncate max-w-[240px] sm:max-w-[360px] md:max-w-[480px]" 
                  title={activeSession.title || activeSession.research_question}
                >
                  {activeSession.title || activeSession.research_question}
                </span>
              </div>
            ) : (
              <span className="font-serif text-sm text-[#777873] italic">
                Inquiry Desk • No Session Active
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Storage & Local Database Pill */}
          <button
            onClick={onOpenStorage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono text-[#777873] hover:text-[#252622] hover:border-[#CCC8BC] transition-colors"
            title="Local SQLite & Supabase Storage Management"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#858B70]" />
            <span className="hidden md:inline">Storage:</span>
            <span className="text-[#858B70] font-medium">SQLite Active</span>
          </button>

          {/* Export Dropdown */}
          {activeSession && (
            <ExportDropdown 
              sessionId={activeSession.id} 
            />
          )}

          {/* New Inquiry Action */}
          <button
            onClick={onNewInquiry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#252622] text-[#FDFCF9] text-xs font-medium hover:bg-[#383A34] transition-all shadow-[0_1px_2px_rgba(37,38,34,0.06)] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-[#FAF8F3]" />
            <span className="hidden sm:inline">New Scientific Inquiry</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
