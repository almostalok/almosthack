'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileCode2, ExternalLink, ShieldAlert } from 'lucide-react';
import { Card, Button } from '@almosthack/ui';
import { RecentSubmissionItem } from './dashboard-mock-data';

export interface RecentSubmissionsProps {
  submissions: RecentSubmissionItem[];
  hackathonId?: string;
}

export const RecentSubmissions: React.FC<RecentSubmissionsProps> = ({
  submissions,
  hackathonId = 'htf-2026',
}) => {
  const getStatusBadge = (status: RecentSubmissionItem['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            Under Review
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold bg-[#E8EDF5] text-[#243F60] border border-[#BACDE2]">
            Reviewed
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            <ShieldAlert className="w-3 h-3 text-[#8B2C24]" />
            Flagged
          </span>
        );
    }
  };

  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD3]/70 mb-4">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
            Recent Submissions
          </h3>
          <p className="text-[11px] font-body text-[#6D7068]">
            Latest projects submitted for evaluation
          </p>
        </div>

        <Link href={`/hackathons/${hackathonId}/submissions`}>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs font-mono gap-1 h-7 px-2.5"
          >
            <span>View All Submissions</span>
            <ArrowRight className="w-3 h-3 text-[#028051]" />
          </Button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Recent Submissions Table">
          <thead>
            <tr className="border-b border-[#DCDDD3] text-[10px] font-mono uppercase text-[#6D7068]">
              <th className="pb-2.5 font-bold">Project Name</th>
              <th className="pb-2.5 font-bold">Team</th>
              <th className="pb-2.5 font-bold">Track</th>
              <th className="pb-2.5 font-bold">Status</th>
              <th className="pb-2.5 font-bold text-right">Submitted</th>
              <th className="pb-2.5 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDDD3]/50 text-xs">
            {submissions.map((sub) => (
              <tr
                key={sub.id}
                className="hover:bg-[#F7F4EA]/80 transition-colors group cursor-pointer"
              >
                <td className="py-3 pr-4 font-heading font-bold text-[#171914]">
                  <Link href={sub.href} className="hover:text-[#028051] transition-colors flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-[#9A9C94] group-hover:text-[#028051] shrink-0" />
                    <span className="truncate max-w-[200px]">{sub.name}</span>
                  </Link>
                </td>
                <td className="py-3 pr-4 text-[#6D7068] font-body truncate max-w-[140px]">
                  {sub.teamName}
                </td>
                <td className="py-3 pr-4 font-mono text-[11px] text-[#6D7068]">
                  {sub.track}
                </td>
                <td className="py-3 pr-4">
                  {getStatusBadge(sub.status)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-[11px] text-[#6D7068]">
                  {sub.submittedAt}
                </td>
                <td className="py-3 text-right">
                  <Link href={sub.href}>
                    <span className="text-[11px] font-mono font-semibold text-[#028051] hover:underline inline-flex items-center gap-1">
                      Inspect
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-2.5">
        {submissions.map((sub) => (
          <Link
            key={sub.id}
            href={sub.href}
            className="block p-3 rounded-[8px] bg-[#F7F4EA]/60 border border-[#DCDDD3] hover:bg-[#F7F4EA] transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-xs font-heading font-bold text-[#171914] truncate">
                {sub.name}
              </span>
              {getStatusBadge(sub.status)}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6D7068] font-body">
              <span>{sub.teamName} · <span className="font-mono text-[10px]">{sub.track}</span></span>
              <span className="font-mono text-[10px] text-[#9A9C94]">{sub.submittedAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};
