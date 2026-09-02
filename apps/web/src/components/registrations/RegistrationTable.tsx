'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Skeleton,
} from '@almosthack/ui';
import {
  Users2,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  UserCheck,
  UserX,
} from 'lucide-react';
import { ParticipantItem, RegistrationStatus } from './registrations-types';
import { RegistrationMobileCard } from './RegistrationMobileCard';

export interface RegistrationTableProps {
  participants: ParticipantItem[];
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;
  onViewDetails: (participant: ParticipantItem) => void;
  onApprove: (participant: ParticipantItem) => void;
  onReject: (participant: ParticipantItem) => void;
  onWaitlist: (participant: ParticipantItem) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  onResetFilters: () => void;
}

export const RegistrationTable: React.FC<RegistrationTableProps> = ({
  participants,
  isLoading,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onViewDetails,
  onApprove,
  onReject,
  onWaitlist,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  onResetFilters,
}) => {
  const isAllSelected =
    participants.length > 0 && selectedIds.length === participants.length;

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3 h-3 text-[#028051]" />
            APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <Clock className="w-3 h-3 text-[#D97706]" />
            PENDING
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            <XCircle className="w-3 h-3 text-[#DC2626]" />
            REJECTED
          </span>
        );
      case 'WAITLISTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            <AlertCircle className="w-3 h-3 text-[#64748B]" />
            WAITLISTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] bg-[#EAE7DC] text-[#6D7068]">
            {status}
          </span>
        );
    }
  };

  const formatDateDisplay = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
        <Skeleton className="h-16 w-full rounded-[10px]" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FFFDF8] rounded-[12px] border border-dashed border-[#DCDDD3] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] text-[#6D7068] flex items-center justify-center mx-auto">
          <Users2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-extrabold text-[#171914]">
            No Participants Found
          </h3>
          <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
            No builder records matched your active query and filter combination.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetFilters}
          className="text-xs font-mono h-8"
        >
          Reset All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-2.5">
        {participants.map((p) => (
          <RegistrationMobileCard
            key={p.id}
            participant={p}
            isSelected={selectedIds.includes(p.id)}
            onToggleSelect={() => onToggleSelectRow(p.id)}
            onViewDetails={() => onViewDetails(p)}
            onApprove={() => onApprove(p)}
            onReject={() => onReject(p)}
          />
        ))}
      </div>

      {/* Desktop & Tablet Table (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="w-10 px-4 py-3 select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Select all participants"
                    className="w-4 h-4 rounded border-[#DCDDD3] text-[#028051] focus:ring-[#028051] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {participants.map((p) => {
                const isSelected = selectedIds.includes(p.id);

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors duration-100 ${
                      isSelected
                        ? 'bg-[#E2EBDD]/40 hover:bg-[#E2EBDD]/60'
                        : 'hover:bg-[#F7F4EA]/70'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(p.id)}
                        aria-label={`Select ${p.name}`}
                        className="w-4 h-4 rounded border-[#DCDDD3] text-[#028051] focus:ring-[#028051] cursor-pointer"
                      />
                    </td>

                    {/* Participant */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            p.status === 'APPROVED'
                              ? 'bg-[#E2EBDD] text-[#274535] ring-1 ring-[#028051]'
                              : 'bg-[#EAE7DC] text-[#171914]'
                          }`}
                        >
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onViewDetails(p)}
                            className="font-heading font-bold text-[#171914] hover:text-[#028051] text-left truncate block cursor-pointer"
                          >
                            {p.name}
                          </button>
                          <span className="text-[11px] font-body text-[#6D7068] truncate block">
                            {p.email} · {p.college}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(p.status)}
                    </td>

                    {/* Team */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {p.teamName ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#171914]">
                          <Users2 className="w-3.5 h-3.5 text-[#028051]" />
                          {p.teamName}
                          {p.teamRole === 'CAPTAIN' && (
                            <span className="text-[9px] font-mono uppercase bg-[#E2EBDD] text-[#274535] px-1 rounded">
                              Lead
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-[#9A9C94]">No team</span>
                      )}
                    </td>

                    {/* Track */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {p.trackName ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#171914]">
                          <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span className="max-w-[140px] truncate" title={p.trackName}>
                            {p.trackName}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-[#9A9C94]">Not assigned</span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-[#6D7068]">
                      {formatDateDisplay(p.registeredAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {p.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove(p)}
                              title="Approve Participant"
                              className="p-1.5 rounded-[5px] bg-[#E2EBDD] text-[#028051] hover:bg-[#B8CEB0] transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(p)}
                              title="Reject Participant"
                              className="p-1.5 rounded-[5px] bg-[#FBE6E3] text-[#8B2C24] hover:bg-[#F3C9B2] transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewDetails(p)}
                          title="View Participant Profile"
                          className="p-1.5 rounded-[5px] hover:bg-[#EAE7DC] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] flex items-center justify-between gap-3 text-xs font-mono">
        <span className="text-[#6D7068]">
          Page <strong className="text-[#171914]">{currentPage}</strong> of{' '}
          <strong className="text-[#171914]">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-7 px-2.5"
          >
            Prev
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            className="text-xs font-mono h-7 px-2.5"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
