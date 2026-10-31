'use client';

import React from 'react';
import { RetractionAlert } from '@/types';
import { ShieldAlert, AlertOctagon, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';

interface Props {
  alerts: RetractionAlert[];
}

export function RetractionAlertsView({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-[#E3E1D9] bg-[#FDFCF9] shadow-paper">
        <ShieldCheck className="w-10 h-10 text-[#858B70] mx-auto mb-3" />
        <h4 className="font-serif text-lg font-semibold text-[#252622]">Zero Retractions or Publisher Alerts</h4>
        <p className="text-xs text-[#777873] max-w-md mx-auto mt-1 font-sans">
          All papers in this research investigation are verified against Crossref Crossmark, OpenAlex retraction registries, and publisher notices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-[#B96645]/10 border border-[#B96645]/30 space-y-1.5 shadow-paper">
        <h4 className="font-serif text-base font-semibold text-[#B96645] flex items-center gap-2">
          <AlertOctagon className="w-5 h-5" />
          <span>Active Post-Publication Provenance Warnings</span>
        </h4>
        <p className="text-xs text-[#252622] leading-relaxed font-sans">
          PaperTrail does not silently delete historical evidence. Retracted studies and dependent claims are preserved with explicit provenance warnings to prevent flawed citations and recalculate scientific confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-6 rounded-xl border-2 border-[#B96645] bg-[#FDFCF9] shadow-paper space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E3E1D9]">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-[#B96645]/15 text-[#B96645] border border-[#B96645]/30">
                {alert.status_type}
              </span>
              {alert.notice_date && (
                <span className="text-[11px] font-mono text-[#777873]">
                  Notice Date: {alert.notice_date}
                </span>
              )}
            </div>

            <div>
              <h4 className="font-serif text-lg font-semibold text-[#252622]">
                {alert.paper_title}
              </h4>
              <p className="text-xs text-[#777873] mt-1 font-sans">
                <span className="font-semibold text-[#B96645]">Official Notice Reason:</span> {alert.reason}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#B96645]/30 text-xs font-mono text-[#934E32] leading-relaxed">
              {alert.provenance_warning}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#777873] pt-3 border-t border-[#E3E1D9]">
              <span>{alert.affected_claim_ids.length} dependent claim(s) flagged</span>
              <span>{alert.affected_gap_ids.length} research gap(s) affected</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
