'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  Sliders,
  Users,
  Users2,
  FileCode2,
  Scale,
  Award,
  Stamp,
  Megaphone,
  Globe,
  Terminal,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { AuditLogItem } from './audit-log-types';
import { AuditLogDiffViewer } from './AuditLogDiffViewer';

export interface AuditLogDetailDrawerProps {
  isOpen: boolean;
  log: AuditLogItem | null;
  onClose: () => void;
}

export const AuditLogDetailDrawer: React.FC<AuditLogDetailDrawerProps> = ({
  isOpen,
  log,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sanitized JSON without any confidential tokens
  const sanitizedJson = JSON.stringify(
    {
      id: log.id,
      timestamp: log.createdAt,
      actor: {
        id: log.actor.id,
        name: log.actor.name,
        email: log.actor.email,
        role: log.actor.role,
      },
      action: log.action,
      targetEntity: log.targetEntity,
      targetId: log.targetId,
      diffs: log.diffs,
      metadata: log.metadata,
      network: {
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
      },
      checksum: log.checksum,
    },
    null,
    2
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-detail-title"
    >
      <div className="w-full max-w-2xl h-full sm:h-auto sm:max-h-[92vh] bg-[#FFFDF8] border-l sm:border border-[#DCDDD3] sm:rounded-[12px] shadow-2xl p-6 text-left space-y-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center text-[#028051]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#6D7068] uppercase block">
                Immutable Event Proof
              </span>
              <h2
                id="audit-detail-title"
                className="text-base font-heading font-extrabold text-[#171914] truncate max-w-md"
              >
                {log.actionLabel}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event ID & Timestamp Bar */}
        <div className="p-3 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[8px] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#6D7068]">Event ID:</span>
            <span className="font-bold text-[#171914]">{log.id}</span>
            <button
              type="button"
              onClick={() => handleCopy(log.id, setCopiedId)}
              className="text-[#6D7068] hover:text-[#028051] p-0.5"
              title="Copy ID"
            >
              {copiedId ? <Check className="w-3 h-3 text-[#028051]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <div className="text-[#6D7068]">
            <span>Timestamp: </span>
            <span className="font-bold text-[#171914]">
              {new Date(log.createdAt).toUTCString()}
            </span>
          </div>
        </div>

        {/* Actor & Target Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Actor Card */}
          <div className="p-3.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[8px] space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-mono text-[#6D7068] uppercase font-bold block">
              Operational Actor
            </span>
            <div className="font-heading font-bold text-sm text-[#171914]">
              {log.actor.name}
            </div>
            <div className="font-mono text-[11px] text-[#6D7068]">
              {log.actor.email}
            </div>
            <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[#171914]">
              {log.actor.role || (log.actor.isSystem ? 'Automated Service' : 'Platform User')}
            </span>
          </div>

          {/* Target Resource Card */}
          <div className="p-3.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[8px] space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-mono text-[#6D7068] uppercase font-bold block">
              Target Entity & Resource
            </span>
            <div className="font-heading font-bold text-sm text-[#171914] truncate">
              {log.targetLabel}
            </div>
            <div className="font-mono text-[11px] text-[#6D7068] truncate">
              ID: {log.targetId}
            </div>
            {log.targetUrl && (
              <div className="pt-1">
                <Link
                  href={log.targetUrl}
                  className="text-xs font-mono font-bold text-[#028051] hover:underline flex items-center gap-1"
                >
                  <span>Open Target Resource</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Before / After Diff Section */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#171914] uppercase block">
            State Modifications & Field Diffs
          </span>
          <AuditLogDiffViewer diffs={log.diffs} />
        </div>

        {/* Network & Cryptographic Telemetry */}
        <div className="p-3.5 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[8px] space-y-2 text-xs font-mono text-[#6D7068]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#171914]" />
              Origin IP:
            </span>
            <span className="font-bold text-[#171914]">{log.ipAddress || '127.0.0.1 (Loopback)'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-[#DCDDD3]/70 pt-1.5">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#171914]" />
              User Agent:
            </span>
            <span className="font-bold text-[#171914] truncate max-w-xs">{log.userAgent || 'AlmostHack-Client/1.0'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-[#DCDDD3]/70 pt-1.5">
            <span>SHA-256 Proof:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#028051] truncate max-w-[200px]">
                {log.checksum}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(log.checksum, setCopiedChecksum)}
                className="text-[#6D7068] hover:text-[#028051]"
                title="Copy Checksum"
              >
                {copiedChecksum ? <Check className="w-3 h-3 text-[#028051]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Raw JSON Accordion */}
        <div className="space-y-2 pt-1 border-t border-[#DCDDD3]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs font-mono font-bold text-[#6D7068] hover:text-[#171914] flex items-center gap-1.5 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Raw JSON Event' : 'View Sanitized JSON Event'}</span>
            </button>

            {showRawJson && (
              <button
                type="button"
                onClick={() => handleCopy(sanitizedJson, setCopiedRaw)}
                className="text-xs font-mono text-[#028051] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedRaw ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRaw ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {showRawJson && (
            <pre className="p-3.5 bg-[#171914] text-[#E2EBDD] font-mono text-[11px] rounded-[8px] overflow-x-auto max-h-48 leading-relaxed">
              {sanitizedJson}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Close Proof
          </Button>
        </div>
      </div>
    </div>
  );
};
