'use client';

import React from 'react';
import { Users2, CheckCircle2, AlertTriangle, UserCheck, UserX, ArrowRight } from 'lucide-react';
import { TeamMetrics } from './teams-types';

export interface TeamSummaryMetricsProps {
  metrics: TeamMetrics;
  activeTab: 'TEAMS' | 'UNASSIGNED';
  activeSizeFilter: string;
  onSelectSizeFilter: (filter: string) => void;
  onSelectTab: (tab: 'TEAMS' | 'UNASSIGNED') => void;
}

export const TeamSummaryMetrics: React.FC<TeamSummaryMetricsProps> = ({
  metrics,
  activeTab,
  activeSizeFilter,
  onSelectSizeFilter,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'ALL',
      tab: 'TEAMS' as const,
      label: 'Total Teams',
      value: metrics.totalTeams,
      icon: Users2,
      badgeColor: 'text-[#171914] bg-[#EAE7DC]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/40',
      activeText: 'text-[#028051]',
    },
    {
      id: 'FULL',
      tab: 'TEAMS' as const,
      label: 'Complete Teams',
      value: metrics.completeTeams,
      icon: CheckCircle2,
      badgeColor: 'text-[#274535] bg-[#E2EBDD]',
      activeBorder: 'border-[#028051] bg-[#E2EBDD]/50',
      activeText: 'text-[#028051]',
    },
    {
      id: 'BELOW_MIN',
      tab: 'TEAMS' as const,
      label: 'Below Min Size',
      value: metrics.belowMinTeams,
      icon: AlertTriangle,
      badgeColor: 'text-[#785A12] bg-[#FFF4DC]',
      activeBorder: 'border-[#D97706] bg-[#FFF4DC]/50',
      activeText: 'text-[#785A12]',
    },
    {
      id: 'SOLO',
      tab: 'TEAMS' as const,
      label: 'Solo Squads',
      value: metrics.soloTeams,
      icon: UserCheck,
      badgeColor: 'text-[#475569] bg-[#F1F5F9]',
      activeBorder: 'border-[#64748B] bg-[#F1F5F9]',
      activeText: 'text-[#334155]',
    },
    {
      id: 'UNASSIGNED',
      tab: 'UNASSIGNED' as const,
      label: 'Without Team',
      value: metrics.unassignedParticipants,
      icon: UserX,
      badgeColor: 'text-[#8B2C24] bg-[#FBE6E3]',
      activeBorder: 'border-[#DC2626] bg-[#FBE6E3]/50',
      activeText: 'text-[#8B2C24]',
    },
  ];

  return (
    <div className="space-y-3" role="region" aria-label="Teams Operational Metrics & Attention">
      {/* Contextual Actionable Attention Banners */}
      {metrics.unassignedParticipants > 0 && activeTab !== 'UNASSIGNED' && (
        <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[10px] flex items-center justify-between gap-3 text-xs text-[#785A12] shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>{metrics.unassignedParticipants} participants</strong> are registered without a team squad.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('UNASSIGNED')}
            className="px-3 py-1 rounded-[6px] bg-[#FFFDF8] border border-[#F0D597] text-xs font-mono font-bold text-[#785A12] hover:bg-[#F7F4EA] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>View Unassigned Builders</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {metrics.belowMinTeams > 0 && activeSizeFilter !== 'BELOW_MIN' && activeTab === 'TEAMS' && (
        <div className="p-3 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[10px] flex items-center justify-between gap-3 text-xs text-[#8B2C24] shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>
              <strong>{metrics.belowMinTeams} teams</strong> have not met the minimum squad size requirement.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectTab('TEAMS');
              onSelectSizeFilter('BELOW_MIN');
            }}
            className="px-3 py-1 rounded-[6px] bg-[#FFFDF8] border border-[#F3C9B2] text-xs font-mono font-bold text-[#8B2C24] hover:bg-[#F7F4EA] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Review Incomplete Teams</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 5-Card Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const isCardActive =
            (card.tab === 'UNASSIGNED' && activeTab === 'UNASSIGNED') ||
            (card.tab === 'TEAMS' && activeTab === 'TEAMS' && activeSizeFilter === card.id);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                if (card.tab === 'UNASSIGNED') {
                  onSelectTab('UNASSIGNED');
                } else {
                  onSelectTab('TEAMS');
                  onSelectSizeFilter(card.id);
                }
              }}
              className={`p-3.5 rounded-[10px] border transition-all text-left flex flex-col justify-between gap-2 shadow-2xs hover:border-[#B8CEB0] cursor-pointer ${
                isCardActive
                  ? `${card.activeBorder} ring-1 ring-inset ring-[#028051]/30`
                  : 'bg-[#FFFDF8] border-[#DCDDD3] hover:bg-[#F7F4EA]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6D7068]">
                  {card.label}
                </span>
                <div
                  className={`w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0 ${card.badgeColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl sm:text-2xl font-heading font-extrabold ${
                    isCardActive ? card.activeText : 'text-[#171914]'
                  }`}
                >
                  {card.value.toLocaleString()}
                </span>
                {isCardActive && (
                  <span className="text-[10px] font-mono font-semibold text-[#028051]">
                    Active
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
