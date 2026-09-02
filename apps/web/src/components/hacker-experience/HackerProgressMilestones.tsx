'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  CircleDot,
  Minus,
  FileCode2,
  Users2,
  GitBranch,
  Send,
  Scale,
  Award,
} from 'lucide-react';
import { HackerMilestoneState } from './hacker-types';

export interface HackerProgressMilestonesProps {
  milestones: HackerMilestoneState;
}

export const HackerProgressMilestones: React.FC<HackerProgressMilestonesProps> = ({
  milestones,
}) => {
  const steps = [
    {
      id: 'registration',
      label: 'Registration',
      status: milestones.registration,
      detail: milestones.registration === 'COMPLETED' ? 'Confirmed' : 'Pending',
      icon: Users2,
    },
    {
      id: 'team',
      label: 'Team Formation',
      status: milestones.team,
      detail: milestones.team === 'COMPLETED' ? 'Squad Ready' : 'Incomplete',
      icon: Users2,
    },
    {
      id: 'repository',
      label: 'Repository',
      status: milestones.repository,
      detail: milestones.repository === 'COMPLETED' ? 'GitHub Synced' : 'Not Linked',
      icon: GitBranch,
    },
    {
      id: 'submission',
      label: 'Project Submission',
      status:
        milestones.submission.status === 'SUBMITTED'
          ? 'COMPLETED'
          : milestones.submission.completedItems > 0
          ? 'IN_PROGRESS'
          : 'PENDING',
      detail:
        milestones.submission.status === 'SUBMITTED'
          ? 'Finalized ✓'
          : `${milestones.submission.completionPercent}% Complete`,
      icon: Send,
    },
    {
      id: 'judging',
      label: 'Judging Evaluation',
      status: milestones.judging,
      detail:
        milestones.judging === 'COMPLETED'
          ? 'Evaluated'
          : milestones.judging === 'IN_PROGRESS'
          ? 'Under Review'
          : 'Awaiting Submissions',
      icon: Scale,
    },
    {
      id: 'results',
      label: 'Results & Awards',
      status: milestones.results === 'PUBLISHED' ? 'COMPLETED' : 'PENDING',
      detail:
        milestones.results === 'PUBLISHED' ? 'Published' : 'Pending Judging',
      icon: Award,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-[#028051]" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-[#785A12]" />;
      default:
        return <Minus className="w-4 h-4 text-[#9A9C94]" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-[#E2EBDD] border-[#B8CEB0] text-[#028051]';
      case 'IN_PROGRESS':
        return 'bg-[#FFF4DC] border-[#F0D597] text-[#785A12]';
      default:
        return 'bg-[#F7F4EA] border-[#DCDDD3] text-[#6D7068]';
    }
  };

  return (
    <div
      className="p-5 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-4 text-left"
      role="region"
      aria-label="Hackathon Progress Barometer"
    >
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
        <h3 className="font-heading font-extrabold text-sm text-[#171914] uppercase tracking-wide">
          Hackathon Milestone Progression
        </h3>
        <span className="text-xs font-mono text-[#6D7068]">
          Status: <strong className="text-[#028051]">On Track</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              aria-label={`Milestone ${idx + 1}: ${s.label} (${s.detail})`}
              className={`p-3 rounded-[8px] border transition-all flex flex-col justify-between space-y-2 ${getStatusBadgeClass(
                s.status
              )}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold opacity-70">
                  0{idx + 1}
                </span>
                {getStatusIcon(s.status)}
              </div>

              <div>
                <h4 className="font-heading font-extrabold text-xs text-[#171914] leading-snug">
                  {s.label}
                </h4>
                <p className="text-[11px] font-mono mt-0.5 truncate">
                  {s.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
