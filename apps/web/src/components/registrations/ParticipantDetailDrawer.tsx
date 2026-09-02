'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  GraduationCap,
  Users2,
  Layers,
  GitBranch,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { ParticipantItem, RegistrationStatus } from './registrations-types';

export interface ParticipantDetailDrawerProps {
  participant: ParticipantItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (participant: ParticipantItem) => void;
  onReject: (participant: ParticipantItem) => void;
  onWaitlist: (participant: ParticipantItem) => void;
}

export const ParticipantDetailDrawer: React.FC<ParticipantDetailDrawerProps> = ({
  participant,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onWaitlist,
}) => {
  if (!isOpen || !participant) return null;

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#028051]" />
            APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            PENDING
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] bg-[#FBE6E3] text-[#8B2C24] border border-[#F3C9B2]">
            <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
            REJECTED
          </span>
        );
      case 'WAITLISTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            <AlertCircle className="w-3.5 h-3.5 text-[#64748B]" />
            WAITLISTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] bg-[#EAE7DC] text-[#6D7068]">
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#131413]/50 backdrop-blur-xs animate-in fade-in duration-150 text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="w-full max-w-xl h-full bg-[#FFFDF8] border-l border-[#DCDDD3] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DCDDD3] bg-[#F7F4EA] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-full font-mono font-bold text-sm flex items-center justify-center shrink-0 ${
                participant.status === 'APPROVED'
                  ? 'bg-[#E2EBDD] text-[#274535] ring-2 ring-[#028051]'
                  : 'bg-[#EAE7DC] text-[#171914]'
              }`}
            >
              {participant.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 id="drawer-title" className="text-base font-heading font-extrabold text-[#171914] truncate">
                {participant.name}
              </h3>
              <p className="text-xs text-[#6D7068] font-body truncate">
                {participant.email} · @{participant.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {getStatusBadge(participant.status)}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] hover:bg-[#EAE7DC] text-[#6D7068] hover:text-[#171914] transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 font-body text-xs text-[#171914]">
          {/* Rejection notice if rejected */}
          {participant.status === 'REJECTED' && participant.rejectionReason && (
            <div className="p-3.5 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[8px] space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase text-[#8B2C24] block">
                Rejection Reason
              </span>
              <p className="text-xs text-[#8B2C24] font-body leading-relaxed">
                {participant.rejectionReason}
              </p>
            </div>
          )}

          {/* Section 1: Academic & Institutional Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#028051]" />
              Academic & Institutional Identity
            </h4>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] font-mono">
              <div>
                <span className="text-[10px] text-[#6D7068] uppercase block">University / College</span>
                <span className="text-xs font-bold text-[#171914] block truncate" title={participant.college}>
                  {participant.college}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#6D7068] uppercase block">Major / Branch</span>
                <span className="text-xs font-bold text-[#171914] block truncate" title={participant.branch}>
                  {participant.branch}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#6D7068] uppercase block">Graduation Year</span>
                <span className="text-xs font-bold text-[#171914] block">
                  {participant.gradYear}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#6D7068] uppercase block">Check-in Status</span>
                <span className="text-xs font-bold text-[#171914] block">
                  {participant.checkInStatus ? '✓ Checked In' : 'Not Checked In'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Bio & Skills */}
          {participant.bio && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#6D7068]">
                Builder Bio
              </h4>
              <p className="text-xs text-[#171914] leading-relaxed p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3]">
                {participant.bio}
              </p>
            </div>
          )}

          {participant.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#6D7068]">
                Technical Skills & Focus Areas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {participant.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-[4px] bg-[#EAE7DC] text-[#171914] text-[11px] font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Team Context */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#6D7068] flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-[#028051]" />
              Team Formation Context
            </h4>

            <div className="p-3.5 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] space-y-2">
              {participant.teamName ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-heading font-bold text-[#171914] block">
                      {participant.teamName}
                    </span>
                    <span className="text-[11px] font-mono text-[#6D7068]">
                      Role: {participant.teamRole || 'MEMBER'} · {participant.teamMemberCount || 1} members
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] text-[#274535] border border-[#B8CEB0]">
                    {participant.teamStatus || 'ACTIVE'}
                  </span>
                </div>
              ) : (
                <div className="text-center py-2 text-[#6D7068] font-mono text-xs">
                  Solo participant · No team assigned yet
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Assigned Track & Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] space-y-1">
              <span className="text-[10px] font-mono text-[#6D7068] uppercase flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#2563EB]" />
                Selected Track
              </span>
              <span className="text-xs font-bold text-[#171914] block truncate">
                {participant.trackName || 'Unassigned'}
              </span>
            </div>

            <div className="p-3 bg-[#FFFDF8] rounded-[8px] border border-[#DCDDD3] space-y-1">
              <span className="text-[10px] font-mono text-[#6D7068] uppercase flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-[#028051]" />
                GitHub Profile
              </span>
              {participant.githubHandle ? (
                <a
                  href={`https://github.com/${participant.githubHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono font-bold text-[#028051] hover:underline flex items-center gap-1 truncate"
                >
                  <span>@{participant.githubHandle}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-xs font-mono text-[#9A9C94]">Not linked</span>
              )}
            </div>
          </div>

          {/* Section 5: Registration Metadata */}
          <div className="p-3 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3] space-y-1 text-[11px] font-mono text-[#6D7068]">
            <div className="flex justify-between">
              <span>Registration ID:</span>
              <span className="text-[#171914]">{participant.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Application Date:</span>
              <span className="text-[#171914]">{formatDateDisplay(participant.registeredAt)}</span>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-[#DCDDD3] bg-[#F7F4EA] flex items-center justify-end gap-2">
          {participant.status === 'PENDING' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onReject(participant)}
                leftIcon={<XCircle className="w-3.5 h-3.5 text-[#8B2C24]" />}
                className="text-xs font-mono h-8 border-[#F3C9B2] text-[#8B2C24] hover:bg-[#FBE6E3]"
              >
                Reject
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onWaitlist(participant)}
                leftIcon={<AlertCircle className="w-3.5 h-3.5 text-[#475569]" />}
                className="text-xs font-mono h-8"
              >
                Waitlist
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove(participant)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
              >
                Approve Participant
              </Button>
            </>
          )}

          {participant.status === 'APPROVED' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onWaitlist(participant)}
                className="text-xs font-mono h-8"
              >
                Move to Waitlist
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onReject(participant)}
                className="text-xs font-mono h-8 border-[#F3C9B2] text-[#8B2C24] hover:bg-[#FBE6E3]"
              >
                Revoke & Reject
              </Button>
            </>
          )}

          {participant.status === 'REJECTED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(participant)}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051]"
            >
              Reconsider & Approve
            </Button>
          )}

          {participant.status === 'WAITLISTED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(participant)}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8 bg-[#028051]"
            >
              Approve from Waitlist
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
