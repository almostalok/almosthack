'use client';

import React from 'react';
import Link from 'next/link';
import { Megaphone, Users, Scale, FileCode2, Award, ChevronRight } from 'lucide-react';
import { Card } from '@almosthack/ui';

export interface QuickActionsProps {
  hackathonSlug?: string;
  hackathonId?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  hackathonId = 'htf-2026',
}) => {
  const actions = [
    {
      id: 'qa-announcement',
      label: 'Create Announcement',
      description: 'Broadcast alerts to all participants & tracks',
      href: `/hackathons/${hackathonId}/announcements`,
      icon: Megaphone,
    },
    {
      id: 'qa-registrations',
      label: 'Manage Registrations',
      description: 'Review builder profiles & team quotas',
      href: `/registrations`,
      icon: Users,
    },
    {
      id: 'qa-judges',
      label: 'Assign Judges & Rubrics',
      description: 'Configure double-blind criteria & tracks',
      href: `/judging`,
      icon: Scale,
    },
    {
      id: 'qa-submissions',
      label: 'Review Submissions',
      description: 'Inspect projects, demos, and repo commits',
      href: `/hackathons/${hackathonId}/submissions`,
      icon: FileCode2,
    },
    {
      id: 'qa-results',
      label: 'View Live Results',
      description: 'Calculate consensus rankings & seals',
      href: `/hackathons/${hackathonId}/results`,
      icon: Award,
    },
  ];

  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-3.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
            Quick Actions
          </h3>
          <span className="text-[11px] font-mono text-[#6D7068]">Organizer Tools</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.id}
                href={act.href}
                className="p-2.5 rounded-[8px] border border-[#DCDDD3]/70 hover:border-[#355C45] hover:bg-[#F7F4EA] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[6px] bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0 group-hover:bg-[#028051] group-hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-heading font-bold text-[#171914] block truncate">
                      {act.label}
                    </span>
                    <span className="text-[11px] font-body text-[#6D7068] block truncate">
                      {act.description}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#9A9C94] group-hover:text-[#028051] transition-colors shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-[#DCDDD3]/50 mt-4 text-[11px] font-mono text-[#6D7068]">
        <span>Role: Primary Organizer</span>
      </div>
    </Card>
  );
};
