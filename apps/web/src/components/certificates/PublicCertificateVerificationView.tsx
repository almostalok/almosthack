'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Award, Calendar, ExternalLink, CheckCircle2, QrCode } from 'lucide-react';
import { CertificateItem } from './certificates-types';
import { MOCK_CERTIFICATES } from './certificates-mock-data';
import { CertificateArtifactView } from './CertificateArtifactView';

export interface PublicCertificateVerificationViewProps {
  certificateId: string;
}

export const PublicCertificateVerificationView: React.FC<PublicCertificateVerificationViewProps> = ({
  certificateId,
}) => {
  // Find matching certificate from mock or query
  const cert = MOCK_CERTIFICATES.find(
    (c) => c.verificationId === certificateId || c.id === certificateId
  );

  if (!cert) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-center space-y-4 font-body">
        <div className="w-12 h-12 rounded-full bg-[#FBE6E3] text-[#DC2626] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-heading font-extrabold text-[#171914]">
          Certificate Not Found
        </h2>
        <p className="text-xs text-[#6D7068]">
          No cryptographic record exists for verification ID <code className="font-mono font-bold text-[#171914]">{certificateId}</code>.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="text-xs font-mono text-[#028051] hover:underline font-bold"
          >
            ← Back to AlmostHack
          </Link>
        </div>
      </div>
    );
  }

  const isRevoked = cert.status === 'REVOKED';

  return (
    <div className="max-w-3xl mx-auto my-8 space-y-6 text-left font-body">
      {/* Verification Status Banner */}
      <div
        className={`p-4 rounded-[10px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
          isRevoked
            ? 'bg-[#FBE6E3] border-[#F3C9B2] text-[#8B2C24]'
            : 'bg-[#E2EBDD] border-[#B8CEB0] text-[#274535]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isRevoked ? (
            <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#028051] shrink-0" />
          )}
          <div>
            <span className="font-bold block uppercase tracking-wider">
              {isRevoked ? 'Certificate Revoked' : 'Authentic & Verified Certificate'}
            </span>
            <span className="text-[11px] block opacity-90">
              {isRevoked
                ? `Revoked on ${cert.revokedAt ? new Date(cert.revokedAt).toLocaleDateString('en-US') : 'Recent Date'}: ${cert.revocationReason || 'Invalidated by organizer.'}`
                : 'Cryptographically validated against the AlmostHack decentralized registry.'}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFFDF8] border border-current self-start sm:self-auto shrink-0">
          ID: {cert.verificationId}
        </span>
      </div>

      {/* Visual Certificate Paper View */}
      <div className="bg-[#F7F4EA] p-4 sm:p-6 rounded-[12px] border border-[#DCDDD3] shadow-xs">
        <CertificateArtifactView certificate={cert} />
      </div>

      {/* Public Metadata Card */}
      <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-3 text-xs font-mono">
        <h4 className="font-bold font-heading text-[#171914] uppercase text-xs border-b border-[#DCDDD3] pb-2">
          Public Credential Verification Record
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-[#6D7068] block uppercase">Recipient Name</span>
            <span className="font-bold text-[#171914]">{cert.participantName}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#6D7068] block uppercase">Hackathon Name</span>
            <span className="font-bold text-[#171914]">{cert.hackathonName}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#6D7068] block uppercase">Award / Designation</span>
            <span className="font-bold text-[#028051]">{cert.title}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#6D7068] block uppercase">Signature Hash (SHA-256)</span>
            <span className="font-mono text-[11px] text-[#171914] truncate block">
              {cert.signatureHash}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
