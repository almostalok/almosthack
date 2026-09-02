'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Eye,
  Sliders,
  Users,
  Users2,
  FileCode2,
  Scale,
  Award,
  Stamp,
  Megaphone,
  ArrowRight,
  ExternalLink,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { AuditLogItem, AuditTargetCategory } from './audit-log-types';

export interface AuditLogTableProps {
  logs: AuditLogItem[];
  onSelect: (log: AuditLogItem) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onSelect }) => {
  const getCategoryBadge = (cat: AuditTargetCategory) => {
    switch (cat) {
      case 'HACKATHON':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF4DC] border border-[#F0D597] text-[#785A12]">
            <Sliders className="w-3 h-3" />
            Config
          </span>
        );
      case 'PARTICIPANT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
            <Users className="w-3 h-3" />
            Participant
          </span>
        );
      case 'TEAM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
            <Users2 className="w-3 h-3" />
            Team
          </span>
        );
      case 'SUBMISSION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E40AF]">
            <FileCode2 className="w-3 h-3" />
            Submission
          </span>
        );
      case 'EVALUATION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E40AF]">
            <Scale className="w-3 h-3" />
            Evaluation
          </span>
        );
      case 'RESULT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E]">
            <Award className="w-3 h-3" />
            Results
          </span>
        );
      case 'CERTIFICATE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[#171914]">
            <Stamp className="w-3 h-3" />
            Certificate
          </span>
        );
      case 'ANNOUNCEMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
            <Megaphone className="w-3 h-3" />
            Broadcast
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[#171914]">
            <ShieldCheck className="w-3 h-3" />
            System
          </span>
        );
    }
  };

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

  if (logs.length === 0) {
    return (
      <div className="p-12 text-center rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-3">
        <ShieldCheck className="w-8 h-8 text-[#6D7068] mx-auto opacity-60" />
        <h3 className="font-heading font-extrabold text-sm text-[#171914]">
          No audit events match filters
        </h3>
        <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
          Adjust search keywords, actor selector, or date range to view recorded operations.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] overflow-hidden shadow-xs text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" role="table">
          <thead>
            <tr className="border-b border-[#DCDDD3] bg-[#F7F4EA] text-[11px] font-mono font-bold text-[#6D7068] uppercase">
              <th className="py-2.5 px-3.5">Event ID</th>
              <th className="py-2.5 px-3.5">Actor</th>
              <th className="py-2.5 px-3.5">Operation & Category</th>
              <th className="py-2.5 px-3.5">Target Resource</th>
              <th className="py-2.5 px-3.5">State Change Preview</th>
              <th className="py-2.5 px-3.5">Timestamp</th>
              <th className="py-2.5 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDDD3] text-xs font-body">
            {logs.map((log) => {
              const primaryDiff = log.diffs && log.diffs[0];

              return (
                <tr
                  key={log.id}
                  className="hover:bg-[#F7F4EA]/50 transition-colors group cursor-pointer"
                  onClick={() => onSelect(log)}
                >
                  {/* Event ID */}
                  <td className="py-3 px-3.5 font-mono text-[11px] font-bold text-[#171914] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />
                      <span>{log.id.substring(0, 12)}</span>
                    </div>
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-3.5">
                    <div className="space-y-0.5">
                      <div className="font-heading font-bold text-[#171914] flex items-center gap-1.5">
                        <span className="truncate max-w-[130px]">{log.actor.name}</span>
                        {log.actor.isSystem && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[#6D7068]">
                            BOT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#6D7068] truncate max-w-[150px]">
                        {log.actor.email}
                      </div>
                    </div>
                  </td>

                  {/* Operation & Category */}
                  <td className="py-3 px-3.5">
                    <div className="space-y-1">
                      <div className="font-heading font-extrabold text-[#171914] text-xs">
                        {log.actionLabel}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getCategoryBadge(log.targetEntity)}
                        <span className="text-[10px] font-mono text-[#6D7068]">
                          {log.action}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Target Resource */}
                  <td className="py-3 px-3.5 max-w-[180px]">
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#171914] truncate text-xs">
                        {log.targetLabel}
                      </div>
                      {log.targetUrl ? (
                        <Link
                          href={log.targetUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-mono text-[#028051] hover:underline flex items-center gap-0.5"
                        >
                          <span>Open entity</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ) : (
                        <span className="text-[10px] font-mono text-[#6D7068]">
                          ID: {log.targetId.substring(0, 10)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* State Change Preview */}
                  <td className="py-3 px-3.5 max-w-[200px]">
                    {primaryDiff ? (
                      <div className="p-1.5 rounded-[4px] bg-[#F7F4EA] border border-[#DCDDD3] text-[10px] font-mono space-y-0.5">
                        <span className="font-bold text-[#171914] block truncate">
                          {primaryDiff.label || primaryDiff.field}:
                        </span>
                        <div className="flex items-center gap-1 text-[#6D7068]">
                          <span className="line-through truncate max-w-[70px]">
                            {String(primaryDiff.before ?? 'null')}
                          </span>
                          <ArrowRight className="w-2.5 h-2.5 shrink-0 text-[#171914]" />
                          <span className="font-bold text-[#028051] truncate max-w-[80px]">
                            {String(primaryDiff.after ?? 'null')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-[#6D7068]">
                        Operation metadata recorded
                      </span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3.5 font-mono text-xs whitespace-nowrap">
                    <span className="text-[#171914] font-bold block">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                    <span className="text-[10px] text-[#6D7068] block">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
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
                      Proof
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
