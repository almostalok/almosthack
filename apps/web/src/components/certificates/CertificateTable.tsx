'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
  Eye,
  Download,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { Avatar, Button } from '@almosthack/ui';
import { CertificateItem } from './certificates-types';
import { CertificateMobileCard } from './CertificateMobileCard';

export interface CertificateTableProps {
  certificates: CertificateItem[];
  onSelect: (certificate: CertificateItem) => void;
  onOpenRevoke: (certificate: CertificateItem) => void;
  onOpenRegenerate: (certificate: CertificateItem) => void;
}

export const CertificateTable: React.FC<CertificateTableProps> = ({
  certificates,
  onSelect,
  onOpenRevoke,
  onOpenRegenerate,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: CertificateItem['status']) => {
    switch (status) {
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3 h-3" />
            ISSUED
          </span>
        );
      case 'PENDING':
      case 'GENERATING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            <AlertTriangle className="w-3 h-3" />
            FAILED
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#EAE7DC] text-[#6D7068] border border-[#DCDDD3]">
            <ShieldAlert className="w-3 h-3" />
            REVOKED
          </span>
        );
    }
  };

  if (certificates.length === 0) {
    return (
      <div className="p-8 rounded-[10px] border border-dashed border-[#DCDDD3] bg-[#FFFDF8] text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-[#EAE7DC] text-[#6D7068] flex items-center justify-center mx-auto">
          <Award className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-heading font-extrabold text-[#171914]">
          No Certificates Found
        </h4>
        <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
          No credentials matched your current search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      {/* Mobile (< md) */}
      <div className="md:hidden space-y-2.5">
        {certificates.map((c) => (
          <CertificateMobileCard
            key={c.id}
            certificate={c}
            onSelect={onSelect}
            onCopyVerification={(url) => handleCopy(c.id, url)}
          />
        ))}
      </div>

      {/* Desktop (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Credential Title & Type</th>
                <th className="px-4 py-3">Team & Track</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verification ID</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {certificates.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
                >
                  {/* Participant */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={item.participantName}
                        src={item.participantAvatar}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <span className="font-heading font-bold text-[#171914] block truncate">
                          {item.participantName}
                        </span>
                        <span className="text-[11px] font-body text-[#6D7068] block truncate">
                          {item.participantEmail}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Title & Type */}
                  <td className="px-4 py-3.5">
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-[#171914] block truncate max-w-xs">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#028051]">
                        {item.type}
                      </span>
                    </div>
                  </td>

                  {/* Team & Track */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                    <span className="text-[#171914] font-bold block truncate max-w-[140px]">
                      {item.teamName || '—'}
                    </span>
                    {item.trackName && (
                      <span className="text-[10px] text-[#6D7068] block truncate max-w-[140px]">
                        {item.trackName}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Verification ID */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#171914]">
                        {item.verificationId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.verificationUrl)}
                        title="Copy Verification URL"
                        className="p-1 rounded text-[#6D7068] hover:text-[#171914] cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-[#028051]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Issue Date */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#6D7068]">
                    {item.issuedAt
                      ? new Date(item.issuedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelect(item)}
                        leftIcon={<Eye className="w-3 h-3" />}
                        className="text-[11px] h-7 px-2"
                      >
                        Preview
                      </Button>

                      {item.status === 'ISSUED' && (
                        <button
                          type="button"
                          onClick={() => onOpenRevoke(item)}
                          title="Revoke Certificate"
                          className="p-1.5 rounded text-[#6D7068] hover:text-[#DC2626] hover:bg-[#FBE6E3] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(item.status === 'FAILED' || item.status === 'REVOKED') && (
                        <button
                          type="button"
                          onClick={() => onOpenRegenerate(item)}
                          title="Regenerate Certificate"
                          className="p-1.5 rounded text-[#6D7068] hover:text-[#028051] hover:bg-[#E2EBDD] cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
