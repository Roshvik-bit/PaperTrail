'use client';

import React from 'react';
import { Dataset } from '@/types';
import { Database, ExternalLink, ShieldCheck, Tag, FileText, HelpCircle } from 'lucide-react';

interface Props {
  datasets: Dataset[];
}

export function DatasetExplorerView({ datasets }: Props) {
  if (datasets.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface">
        <Database className="w-10 h-10 text-content-muted mx-auto mb-3" />
        <h4 className="text-base font-semibold text-content-primary">No Datasets Discovered Yet</h4>
        <p className="text-xs text-content-secondary max-w-md mx-auto mt-1">
          PaperTrail queries Hugging Face Datasets, Zenodo, and Figshare to connect accessible benchmarks with experimental papers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-content-primary flex items-center space-x-2">
            <Database className="w-5 h-5 text-accent" />
            <span>Accessible Research Datasets & Benchmarks</span>
          </h3>
          <p className="text-xs text-content-secondary mt-0.5">
            Discovering public datasets on Hugging Face, Zenodo, and GitHub verified for licensing, availability, and benchmark usage.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-surface border border-border text-content-secondary">
          {datasets.length} benchmark dataset{datasets.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className="p-5 rounded-xl border border-border bg-surface hover:border-accent/40 transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="px-2 py-0.5 rounded font-mono font-bold uppercase bg-accent/10 text-accent border border-accent/20">
                {dataset.source_repository}
              </span>
              <span className="font-mono text-content-muted text-[11px]">
                License: <span className="text-content-primary">{dataset.license}</span>
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-content-primary">
                {dataset.title}
              </h4>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                {dataset.description}
              </p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-[11px] font-mono text-content-muted">
                <span>By {dataset.creator || 'Community'}</span>
                <span>•</span>
                <span className="text-accent">{dataset.availability}</span>
              </div>

              {dataset.access_url && (
                <a
                  href={dataset.access_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-accent hover:underline font-mono"
                >
                  <span>Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
