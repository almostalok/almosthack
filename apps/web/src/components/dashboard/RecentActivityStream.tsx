'use client';

import React from 'react';
import Link from 'next/link';
import {
  Terminal,
  FileCode2,
  Scale,
  Users,
  Megaphone,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@almosthack/ui';
import { ActivityItem } from './dashboard-mock-data';

export interface RecentActivityStreamProps {
  activities: ActivityItem[];
  hackathonId?: string;
}

export const RecentActivityStream: React.FC<RecentActivityStreamProps> = ({
  activities,
  hackathonId = 'htf-2026',
}) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'submission':
        return <FileCode2 className="w-3.5 h-3.5 text-[#028051]" />;
      case 'judge':
        return <Scale className="w-3.5 h-3.5 text-[#785A12]" />;
      case 'team':
        return <Users className="w-3.5 h-3.5 text-[#2563EB]" />;
      case 'announcement':
        return <Megaphone className="w-3.5 h-3.5 text-[#028051]" />;
      case 'system':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[#028051]" />;
    }
  };

  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#028051]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
              Recent Activity
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#028051] bg-[#E2EBDD] px-2 py-0.5 rounded-[4px] border border-[#B8CEB0]">
            LIVE AUDIT
          </span>
        </div>

        {/* Activity Stream List */}
        <div className="space-y-3">
          {activities.map((act) => {
            const content = (
              <div className="flex items-start gap-2.5 group">
                <div className="w-6 h-6 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#028051] transition-colors">
                  {getIcon(act.type)}
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-body text-[#171914] leading-relaxed">
                    <strong className="font-semibold">{act.actor}</strong>{' '}
                    <span className="text-[#6D7068]">{act.action}</span>{' '}
                    <span className="font-semibold text-[#171914]">{act.target}</span>
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#9A9C94]">
                    <span>{act.timestamp}</span>
                    {act.detail && (
                      <>
                        <span>·</span>
                        <span className="text-[#6D7068]">{act.detail}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );

            if (act.href) {
              return (
                <Link
                  key={act.id}
                  href={act.href}
                  className="block hover:bg-[#F7F4EA]/60 p-1.5 -mx-1.5 rounded-[6px] transition-colors"
                >
                  {content}
                </Link>
              );
            }

            return <div key={act.id} className="p-1.5 -mx-1.5">{content}</div>;
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-[#DCDDD3]/50 mt-4 flex items-center justify-between text-[11px] font-mono text-[#6D7068]">
        <span>Immutable SHA-256 Ledger</span>
        <Link href="/audit-logs" className="text-[#028051] font-semibold hover:underline flex items-center gap-1">
          <span>Full Audit Log</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </Card>
  );
};
