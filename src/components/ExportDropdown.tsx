'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileArchive, FileJson, FileText, Bookmark, Table, Printer, ChevronDown } from 'lucide-react';

interface ExportDropdownProps {
  sessionId?: string;
  disabled?: boolean;
}

export function ExportDropdown({ sessionId, disabled }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: string) => {
    if (!sessionId) return;
    setOpen(false);
    const url = `/api/research/sessions/${sessionId}/export?format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled || !sessionId}
        className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-surface-elevated border border-border hover:border-accent text-content-primary disabled:opacity-50 transition-all shadow-sm"
        title="Export complete research investigation"
      >
        <Download className="w-4 h-4 text-accent" />
        <span>Export</span>
        <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface-elevated border border-border shadow-2xl z-50 p-2 space-y-1">
          <div className="px-3 py-1.5 border-b border-border text-[11px] font-mono text-content-muted uppercase">
            Export Investigation
          </div>

          <button
            onClick={() => handleExport('zip')}
            className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-surface transition-colors group"
          >
            <FileArchive className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-content-primary group-hover:text-accent">
                Complete ZIP Archive
              </div>
              <div className="text-[11px] text-content-muted">
                Manifest, papers, claims, evidence, gaps, experiments, graph & reports
              </div>
            </div>
          </button>

          <button
            onClick={() => handleExport('json')}
            className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-surface transition-colors group"
          >
            <FileJson className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-content-primary group-hover:text-emerald-400">
                Consolidated JSON Bundle
              </div>
              <div className="text-[11px] text-content-muted">
                Complete portable schema object
              </div>
            </div>
          </button>

          <button
            onClick={() => handleExport('markdown')}
            className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-surface transition-colors group"
          >
            <FileText className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-content-primary group-hover:text-sky-400">
                Markdown Research Brief
              </div>
              <div className="text-[11px] text-content-muted">
                Human-readable executive brief
              </div>
            </div>
          </button>

          <button
            onClick={() => handleExport('bibtex')}
            className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-surface transition-colors group"
          >
            <Bookmark className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-content-primary group-hover:text-purple-400">
                BibTeX Bibliography (.bib)
              </div>
              <div className="text-[11px] text-content-muted">
                Standard citations for LaTeX / Overleaf
              </div>
            </div>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-surface transition-colors group"
          >
            <Table className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-content-primary group-hover:text-amber-400">
                Papers & Claims CSV
              </div>
              <div className="text-[11px] text-content-muted">
                Tabular format for Excel / Pandas
              </div>
            </div>
          </button>

          <button
            onClick={() => handleExport('html')}
            className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-surface transition-colors group"
          >
            <Printer className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-content-primary group-hover:text-rose-400">
                Printable Brief / Save to PDF
              </div>
              <div className="text-[11px] text-content-muted">
                Formatted HTML report with print styles
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

