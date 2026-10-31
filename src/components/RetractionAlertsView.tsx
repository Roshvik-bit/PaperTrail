'use client';

import React from 'react';
import { RetractionAlert } from '@/types';
import { ShieldAlert, AlertOctagon, ExternalLink, HelpCircle } from 'lucide-react';

interface Props {
  alerts: RetractionAlert[];
}

export function RetractionAlertsView({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface">
        <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-content-primary">Zero Retractions or Publisher Alerts</h4>
        <p className="text-xs text-content-secondary max-w-md mx-auto mt-1">
          All papers in this research investigation are verified against Crossref Crossmark, OpenAlex retraction registries, and publisher notices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 space-y-1">
        <h4 className="text-sm font-bold text-red-400 flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4" />
          <span>Active Post-Publication Provenance Warnings</span>
        </h4>
        <p className="text-xs text-content-secondary leading-relaxed">
          PaperTrail does not silently delete historical evidence. Retracted studies and dependent claims are preserved with explicit provenance warnings to prevent flawed citations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-5 rounded-xl border-2 border-red-500/50 bg-surface shadow-md space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                {alert.status_type}
              </span>
              {alert.notice_date && (
                <span className="text-[11px] font-mono text-content-muted">
                  Notice Date: {alert.notice_date}
                </span>
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-content-primary">
                {alert.paper_title}
              </h4>
              <p className="text-xs text-content-secondary mt-1">
                <span className="font-semibold text-red-400">Reason:</span> {alert.reason}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-xs font-mono text-red-300">
              {alert.provenance_warning}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-content-muted pt-2 border-t border-border">
              <span>{alert.affected_claim_ids.length} dependent claim(s) flagged</span>
              <span>{alert.affected_gap_ids.length} research gap(s) affected</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

