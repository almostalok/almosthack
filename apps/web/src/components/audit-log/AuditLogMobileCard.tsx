'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Eye,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { AuditLogItem } from './audit-log-types';

export interface AuditLogMobileCardProps {
  log: AuditLogItem;
  onSelect: (log: AuditLogItem) => void;
}

export const AuditLogMobileCard: React.FC<AuditLogMobileCardProps> = ({
  log,
  onSelect,
}) => {
  const primaryDiff = log.diffs && log.diffs[0];

  const formatRelativeTime = (isoString: string) => {
    const ms = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      onClick={() => onSelect(log)}
      className="p-4 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-3 text-left cursor-pointer hover:border-[#028051] transition-colors"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#DCDDD3]/70 pb-2.5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#171914]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
          <span>{log.id.substring(0, 12)}</span>
        </div>

        <span className="text-[10px] font-mono text-[#6D7068]">
          {formatRelativeTime(log.createdAt)}
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="font-heading font-extrabold text-sm text-[#171914]">
          {log.actionLabel}
        </h4>
        <div className="flex items-center gap-2 text-xs font-mono text-[#6D7068]">
          <span className="font-bold text-[#171914]">{log.actor.name}</span>
          <span>•</span>
          <span>{log.targetEntity}</span>
        </div>
      </div>

      <div className="p-2.5 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-1 text-xs">
        <div className="font-bold text-[#171914] truncate">{log.targetLabel}</div>
        {primaryDiff && (
          <div className="text-[10px] font-mono flex items-center gap-1.5 text-[#6D7068] pt-1 border-t border-[#DCDDD3]/60">
            <span className="font-bold">{primaryDiff.label || primaryDiff.field}:</span>
            <span className="line-through">{String(primaryDiff.before ?? 'null')}</span>
            <ArrowRight className="w-2.5 h-2.5 text-[#171914]" />
            <span className="font-bold text-[#028051]">{String(primaryDiff.after ?? 'null')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        {log.targetUrl ? (
          <Link
            href={log.targetUrl}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-mono font-bold text-[#028051] hover:underline flex items-center gap-1"
          >
            <span>Open entity</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-[10px] font-mono text-[#6D7068]">
            Checksum: {log.checksum.substring(0, 10)}...
          </span>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(log);
          }}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className="text-xs font-mono h-7"
        >
          View Proof
        </Button>
      </div>
    </div>
  );
};
