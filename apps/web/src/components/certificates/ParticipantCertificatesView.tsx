'use client';

import React, { useState } from 'react';
import { Award, ShieldCheck, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@almosthack/ui';
import { MOCK_CERTIFICATES } from './certificates-mock-data';
import { CertificateItem } from './certificates-types';
import { CertificatePreviewModal } from './CertificatePreviewModal';

export const ParticipantCertificatesView: React.FC = () => {
  // Filter for participant's own issued certificates
  const myCertificates = MOCK_CERTIFICATES.filter((c) => c.status === 'ISSUED');
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left font-body">
      <div className="space-y-1 pb-3 border-b border-[#DCDDD3]">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#028051]" />
          <h1 className="text-2xl font-heading font-extrabold text-[#171914] tracking-tight">
            My Verifiable Credentials
          </h1>
        </div>
        <p className="text-xs text-[#6D7068]">
          Official credentials and achievement certificates earned from hackathons.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {myCertificates.map((cert) => (
          <div
            key={cert.id}
            className="p-5 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
                  {cert.type}
                </span>
                <span className="text-[10px] font-mono text-[#6D7068]">
                  ID: {cert.verificationId}
                </span>
              </div>

              <h3 className="font-heading font-bold text-sm text-[#171914]">
                {cert.title}
              </h3>

              <p className="text-xs text-[#6D7068]">
                {cert.hackathonName} · Team: {cert.teamName || '—'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#DCDDD3]/70 flex items-center justify-between font-mono text-xs">
              <button
                type="button"
                onClick={() => handleCopy(cert.id, cert.verificationUrl)}
                className="text-[#6D7068] hover:text-[#171914] flex items-center gap-1 cursor-pointer"
              >
                {copiedId === cert.id ? (
                  <Check className="w-3.5 h-3.5 text-[#028051]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === cert.id ? 'Copied' : 'Share Link'}</span>
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedCert(cert)}
                className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
              >
                View Credential
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CertificatePreviewModal
        certificate={selectedCert}
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
};
