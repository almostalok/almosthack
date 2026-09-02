'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileCode2,
  Scale,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Card, Badge, Button } from '@almosthack/ui';
import { AttentionItem } from './dashboard-mock-data';

export interface AttentionPanelProps {
  items: AttentionItem[];
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({ items }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileCode2':
        return <FileCode2 className="w-4 h-4 text-[#8B2C24]" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-[#785A12]" />;
      case 'Users':
        return <Users className="w-4 h-4 text-[#028051]" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-[#785A12]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-[#8B2C24]" />;
    }
  };

  const getSeverityBadge = (severity: 'urgent' | 'warning' | 'info') => {
    switch (severity) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold uppercase bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            Urgent
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold uppercase bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            Attention
          </span>
        );
      case 'info':
        return (
          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold uppercase bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            Notice
          </span>
        );
    }
  };

  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8B2C24]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
              What Needs Your Attention
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#6D7068]">
            {items.length > 0 ? `${items.length} actionable` : '0 issues'}
          </span>
        </div>

        {/* Actionable List or Caught Up State */}
        {items.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-heading font-bold text-[#171914]">
              You&apos;re caught up.
            </h4>
            <p className="text-xs text-[#6D7068] font-body max-w-xs mx-auto">
              Nothing needs your attention right now. All submissions and judge reviews are on track.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-[8px] bg-[#F7F4EA]/70 border border-[#DCDDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F4EA] transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 shrink-0">{getIcon(item.iconName)}</div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs sm:text-sm font-body text-[#171914] font-medium leading-snug">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(item.severity)}
                    </div>
                  </div>
                </div>

                <Link href={item.actionHref} className="shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto text-xs gap-1.5 font-mono py-1 px-2.5 h-7 hover:border-[#028051] hover:text-[#028051]"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#DCDDD3]/50 mt-4 flex items-center justify-between text-[11px] font-mono text-[#6D7068]">
        <span>Automated integrity monitor</span>
        <span className="text-[#028051] font-semibold">● Active</span>
      </div>
    </Card>
  );
};
