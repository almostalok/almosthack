'use client';

import React from 'react';
import { ShieldCheck, Award, Sparkles, QrCode } from 'lucide-react';
import { CertificateItem } from './certificates-types';

export interface CertificateArtifactViewProps {
  certificate: CertificateItem;
  className?: string;
}

export const CertificateArtifactView: React.FC<CertificateArtifactViewProps> = ({
  certificate,
  className = '',
}) => {
  return (
    <div
      className={`relative p-8 sm:p-12 rounded-[8px] bg-[#FFFDF8] border-8 border-double border-[#DCDDD3] shadow-md text-center max-w-2xl mx-auto font-body text-[#171914] ${className}`}
      style={{ aspectRatio: '1.414 / 1' }}
    >
      {/* Corner Ornaments */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#028051]" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#028051]" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#028051]" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#028051]" />

      <div className="h-full flex flex-col justify-between items-center py-2 space-y-4">
        {/* Certificate Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#028051] uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>AlmostHack Verified Credential</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#171914] tracking-tight uppercase">
            {certificate.title}
          </h2>
          <p className="text-xs font-mono text-[#6D7068]">
            {certificate.hackathonName}
          </p>
        </div>

        {/* Recipient Section */}
        <div className="space-y-1.5 my-auto">
          <span className="text-xs font-serif italic text-[#6D7068] block">
            This certifies that
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#171914] border-b-2 border-[#171914] pb-1 px-8 inline-block">
            {certificate.participantName}
          </h1>
          <p className="text-xs text-[#6D7068] max-w-md mx-auto pt-1 leading-relaxed">
            {certificate.type === 'WINNER' || certificate.type === 'TRACK_WINNER'
              ? `has demonstrated technical excellence and earned ${certificate.awardName || 'Top Honors'} as part of Team ${certificate.teamName || 'ByteForge'}.`
              : `has actively built, shipped, and completed verifiable project requirements as part of Team ${certificate.teamName || 'Participant Team'}.`}
          </p>
        </div>

        {/* Verification & Signatures Footer */}
        <div className="w-full pt-4 border-t border-[#DCDDD3] grid grid-cols-3 items-end text-left text-[10px] font-mono">
          {/* Issue Date */}
          <div>
            <span className="text-[#6D7068] block">Issue Date</span>
            <span className="font-bold text-[#171914]">
              {certificate.issuedAt
                ? new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Pending Issuance'}
            </span>
          </div>

          {/* Issuer Seal / Stamp */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#028051] mx-auto flex items-center justify-center bg-[#E2EBDD]/40 text-[#028051]">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[9px] text-[#028051] font-bold block mt-1">
              OFFICIAL SEAL
            </span>
          </div>

          {/* Verification Code */}
          <div className="text-right">
            <span className="text-[#6D7068] block">Credential ID</span>
            <span className="font-bold text-[#171914] block">
              {certificate.verificationId}
            </span>
            <span className="text-[9px] text-[#028051] block truncate">
              {certificate.signatureHash.substring(0, 16)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
