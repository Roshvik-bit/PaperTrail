'use client';

import React from 'react';
import { Dataset } from '@/types';
import { Database, ExternalLink, ShieldCheck, Tag, FileText, HelpCircle, HardDrive } from 'lucide-react';

interface Props {
  datasets: Dataset[];
}

export function DatasetExplorerView({ datasets }: Props) {
  if (datasets.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
        <Database className="w-10 h-10 text-[#858B70] mx-auto mb-3" />
        <h4 className="font-serif text-lg font-semibold text-[#252622]">No Datasets Discovered Yet</h4>
        <p className="text-xs text-[#777873] max-w-md mx-auto mt-1 font-sans">
          PaperTrail automatically discovers benchmark datasets on Hugging Face, Zenodo, and Figshare relevant to the active scientific investigation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E1D9]">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#252622] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#858B70]" />
            <span>Accessible Research Datasets & Benchmarks</span>
          </h3>
          <p className="text-xs text-[#777873] mt-0.5 font-sans">
            Public datasets and evaluation benchmarks verified for licensing terms, hosting accessibility, and evaluation linkage.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] self-start sm:self-auto">
          {datasets.length} benchmark dataset{datasets.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className="p-5 rounded-xl border border-[#E3E1D9] bg-[#FDFCF9] hover:border-[#CCC8BC] transition-all space-y-3.5 shadow-paper"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="px-2 py-0.5 rounded font-mono font-bold uppercase bg-[#858B70]/15 text-[#5A6048] border border-[#858B70]/30 text-[10px]">
                {dataset.source_repository}
              </span>
              <span className="font-mono text-[#777873] text-[11px]">
                License: <span className="text-[#252622] font-semibold">{dataset.license}</span>
              </span>
            </div>

            <div>
              <h4 className="font-serif text-base font-semibold text-[#252622] leading-snug">
                {dataset.title}
              </h4>
              <p className="text-xs text-[#777873] mt-1.5 leading-relaxed font-sans line-clamp-3">
                {dataset.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E3E1D9] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#777873]">
                <span>By {dataset.creator || 'Community'}</span>
                <span>•</span>
                <span className="text-[#858B70] font-medium">{dataset.availability}</span>
              </div>

              {dataset.access_url && (
                <a
                  href={dataset.access_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#B96645] hover:underline"
                >
                  <span>Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
