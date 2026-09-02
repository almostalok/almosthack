'use client';

import React from 'react';
import Link from 'next/link';
import {
  Settings,
  Users,
  Users2,
  FileCode2,
  Scale,
  Award,
  ShieldCheck,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import { Card, Badge, Button } from '@almosthack/ui';
import { WorkspaceSummaryCard } from './workspace-mock-data';

export interface WorkspaceSummariesProps {
  summaries: WorkspaceSummaryCard[];
}

export const WorkspaceSummaries: React.FC<WorkspaceSummariesProps> = ({ summaries }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Settings':
        return <Settings className="w-4 h-4 text-[#028051]" />;
      case 'Users':
        return <Users className="w-4 h-4 text-[#2563EB]" />;
      case 'FileCode2':
        return <FileCode2 className="w-4 h-4 text-[#D97706]" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-[#785A12]" />;
      case 'Award':
        return <Award className="w-4 h-4 text-[#2563EB]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#028051]" />;
      case 'Megaphone':
        return <Megaphone className="w-4 h-4 text-[#028051]" />;
      default:
        return <Settings className="w-4 h-4 text-[#6D7068]" />;
    }
  };

  const getBadgeStyle = (variant?: WorkspaceSummaryCard['badgeVariant']) => {
    switch (variant) {
      case 'success':
        return 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]';
      case 'warning':
        return 'bg-[#FFF4DC] text-[#785A12] border-[#F0D597]';
      case 'info':
        return 'bg-[#E8EDF5] text-[#243F60] border-[#BACDE2]';
      default:
        return 'bg-[#F0ECE1] text-[#6D7068] border-[#DCDDD3]';
    }
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between pb-2 border-b border-[#DCDDD3]">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
          Management Modules & Subsystem Summaries
        </h3>
        <span className="text-[11px] font-mono text-[#6D7068]">
          {summaries.length} active zones
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaries.map((card) => (
          <Card
            key={card.id}
            className="p-4 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs hover:border-[#355C45]/60 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[6px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center shrink-0">
                    {getIcon(card.iconName)}
                  </div>
                  <h4 className="text-xs font-heading font-bold text-[#171914] truncate">
                    {card.title}
                  </h4>
                </div>
                {card.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-bold border ${getBadgeStyle(
                      card.badgeVariant
                    )} shrink-0`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="my-1.5">
                <span className="text-sm font-heading font-extrabold text-[#171914] block">
                  {card.metrics}
                </span>
                <p className="text-[11px] font-body text-[#6D7068] line-clamp-2 mt-0.5 leading-relaxed">
                  {card.detail}
                </p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#DCDDD3]/50 mt-2">
              <Link href={card.actionHref} className="block">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-[11px] font-mono justify-between py-1 h-7 border-[#DCDDD3] group-hover:border-[#028051] group-hover:text-[#028051]"
                >
                  <span>{card.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
