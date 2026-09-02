'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { CertificateItem } from './certificates-types';

export interface RevokeCertificateDialogProps {
  certificate: CertificateItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  isRevoking: boolean;
}

export const RevokeCertificateDialog: React.FC<RevokeCertificateDialogProps> = ({
  certificate,
  isOpen,
  onClose,
  onConfirm,
  isRevoking,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !certificate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(certificate.id, reason.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FBE6E3] text-[#DC2626] flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="revoke-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Revoke Credential
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Invalidate {certificate.participantName}&apos;s issued certificate.
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

        <div className="p-3 bg-[#FBE6E3]/50 rounded-[8px] border border-[#F3C9B2] text-xs font-mono text-[#8B2C24] space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>High-Impact Action</span>
          </div>
          <p>
            Public verification for ID <strong>{certificate.verificationId}</strong> will immediately return a REVOKED status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
              Revocation Reason (Required)
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Code plagiarism detected or participant disqualified..."
              className="w-full bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-body text-[#171914] focus:outline-none focus:border-[#DC2626] h-18 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isRevoking}
              className="text-xs font-mono h-8"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isRevoking}
              disabled={!reason.trim()}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            >
              Confirm Revocation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
