'use client';

import React, { useState } from 'react';
import { PaperTrailTopbar } from './PaperTrailTopbar';
import { PaperTrailSidebar, WorkspaceTab } from './PaperTrailSidebar';
import { StoragePortabilityModal } from '../StoragePortabilityModal';
import { ResearchSession } from '@/types';

interface PaperTrailShellProps {
  children: React.ReactNode;
  activeSession: ResearchSession | null;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onNewInquiry: () => void;
  counts?: {
    papers?: number;
    claims?: number;
    disagreements?: number;
    gaps?: number;
    datasets?: number;
    retractions?: number;
    evolutionEvents?: number;
  };
}

export const PaperTrailShell: React.FC<PaperTrailShellProps> = ({
  children,
  activeSession,
  activeTab,
  onTabChange,
  onNewInquiry,
  counts,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storageModalOpen, setStorageModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col font-sans text-[#252622]">
      {/* Top Application Bar */}
      <PaperTrailTopbar
        activeSession={activeSession}
        onNewInquiry={onNewInquiry}
        onOpenStorage={() => setStorageModalOpen(true)}
        paperCount={counts?.papers}
        claimCount={counts?.claims}
      />

      {/* Main Workspace Frame with Collapsible Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <PaperTrailSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          counts={counts}
          onOpenStorage={() => setStorageModalOpen(true)}
        />

        {/* Primary Scientific Inquiry Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#F7F6F2] flex flex-col">
          {children}
        </main>
      </div>

      {/* Local SQLite / Supabase Storage & Portability Modal */}
      <StoragePortabilityModal
        isOpen={storageModalOpen}
        onClose={() => setStorageModalOpen(false)}
        activeSessionId={activeSession?.id}
      />
    </div>
  );
};

