'use client';

import React from 'react';
import { 
  Network, 
  FileText, 
  Sparkles, 
  Layers, 
  ArrowRightLeft, 
  Clock, 
  ShieldAlert, 
  GitCompare, 
  Database, 
  Shuffle, 
  HardDrive, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  FlaskConical,
  Compass
} from 'lucide-react';

export type WorkspaceTab = 
  | 'discovery' 
  | 'graph' 
  | 'claims' 
  | 'disagreements' 
  | 'gaps' 
  | 'timeline' 
  | 'lineages' 
  | 'retractions' 
  | 'datasets' 
  | 'cross-domain';

interface PaperTrailSidebarProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  counts?: {
    papers?: number;
    claims?: number;
    disagreements?: number;
    gaps?: number;
    datasets?: number;
    retractions?: number;
    evolutionEvents?: number;
  };
  onOpenStorage: () => void;
}

export const PaperTrailSidebar: React.FC<PaperTrailSidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  counts = {},
  onOpenStorage,
}) => {
  const sections = [
    {
      title: 'WORKSPACE',
      items: [
        {
          id: 'discovery' as WorkspaceTab,
          label: 'Overview & Papers',
          icon: Compass,
          badge: counts.papers ? `${counts.papers} papers` : undefined,
          badgeColor: 'text-[#858B70] bg-[#858B70]/10',
        },
      ],
    },
    {
      title: 'RESEARCH INTELLIGENCE',
      items: [
        {
          id: 'graph' as WorkspaceTab,
          label: 'Evidence Graph',
          icon: Network,
          badge: counts.claims ? `${counts.claims} claims` : undefined,
          badgeColor: 'text-[#252622] bg-[#FAF8F3]',
        },
        {
          id: 'claims' as WorkspaceTab,
          label: 'Grounded Claims',
          icon: FileText,
          badge: counts.claims ? String(counts.claims) : undefined,
          badgeColor: 'text-[#777873] bg-[#EFECE5]',
        },
        {
          id: 'disagreements' as WorkspaceTab,
          label: 'Contradictions & Divergence',
          icon: ArrowRightLeft,
          badge: counts.disagreements ? String(counts.disagreements) : undefined,
          badgeColor: 'text-[#B96645] bg-[#B96645]/15 font-semibold',
        },
        {
          id: 'gaps' as WorkspaceTab,
          label: 'Research Gaps & Audits',
          icon: Sparkles,
          badge: counts.gaps ? String(counts.gaps) : undefined,
          badgeColor: 'text-[#B96645] bg-[#B96645]/10',
        },
        {
          id: 'datasets' as WorkspaceTab,
          label: 'Accessible Datasets',
          icon: Database,
          badge: counts.datasets ? String(counts.datasets) : undefined,
          badgeColor: 'text-[#858B70] bg-[#858B70]/10',
        },
      ],
    },
    {
      title: 'CONTINUOUS INTELLIGENCE',
      items: [
        {
          id: 'timeline' as WorkspaceTab,
          label: 'Evidence Evolution',
          icon: Clock,
          badge: counts.evolutionEvents ? String(counts.evolutionEvents) : undefined,
          badgeColor: 'text-[#777873] bg-[#FAF8F3]',
        },
        {
          id: 'lineages' as WorkspaceTab,
          label: 'Preprint Lineages',
          icon: GitCompare,
        },
        {
          id: 'retractions' as WorkspaceTab,
          label: 'Retraction Intelligence',
          icon: ShieldAlert,
          badge: counts.retractions ? String(counts.retractions) : undefined,
          badgeColor: 'text-[#B96645] bg-[#B96645]/20 font-bold',
        },
        {
          id: 'cross-domain' as WorkspaceTab,
          label: 'Cross-Domain Transfer',
          icon: Shuffle,
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#FDFCF9] border-r border-[#E3E1D9] transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Collapse Toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#E3E1D9]">
        {!collapsed && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#777873] px-2 font-semibold">
            Intelligence Matrix
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-md text-[#777873] hover:text-[#252622] hover:bg-[#FAF8F3] border border-transparent hover:border-[#E3E1D9] transition-colors ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#9D9E99] font-medium mb-1">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left group ${
                      isActive
                        ? 'bg-[#FAF8F3] text-[#252622] font-semibold border border-[#E3E1D9] shadow-[0_1px_2px_rgba(37,38,34,0.03)]'
                        : 'text-[#777873] hover:text-[#252622] hover:bg-[#FAF8F3]/60'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-[#B96645]' : 'text-[#777873] group-hover:text-[#252622]'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 tracking-tight">
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${item.badgeColor || 'text-[#777873] bg-[#EFECE5]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Storage Management trigger */}
      <div className="p-2 border-t border-[#E3E1D9] bg-[#FAF8F3]">
        <button
          onClick={onOpenStorage}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-[#777873] hover:text-[#252622] hover:bg-[#FDFCF9] border border-transparent hover:border-[#E3E1D9] transition-all ${
            collapsed ? 'justify-center px-1' : ''
          }`}
          title="Manage Local Database & Research Sync"
        >
          <HardDrive className="w-4 h-4 text-[#858B70] flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="font-semibold text-[#252622]">Research Store</span>
              <span className="text-[10px] text-[#858B70]">SQLite & Supabase</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

