'use client';

import React from 'react';
import { CheckCircle2, XCircle, Users2, Layers, ChevronRight, Eye } from 'lucide-react';
import { ParticipantItem } from './registrations-types';

export interface RegistrationMobileCardProps {
  participant: ParticipantItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onViewDetails: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const RegistrationMobileCard: React.FC<RegistrationMobileCardProps> = ({
  participant,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onApprove,
  onReject,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            PENDING
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            REJECTED
          </span>
        );
      case 'WAITLISTED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            WAITLISTED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#EAE7DC] text-[#6D7068]">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className={`p-4 rounded-[10px] border transition-all text-left space-y-3 ${
        isSelected
          ? 'bg-[#E2EBDD]/30 border-[#028051]'
          : 'bg-[#FFFDF8] border-[#DCDDD3] hover:border-[#B8CEB0]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-[#DCDDD3] text-[#028051] focus:ring-[#028051]"
          />

          <div className="w-8 h-8 rounded-full bg-[#EAE7DC] text-[#171914] font-mono font-bold text-xs flex items-center justify-center shrink-0">
            {participant.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <button
              type="button"
              onClick={onViewDetails}
              className="text-xs font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
            >
              {participant.name}
            </button>
            <span className="text-[11px] font-body text-[#6D7068] truncate block">
              {participant.email}
            </span>
          </div>
        </div>

        {getStatusBadge(participant.status)}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#F7F4EA] p-2.5 rounded-[6px] border border-[#DCDDD3]">
        <div className="truncate">
          <span className="text-[#6D7068] block text-[10px] uppercase">Team</span>
          <span className="text-[#171914] font-semibold flex items-center gap-1 truncate">
            <Users2 className="w-3 h-3 text-[#028051] shrink-0" />
            {participant.teamName || 'No team'}
          </span>
        </div>

        <div className="truncate">
          <span className="text-[#6D7068] block text-[10px] uppercase">College</span>
          <span className="text-[#171914] truncate block" title={participant.college}>
            {participant.college}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#DCDDD3]/60">
        <button
          type="button"
          onClick={onViewDetails}
          className="text-xs font-mono text-[#6D7068] hover:text-[#171914] flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <div className="flex items-center gap-2">
          {participant.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={onApprove}
                className="px-2.5 py-1 rounded-[4px] bg-[#E2EBDD] text-[#028051] hover:bg-[#B8CEB0] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={onReject}
                className="px-2.5 py-1 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] hover:bg-[#F3C9B2] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </>
          )}

          {participant.status !== 'PENDING' && (
            <button
              type="button"
              onClick={onViewDetails}
              className="text-xs font-mono text-[#028051] flex items-center gap-0.5 cursor-pointer"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
