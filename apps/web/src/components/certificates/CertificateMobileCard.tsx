'use client';

import React from 'react';
import { Award, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Copy, ExternalLink, Download } from 'lucide-react';
import { CertificateItem } from './certificates-types';
import { Avatar } from '@almosthack/ui';

export interface CertificateMobileCardProps {
  certificate: CertificateItem;
  onSelect: (certificate: CertificateItem) => void;
  onCopyVerification: (verificationUrl: string) => void;
}

export const CertificateMobileCard: React.FC<CertificateMobileCardProps> = ({
  certificate,
  onSelect,
  onCopyVerification,
}) => {
  const getStatusBadge = () => {
    switch (certificate.status) {
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3 h-3" />
            ISSUED
          </span>
        );
      case 'PENDING':
      case 'GENERATING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            <AlertTriangle className="w-3 h-3" />
            FAILED
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#EAE7DC] text-[#6D7068] border border-[#DCDDD3]">
            <ShieldAlert className="w-3 h-3" />
            REVOKED
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            name={certificate.participantName}
            src={certificate.participantAvatar}
            size="sm"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-heading font-bold text-[#171914] truncate">
              {certificate.participantName}
            </h4>
            <span className="text-[11px] font-body text-[#6D7068] block truncate">
              {certificate.participantEmail}
            </span>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      <div className="space-y-1 text-xs">
        <div className="font-heading font-bold text-[#171914] text-xs">
          {certificate.title}
        </div>
        <div className="text-[11px] font-mono text-[#6D7068]">
          Team: {certificate.teamName || '—'} · ID: {certificate.verificationId}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#DCDDD3]/70 text-xs font-mono">
        <button
          type="button"
          onClick={() => onCopyVerification(certificate.verificationUrl)}
          className="text-[#6D7068] hover:text-[#171914] flex items-center gap-1 cursor-pointer"
        >
          <Copy className="w-3 h-3" />
          <span>Copy Link</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(certificate)}
          className="text-[#028051] font-bold hover:underline cursor-pointer"
        >
          View Credential
        </button>
      </div>
    </div>
  );
};
