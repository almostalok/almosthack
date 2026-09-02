'use client';

import React from 'react';
import { Award, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Users } from 'lucide-react';
import { CertificateSummaryMetrics } from './certificates-types';

export interface CertificateSummaryCardsProps {
  summary: CertificateSummaryMetrics;
}

export const CertificateSummaryCards: React.FC<CertificateSummaryCardsProps> = ({
  summary,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left font-mono text-xs">
      {/* Total Eligible */}
      <div className="p-3.5 bg-[#FFFDF8] rounded-[10px] border border-[#DCDDD3] shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Eligible Pool</span>
          <Users className="w-3.5 h-3.5 text-[#6D7068]" />
        </div>
        <div className="text-lg font-heading font-extrabold text-[#171914]">
          {summary.totalEligible}
        </div>
        <span className="text-[10px] text-[#6D7068] block">Verified Participants</span>
      </div>

      {/* Issued */}
      <div className="p-3.5 bg-[#FFFDF8] rounded-[10px] border border-[#DCDDD3] shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Issued</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
        </div>
        <div className="text-lg font-heading font-extrabold text-[#028051]">
          {summary.totalIssued}
        </div>
        <span className="text-[10px] text-[#028051] block font-bold">Publicly Verifiable</span>
      </div>

      {/* Pending */}
      <div className="p-3.5 bg-[#FFFDF8] rounded-[10px] border border-[#DCDDD3] shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Pending</span>
          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
        </div>
        <div className="text-lg font-heading font-extrabold text-[#D97706]">
          {summary.totalPending + summary.totalGenerating}
        </div>
        <span className="text-[10px] text-[#6D7068] block">In Queue / Generating</span>
      </div>

      {/* Failed */}
      <div className="p-3.5 bg-[#FFFDF8] rounded-[10px] border border-[#DCDDD3] shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Failed</span>
          <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
        </div>
        <div className="text-lg font-heading font-extrabold text-[#DC2626]">
          {summary.totalFailed}
        </div>
        <span className="text-[10px] text-[#6D7068] block">Requires Retry</span>
      </div>

      {/* Revoked */}
      <div className="p-3.5 bg-[#FFFDF8] rounded-[10px] border border-[#DCDDD3] shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#6D7068]">Revoked</span>
          <ShieldAlert className="w-3.5 h-3.5 text-[#6D7068]" />
        </div>
        <div className="text-lg font-heading font-extrabold text-[#171914]">
          {summary.totalRevoked}
        </div>
        <span className="text-[10px] text-[#6D7068] block">Invalidated</span>
      </div>
    </div>
  );
};
