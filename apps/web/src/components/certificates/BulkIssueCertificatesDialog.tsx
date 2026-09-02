'use client';

import React, { useState } from 'react';
import { Button } from '@almosthack/ui';
import { Stamp, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CertificateType } from './certificates-types';

export interface BulkIssueCertificatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: CertificateType | 'ALL') => void;
  isIssuing: boolean;
  totalEligible: number;
}

export const BulkIssueCertificatesDialog: React.FC<BulkIssueCertificatesDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isIssuing,
  totalEligible,
}) => {
  const [selectedType, setSelectedType] = useState<CertificateType | 'ALL'>('ALL');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131413]/60 backdrop-blur-xs text-left animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-issue-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between border-b border-[#DCDDD3] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
              <Stamp className="w-4 h-4" />
            </div>
            <div>
              <h3 id="bulk-issue-title" className="text-sm font-heading font-extrabold text-[#171914]">
                Bulk Issue Credentials
              </h3>
              <p className="text-xs text-[#6D7068] font-body">
                Generate cryptographic certificates for verified participants.
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

        <div className="p-3 bg-[#E2EBDD]/40 rounded-[8px] border border-[#B8CEB0] text-xs font-mono text-[#274535] space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
            <span>Eligible Pool Verified</span>
          </div>
          <p>
            {totalEligible} participant records meet attendance and project submission criteria.
          </p>
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-[10px] font-mono font-bold uppercase text-[#171914]">
            Certificate Type Scope
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] p-2 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051]"
          >
            <option value="ALL">All Eligible Types (Participation & Honors)</option>
            <option value="PARTICIPATION">Participation Credentials Only</option>
            <option value="WINNER">Winner & Track Honors Only</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isIssuing}
            className="text-xs font-mono h-8"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirm(selectedType)}
            isLoading={isIssuing}
            leftIcon={<Stamp className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
          >
            Start Bulk Issuance
          </Button>
        </div>
      </div>
    </div>
  );
};
