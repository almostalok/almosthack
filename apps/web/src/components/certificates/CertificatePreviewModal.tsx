'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { CertificateItem } from './certificates-types';
import { CertificateArtifactView } from './CertificateArtifactView';

export interface CertificatePreviewModalProps {
  certificate: CertificateItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRevoke?: (certificate: CertificateItem) => void;
  onOpenRegenerate?: (certificate: CertificateItem) => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onOpenRevoke,
  onOpenRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      // Generate client-side text download file fallback
      const element = document.createElement('a');
      const file = new Blob(
        [
          `ALMOSTHACK VERIFIED CREDENTIAL\n\nTitle: ${certificate.title}\nRecipient: ${certificate.participantName}\nHackathon: ${certificate.hackathonName}\nVerification ID: ${certificate.verificationId}\nVerification URL: ${certificate.verificationUrl}\nSignature Hash: ${certificate.signatureHash}\nIssued: ${certificate.issuedAt || 'Pending'}\n`,
        ],
        { type: 'text/plain' }
      );
      element.href = URL.createObjectURL(file);
      element.download = `${certificate.verificationId}-credential.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-preview-title"
    >
      <div className="bg-[#F7F4EA] border border-[#DCDDD3] rounded-[12px] shadow-2xl max-w-3xl w-full p-6 space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 id="cert-preview-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Official Credential Preview
              </h3>
              <p className="text-[11px] font-mono text-[#6D7068]">
                Verification ID: {certificate.verificationId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Paper Artifact */}
        <div className="py-2 overflow-hidden">
          <CertificateArtifactView certificate={certificate} />
        </div>

        {/* Metadata Details & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DCDDD3] font-mono text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#028051]" /> : <Copy className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8"
            >
              {copied ? 'Link Copied' : 'Copy Verification Link'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              isLoading={isDownloading}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
            >
              Download Credential
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {certificate.status === 'ISSUED' && onOpenRevoke && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRevoke(certificate);
                }}
                className="text-xs text-[#DC2626] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke</span>
              </button>
            )}

            {(certificate.status === 'FAILED' || certificate.status === 'REVOKED') && onOpenRegenerate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegenerate(certificate);
                }}
                className="text-xs text-[#028051] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs font-mono h-8"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
