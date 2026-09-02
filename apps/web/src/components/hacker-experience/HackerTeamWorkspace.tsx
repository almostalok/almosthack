'use client';

import React, { useState } from 'react';
import {
  Users2,
  Crown,
  UserPlus,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Lock,
  Layers,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { TeamEntity } from '@almosthack/types';

export interface HackerTeamWorkspaceProps {
  team: TeamEntity | null;
  incomingInvitations: any[];
  onAcceptInvitation: (id: string) => Promise<void>;
  onDeclineInvitation: (id: string) => Promise<void>;
  isAccepting: boolean;
  isDeclining: boolean;
  isTeamLocked?: boolean;
}

export const HackerTeamWorkspace: React.FC<HackerTeamWorkspaceProps> = ({
  team,
  incomingInvitations,
  onAcceptInvitation,
  onDeclineInvitation,
  isAccepting,
  isDeclining,
  isTeamLocked = false,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSuccess(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail('');
    setTimeout(() => setInviteSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Incoming Invitations Banner */}
      {incomingInvitations.length > 0 && (
        <div className="p-4 rounded-[10px] bg-[#FFF4DC] border border-[#F0D597] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#785A12]">
            <Mail className="w-4 h-4" />
            <h3 className="font-heading font-extrabold text-sm text-[#171914]">
              You have {incomingInvitations.length} Team Invitation{incomingInvitations.length > 1 ? 's' : ''}
            </h3>
          </div>

          <div className="divide-y divide-[#F0D597]/70 space-y-2">
            {incomingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-heading font-extrabold text-xs text-[#171914]">
                    Team: {inv.team?.name || 'Hackathon Squad'}
                  </div>
                  <div className="text-[11px] font-mono text-[#785A12]">
                    Invited by {inv.invitedByUser?.name || 'Team Captain'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDeclineInvitation(inv.id)}
                    isLoading={isDeclining}
                    className="text-xs font-mono"
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAcceptInvitation(inv.id)}
                    isLoading={isAccepting}
                    className="text-xs font-mono font-bold"
                  >
                    Accept & Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Team Info Card */}
      {team ? (
        <div className="p-5 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD3] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[#028051]" />
                <h2 className="text-xl font-heading font-extrabold text-[#171914]">
                  {team.name}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
                  {team.members?.length || team.memberCount || 1} / 4 Members
                </span>
              </div>
              {team.description && (
                <p className="text-xs font-body text-[#6D7068]">
                  {team.description}
                </p>
              )}
            </div>

            {isTeamLocked ? (
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#6D7068] bg-[#F7F4EA] px-2.5 py-1 rounded border border-[#DCDDD3]">
                <Lock className="w-3.5 h-3.5 text-[#785A12]" />
                <span>Roster Locked</span>
              </div>
            ) : (
              <span className="text-xs font-mono text-[#028051] font-bold">
                Roster Open
              </span>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#6D7068] uppercase">
              Team Roster
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {team.members?.map((mem) => {
                const isCaptain = (mem.role as string) === 'CAPTAIN' || (mem.role as string) === 'LEADER';

                return (
                  <div
                    key={mem.id}
                    className="p-3 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#E2EBDD] border border-[#B8CEB0] flex items-center justify-center text-xs font-heading font-extrabold text-[#028051] shrink-0">
                      {mem.user?.name ? mem.user.name.substring(0, 2).toUpperCase() : 'AH'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-extrabold text-xs text-[#171914] truncate">
                          {mem.user?.name || 'Teammate'}
                        </span>
                        {isCaptain && (
                          <span title="Team Captain">
                            <Crown className="w-3.5 h-3.5 text-[#785A12] shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#6D7068] block truncate">
                        {mem.user?.email || 'Member'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite Teammate Section (if roster is not locked) */}
          {!isTeamLocked && (team.members?.length || 1) < 4 && (
            <div className="pt-4 border-t border-[#DCDDD3] space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#6D7068] uppercase flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-[#028051]" />
                Invite Team Member
              </h3>

              <form onSubmit={handleSendInvite} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter teammate's email address..."
                  className="flex-1 px-3 py-1.5 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] text-xs font-body text-[#171914] placeholder-[#6D7068] focus:outline-none focus:border-[#028051]"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="text-xs font-mono font-bold shrink-0"
                >
                  Send Invite
                </Button>
              </form>

              {inviteSuccess && (
                <p className="text-xs font-mono text-[#028051] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {inviteSuccess}
                </p>
              )}

              {/* Pending Outgoing Invites */}
              {team.invitations && team.invitations.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-mono text-[#6D7068] block">
                    Pending Outgoing Invites:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {team.invitations.map((inv) => (
                      <span
                        key={inv.id}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[#6D7068]"
                      >
                        <Clock className="w-3 h-3 text-[#785A12]" />
                        {inv.inviteeUser?.email || inv.inviteeUserId} (Pending)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-3">
          <Users2 className="w-8 h-8 text-[#6D7068] mx-auto opacity-60" />
          <h3 className="font-heading font-extrabold text-sm text-[#171914]">
            You&apos;re not in a team yet
          </h3>
          <p className="text-xs font-mono text-[#6D7068] max-w-sm mx-auto">
            Hackathons are best experienced with collaborators. Create a squad or accept an invite to get started.
          </p>
        </div>
      )}
    </div>
  );
};
