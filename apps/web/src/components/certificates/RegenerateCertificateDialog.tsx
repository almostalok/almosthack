'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { RotateCw, X, ShieldCheck } from 'lucide-react';
import { CertificateItem } from './certificates-types';

export interface RegenerateCertificateDialogProps {
  certificate: CertificateItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason?: string) => void;
  isRegenerating: boolean;
}

export const RegenerateCertificateDialog: React.FC<RegenerateCertificateDialogProps> = ({
  certificate,
  isOpen,
  onClose,
  onConfirm,
  isRegenerating,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !certificate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(certificate.id, reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="regen-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <RotateCw className="w-4 h-4" />
            </div>
            <div>
              <h3 id="regen-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Regenerate Credential
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Re-sign and re-issue {certificate.participantName}&apos;s credential.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6D7068] hover:text-[#171914] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#171914] leading-relaxed">
          Regenerating will recalculate the cryptographic SHA-256 signature hash and update the published verification artifact.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
              Reason for Regeneration (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Name spelling correction or track transfer..."
              className="w-full bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-body text-[#171914] focus:outline-none focus:border-[#028051]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isRegenerating}
              className="text-xs font-mono h-8"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isRegenerating}
              leftIcon={<RotateCw className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
            >
              Regenerate Certificate
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
