'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Badge, Card, Skeleton } from '@almosthack/ui';
import {
  Calendar,
  Clock,
  Globe,
  Settings,
  Send,
  Archive,
  ExternalLink,
  Layers,
  Code,
  Award,
  Sliders,
  FileText,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  UserPlus,
  Crown,
  LogOut,
  Trash2,
  Mail,
  Shield,
  ArrowRightLeft,
  GitBranch,
  Github,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  HackathonEntity,
  HackathonLifecycleResponse,
  HackathonConfigurationEntity,
  HackathonTrackEntity,
  HackathonChallengeEntity,
  ParticipantRegistrationEntity,
  ParticipantRegistrationStatus,
  TeamEntity,
  TeamInvitationEntity,
  TeamMemberRole,
  TeamMemberStatus,
  GitHubConnectionStatus,
  TeamRepositoryEntity,
} from '@almosthack/types';

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  // Selected track & challenge for registration form
  const [selectedTrackId, setSelectedTrackId] = React.useState<string>('');
  const [selectedChallengeId, setSelectedChallengeId] = React.useState<string>('');
  const [formError, setFormError] = React.useState<string | null>(null);

  // Team creation form state
  const [teamName, setTeamName] = React.useState<string>('');
  const [teamSlug, setTeamSlug] = React.useState<string>('');
  const [teamDescription, setTeamDescription] = React.useState<string>('');
  const [teamError, setTeamError] = React.useState<string | null>(null);

  // Team invite form state
  const [inviteeEmail, setInviteeEmail] = React.useState<string>('');
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  // Fetch hackathon details
  const {
    data: hackathon,
    isLoading: isLoadingHackathon,
    error: hackathonError,
  } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
  });

  // Fetch configuration
  const { data: configuration } = useQuery<HackathonConfigurationEntity | null>({
    queryKey: ['hackathon-configuration', hackathonId],
    queryFn: () => apiClient.getHackathonConfiguration(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch effective lifecycle status
  const { data: lifecycle } = useQuery<HackathonLifecycleResponse>({
    queryKey: ['hackathon-lifecycle', hackathonId],
    queryFn: () => apiClient.getHackathonLifecycle(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch current user's registration
  const {
    data: registration,
    isLoading: isLoadingRegistration,
  } = useQuery<ParticipantRegistrationEntity | null>({
    queryKey: ['hackathon-registration', hackathonId],
    queryFn: () => apiClient.getHackathonRegistration(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch current user's team
  const isRegistered = registration?.status === ParticipantRegistrationStatus.REGISTERED;
  const {
    data: myTeam,
    isLoading: isLoadingMyTeam,
  } = useQuery<TeamEntity | null>({
    queryKey: ['my-team', hackathonId],
    queryFn: () => apiClient.getMyTeam(hackathonId),
    enabled: !!hackathonId && isRegistered,
  });

  // Fetch current user's pending invitations
  const {
    data: myInvitations = [],
    isLoading: isLoadingInvitations,
  } = useQuery<TeamInvitationEntity[]>({
    queryKey: ['my-team-invitations', hackathonId],
    queryFn: () => apiClient.getMyTeamInvitations(hackathonId),
    enabled: !!hackathonId && isRegistered,
  });

  // Fetch active tracks
  const { data: tracks = [] } = useQuery<HackathonTrackEntity[]>({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: () => apiClient.getHackathonTracks(hackathonId),
    enabled: !!hackathonId,
  });

  // Fetch challenges for selected track
  const effectiveTrackId = selectedTrackId || registration?.trackId || '';
  const { data: challenges = [] } = useQuery<HackathonChallengeEntity[]>({
    queryKey: ['track-challenges', effectiveTrackId],
    queryFn: () => apiClient.getTrackChallenges(effectiveTrackId),
    enabled: !!effectiveTrackId,
  });

  // Synchronize initial selections from existing registration
  React.useEffect(() => {
    if (registration && registration.status === ParticipantRegistrationStatus.REGISTERED) {
      if (registration.trackId) setSelectedTrackId(registration.trackId);
      if (registration.challengeId) setSelectedChallengeId(registration.challengeId);
    }
  }, [registration]);

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: () => apiClient.publishHackathon(hackathonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-lifecycle', hackathonId] });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: () => apiClient.archiveHackathon(hackathonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-lifecycle', hackathonId] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (payload: { trackId?: string | null; challengeId?: string | null }) =>
      apiClient.createHackathonRegistration(hackathonId, payload),
    onSuccess: () => {
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['hackathon-registration', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['my-team-invitations', hackathonId] });
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to register for hackathon');
    },
  });

  // Update selection mutation
  const updateSelectionMutation = useMutation({
    mutationFn: (payload: { trackId?: string | null; challengeId?: string | null }) =>
      apiClient.updateHackathonRegistration(hackathonId, payload),
    onSuccess: () => {
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['hackathon-registration', hackathonId] });
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to update registration selection');
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: () => apiClient.withdrawFromHackathon(hackathonId),
    onSuccess: () => {
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['hackathon-registration', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['my-team-invitations', hackathonId] });
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to withdraw from hackathon');
    },
  });

  // Team Mutations
  const createTeamMutation = useMutation({
    mutationFn: (payload: { name: string; slug?: string; description?: string }) =>
      apiClient.createTeam(hackathonId, payload),
    onSuccess: () => {
      setTeamError(null);
      setTeamName('');
      setTeamSlug('');
      setTeamDescription('');
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
    },
    onError: (err: any) => {
      setTeamError(err?.message || 'Failed to create team');
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (payload: { inviteeEmail?: string }) =>
      apiClient.inviteTeamMember(myTeam!.id, payload),
    onSuccess: () => {
      setInviteError(null);
      setInviteeEmail('');
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
    },
    onError: (err: any) => {
      setInviteError(err?.message || 'Failed to invite team member');
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (invitationId: string) => apiClient.acceptTeamInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['my-team-invitations', hackathonId] });
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: (invitationId: string) => apiClient.declineTeamInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team-invitations', hackathonId] });
    },
  });

  const leaveTeamMutation = useMutation({
    mutationFn: () => apiClient.leaveTeam(myTeam!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => apiClient.removeTeamMember(myTeam!.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
    },
  });

  const transferCaptaincyMutation = useMutation({
    mutationFn: (targetMemberId: string) =>
      apiClient.transferTeamCaptaincy(myTeam!.id, { targetMemberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
    },
  });

  const dissolveTeamMutation = useMutation({
    mutationFn: () => apiClient.dissolveTeam(myTeam!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team', hackathonId] });
    },
  });

  // ==========================================
  // S2-06: GitHub Integration & Repository Hooks
  // ==========================================

  const { data: githubStatus } = useQuery<GitHubConnectionStatus>({
    queryKey: ['github-status'],
    queryFn: () => apiClient.getGitHubConnectionStatus(),
  });

  const { data: teamRepo } = useQuery<TeamRepositoryEntity | null>({
    queryKey: ['team-repository', myTeam?.id],
    queryFn: () => apiClient.getTeamRepository(myTeam!.id),
    enabled: !!myTeam?.id,
  });

  const connectGitHubMutation = useMutation({
    mutationFn: () => apiClient.startGitHubConnect(myTeam?.id),
    onSuccess: (res: any) => {
      if (res.url) window.location.href = res.url;
    },
  });

  const provisionRepoMutation = useMutation({
    mutationFn: () => apiClient.provisionTeamRepository(myTeam!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-repository', myTeam?.id] });
    },
  });

  const disconnectRepoMutation = useMutation({
    mutationFn: () => apiClient.disconnectTeamRepository(myTeam!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-repository', myTeam?.id] });
    },
  });


  if (isLoadingHackathon) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (hackathonError || !hackathon) {
    return (
      <div className="p-8 text-center space-y-4 max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl my-12">
        <h2 className="text-xl font-bold text-zinc-100 font-heading">Hackathon Not Found</h2>
        <p className="text-xs font-mono text-zinc-400">
          The requested hackathon could not be found or you lack permission to view it.
        </p>
        <Button variant="secondary" size="sm" onClick={() => router.push('/hackathons')}>
          Back to Hackathons
        </Button>
      </div>
    );
  }

  const effectiveHackathonStatus = lifecycle?.hackathonStatus || hackathon.status;
  const effectiveRegistrationStatus = lifecycle?.registrationStatus || 'NOT_OPEN';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Hackathons', href: '/hackathons' },
              { label: hackathon.name, href: `/hackathons/${hackathon.id}` },
            ]}
          />
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-zinc-100 font-heading tracking-tight">
              {hackathon.name}
            </h1>
            <Badge
              variant={
                effectiveHackathonStatus === 'PUBLISHED'
                  ? 'success'
                  : effectiveHackathonStatus === 'DRAFT'
                  ? 'default'
                  : 'accent'
              }
            >
              {effectiveHackathonStatus}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {effectiveHackathonStatus === 'DRAFT' && (
            <Button
              size="sm"
              variant="accent"
              isLoading={publishMutation.isPending}
              onClick={() => publishMutation.mutate()}
            >
              Publish Hackathon
            </Button>
          )}

          {effectiveHackathonStatus === 'COMPLETED' && (
            <Button
              size="sm"
              variant="destructive"
              isLoading={archiveMutation.isPending}
              onClick={() => archiveMutation.mutate()}
            >
              Archive Hackathon
            </Button>
          )}

          <Link href={`/hackathons/${hackathonId}/tracks`}>
            <Button size="sm" variant="secondary">
              Tracks & Challenges
            </Button>
          </Link>
          <Link href={`/hackathons/${hackathonId}/judging`}>
            <Button size="sm" variant="outline">
              Judging
            </Button>
          </Link>
          <Link href={`/hackathons/${hackathonId}/integrity`}>
            <Button size="sm" variant="outline">
              Integrity
            </Button>
          </Link>
          <Link href={`/hackathons/${hackathonId}/results`}>
            <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/30">
              Results & Ranking
            </Button>
          </Link>
          <Link href={`/hackathons/${hackathonId}/leaderboard`}>
            <Button size="sm" variant="outline" className="text-cyan-400 border-cyan-500/30">
              Leaderboard
            </Button>
          </Link>
          <Link href={`/hackathons/${hackathonId}/configuration`}>
            <Button size="sm" variant="outline">
              Configuration
            </Button>
          </Link>
          <Link href={`/hackathons/${hackathonId}/rules`}>
            <Button size="sm" variant="outline">
              Rules
            </Button>
          </Link>
        </div>
      </div>

      {/* METADATA BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-zinc-800/80 bg-zinc-950/40 space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Registration</div>
          <div className="text-sm font-mono font-bold text-zinc-200">{effectiveRegistrationStatus}</div>
        </Card>
        <Card className="p-4 border-zinc-800/80 bg-zinc-950/40 space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Tracks</div>
          <div className="text-sm font-mono font-bold text-zinc-200">{tracks.length} Tracks Configured</div>
        </Card>
        <Card className="p-4 border-zinc-800/80 bg-zinc-950/40 space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Team Mode</div>
          <div className="text-sm font-mono font-bold text-zinc-200">
            {configuration?.participationMode || 'BOTH'}
          </div>
        </Card>
        <Card className="p-4 border-zinc-800/80 bg-zinc-950/40 space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Team Size</div>
          <div className="text-sm font-mono font-bold text-zinc-200">
            {configuration?.minTeamSize ?? 1} - {configuration?.maxTeamSize ?? 4} Members
          </div>
        </Card>
      </div>

      {/* PARTICIPANT REGISTRATION DOMAIN (S2-04) */}
      <Card className="p-6 border-zinc-800/80 bg-zinc-950/40 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-zinc-100">Participant Registration</h2>
              <p className="text-xs font-mono text-zinc-400">
                Enrollment status and challenge selection for this hackathon
              </p>
            </div>
          </div>
          {registration && (
            <Badge
              variant={
                registration.status === ParticipantRegistrationStatus.REGISTERED
                  ? 'success'
                  : 'destructive'
              }
            >
              {registration.status}
            </Badge>
          )}
        </div>

        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        {registration?.status === ParticipantRegistrationStatus.REGISTERED ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                You are registered for this hackathon
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">Selected Track</div>
                  <div className="text-xs font-mono text-zinc-200 font-semibold">
                    {registration.track?.name || 'General / None'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">Selected Challenge</div>
                  <div className="text-xs font-mono text-zinc-200 font-semibold">
                    {registration.challenge?.name || 'None'}
                  </div>
                </div>
              </div>
            </div>

            {effectiveHackathonStatus !== 'COMPLETED' && effectiveHackathonStatus !== 'ARCHIVED' && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Update Track & Challenge Selection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Track (Optional)</label>
                    <select
                      value={selectedTrackId}
                      onChange={(e) => {
                        setSelectedTrackId(e.target.value);
                        setSelectedChallengeId('');
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">General / No Track Selected</option>
                      {tracks.filter((t) => t.isActive).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Challenge (Optional)</label>
                    <select
                      value={selectedChallengeId}
                      onChange={(e) => setSelectedChallengeId(e.target.value)}
                      disabled={!selectedTrackId}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="">No Challenge Selected</option>
                      {challenges.filter((c) => c.status === 'PUBLISHED').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={updateSelectionMutation.isPending}
                    onClick={() =>
                      updateSelectionMutation.mutate({
                        trackId: selectedTrackId || null,
                        challengeId: selectedChallengeId || null,
                      })
                    }
                  >
                    Save Selection
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    isLoading={withdrawMutation.isPending}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to withdraw your registration?')) {
                        withdrawMutation.mutate();
                      }
                    }}
                  >
                    Withdraw Registration
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {effectiveRegistrationStatus === 'OPEN' &&
            effectiveHackathonStatus !== 'DRAFT' &&
            effectiveHackathonStatus !== 'COMPLETED' &&
            effectiveHackathonStatus !== 'ARCHIVED' ? (
              <div className="space-y-4">
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Registration is currently <span className="text-emerald-400 font-bold">OPEN</span>. Choose an optional track and challenge to participate.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Track (Optional)</label>
                    <select
                      value={selectedTrackId}
                      onChange={(e) => {
                        setSelectedTrackId(e.target.value);
                        setSelectedChallengeId('');
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">General / No Track Selected</option>
                      {tracks.filter((t) => t.isActive).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Challenge (Optional)</label>
                    <select
                      value={selectedChallengeId}
                      onChange={(e) => setSelectedChallengeId(e.target.value)}
                      disabled={!selectedTrackId}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="">No Challenge Selected</option>
                      {challenges.filter((c) => c.status === 'PUBLISHED').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="md"
                    variant="primary"
                    className="w-full sm:w-auto"
                    isLoading={registerMutation.isPending}
                    onClick={() =>
                      registerMutation.mutate({
                        trackId: selectedTrackId || null,
                        challengeId: selectedChallengeId || null,
                      })
                    }
                  >
                    {registration?.status === ParticipantRegistrationStatus.WITHDRAWN
                      ? 'Re-register for Hackathon'
                      : 'Register for Hackathon'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Registration Unavailable
                </div>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Registration window is currently <span className="text-zinc-300 font-bold">{effectiveRegistrationStatus}</span> and event status is <span className="text-zinc-300 font-bold">{effectiveHackathonStatus}</span>. Participant enrollment is closed.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* TEAM FORMATION DOMAIN (S2-05) */}
      <Card className="p-6 border-zinc-800/80 bg-zinc-950/40 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-zinc-100">Team Formation</h2>
              <p className="text-xs font-mono text-zinc-400">
                Create or manage your team, invite registered teammates, and coordinate membership
              </p>
            </div>
          </div>
          {myTeam && (
            <Badge variant="accent">
              {myTeam.memberCount ?? myTeam.members?.length ?? 1} / {configuration?.maxTeamSize ?? 4} Members
            </Badge>
          )}
        </div>

        {!isRegistered ? (
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400">
              <Shield className="w-4 h-4 text-indigo-400" />
              Registration Required
            </div>
            <p className="text-xs font-mono text-zinc-500 leading-relaxed">
              You must register for this hackathon before creating or joining a team.
            </p>
          </div>
        ) : myTeam ? (
          /* USER HAS ACTIVE TEAM */
          <div className="space-y-6">
            {/* Team Header */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold font-heading text-zinc-100">{myTeam.name}</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    Slug: <span className="text-indigo-400">{myTeam.slug}</span>
                    {myTeam.description && <span> • {myTeam.description}</span>}
                  </p>
                </div>
                <Badge variant="success">Active Team</Badge>
              </div>

              {/* Team Size Progress */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Team Size Progress</span>
                  <span>
                    {myTeam.memberCount ?? myTeam.members?.length ?? 1} of {configuration?.maxTeamSize ?? 4} (Min: {configuration?.minTeamSize ?? 1})
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((myTeam.memberCount ?? myTeam.members?.length ?? 1) / (configuration?.maxTeamSize ?? 4)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Team Members ({(myTeam.members || []).filter((m) => m.status === TeamMemberStatus.ACTIVE).length})
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {(myTeam.members || [])
                  .filter((m) => m.status === TeamMemberStatus.ACTIVE)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
                          {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-2">
                            {member.user?.name || member.user?.email || 'User'}
                            {member.role === TeamMemberRole.CAPTAIN && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Crown className="w-3 h-3" /> Captain
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500">
                            {member.user?.email} {member.user?.college && `• ${member.user.college}`}
                          </div>
                        </div>
                      </div>

                      {/* Captain controls for other members */}
                      {(myTeam.members || []).some((m) => m.role === TeamMemberRole.CAPTAIN) &&
                        member.role !== TeamMemberRole.CAPTAIN && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => transferCaptaincyMutation.mutate(member.id)}
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> Make Captain
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                              onClick={() => removeMemberMutation.mutate(member.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                            </Button>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Invite Teammates (Captain only or full team view) */}
            {(myTeam.memberCount ?? myTeam.members?.length ?? 1) < (configuration?.maxTeamSize ?? 4) && (
              <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-400" /> Invite Teammates
                </h4>
                {inviteError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs font-mono text-red-400">
                    {inviteError}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="teammate@university.edu"
                    value={inviteeEmail}
                    onChange={(e) => setInviteeEmail(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    size="sm"
                    variant="accent"
                    isLoading={inviteMemberMutation.isPending}
                    onClick={() => inviteMemberMutation.mutate({ inviteeEmail })}
                  >
                    Send Invitation
                  </Button>
                </div>
              </div>
            )}

            {/* S2-06: GitHub Integration & Team Repository Card */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Github className="w-4 h-4 text-emerald-400" /> GitHub Repository
                </h4>
                {githubStatus?.isConnected ? (
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Linked: @{githubStatus.githubUsername}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                    Disconnected
                  </Badge>
                )}
              </div>

              {teamRepo && teamRepo.status === 'CONNECTED' ? (
                <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-indigo-400" />
                      <a
                        href={teamRepo.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono font-bold text-indigo-300 hover:underline flex items-center gap-1"
                      >
                        {teamRepo.repositoryFullName} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <Badge variant="outline" className="text-xs text-zinc-400">
                      Branch: {teamRepo.defaultBranch}
                    </Badge>
                  </div>
                  {myTeam.members?.some((m) => m.userId === registration?.userId && m.role === TeamMemberRole.CAPTAIN) && (
                    <div className="pt-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                        isLoading={disconnectRepoMutation.isPending}
                        onClick={() => disconnectRepoMutation.mutate()}
                      >
                        Disconnect Repo
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-lg">
                  <div className="text-xs font-mono text-zinc-400">
                    {githubStatus?.isConnected
                      ? 'No repository provisioned for this team yet.'
                      : 'Connect your GitHub account to provision or attach a repository.'}
                  </div>
                  <div className="flex items-center gap-2">
                    {!githubStatus?.isConnected ? (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={connectGitHubMutation.isPending}
                        onClick={() => connectGitHubMutation.mutate()}
                      >
                        <Github className="w-3.5 h-3.5 mr-1.5" /> Connect GitHub
                      </Button>
                    ) : (
                      myTeam.members?.some((m) => m.userId === registration?.userId && m.role === TeamMemberRole.CAPTAIN) && (
                        <Button
                          size="sm"
                          variant="accent"
                          isLoading={provisionRepoMutation.isPending}
                          onClick={() => provisionRepoMutation.mutate()}
                        >
                          <GitBranch className="w-3.5 h-3.5 mr-1.5" /> Provision Repository
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Team Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800">
              <Button
                size="sm"
                variant="outline"
                isLoading={leaveTeamMutation.isPending}
                onClick={() => {
                  if (window.confirm('Are you sure you want to leave this team?')) {
                    leaveTeamMutation.mutate();
                  }
                }}
              >
                <LogOut className="w-4 h-4 mr-1.5" /> Leave Team
              </Button>
              <Button
                size="sm"
                variant="destructive"
                isLoading={dissolveTeamMutation.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to dissolve this team? All memberships will be terminated.'
                    )
                  ) {
                    dissolveTeamMutation.mutate();
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Dissolve Team
              </Button>
            </div>
          </div>
        ) : (
          /* USER DOES NOT HAVE A TEAM YET */
          <div className="space-y-6">
            {/* Pending Invitations Section */}
            {myInvitations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Pending Invitations ({myInvitations.length})
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {myInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-amber-950/10 border border-amber-500/20 rounded-lg flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-zinc-200">
                          {inv.team?.name}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">
                          Invited by {inv.invitedByUser?.name || inv.invitedByUser?.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={acceptInviteMutation.isPending}
                          onClick={() => acceptInviteMutation.mutate(inv.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={declineInviteMutation.isPending}
                          onClick={() => declineInviteMutation.mutate(inv.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Team Form */}
            {configuration?.participationMode !== 'INDIVIDUAL' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Create a New Team
                </h3>

                {teamError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {teamError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Team Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Quantum Pioneers"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Slug (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. quantum-pioneers"
                      value={teamSlug}
                      onChange={(e) => setTeamSlug(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-mono text-zinc-400">Description (Optional)</label>
                    <textarea
                      placeholder="Brief overview of what your team plans to build..."
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="md"
                    variant="primary"
                    disabled={!teamName.trim()}
                    isLoading={createTeamMutation.isPending}
                    onClick={() =>
                      createTeamMutation.mutate({
                        name: teamName.trim(),
                        slug: teamSlug.trim() || undefined,
                        description: teamDescription.trim() || undefined,
                      })
                    }
                  >
                    Create Team & Become Captain
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Individual Participation Only
                </div>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  This hackathon is configured for individual participation only. Team formation is disabled.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* PLACEHOLDERS FOR FUTURE SPRINT DOMAINS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Card className="p-5 border-zinc-800/80 bg-zinc-950/40 space-y-2 opacity-60">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono font-bold">
            <Layers className="w-4 h-4 text-zinc-500" />
            Rounds & Submission Windows
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Round configuration & submission windows belong to Sprint 2 - Task 02+.
          </p>
        </Card>

        <Card className="p-5 border-zinc-800/80 bg-zinc-950/40 space-y-2 opacity-60">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono font-bold">
            <Code className="w-4 h-4 text-zinc-500" />
            Repositories & Codespaces
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            GitHub repository orchestration belongs to future sprints.
          </p>
        </Card>

        <Card className="p-5 border-zinc-800/80 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              Submissions & Judging
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              Active
            </Badge>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Submit team project, review verified commit SHA snapshots, and access organizer judging panel.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <Link href={`/hackathons/${hackathonId}/submissions`}>
              <Button size="sm" variant="accent">
                Manage Submissions
              </Button>
            </Link>
            <Link href="/judging">
              <Button size="sm" variant="outline">
                Judge Portal
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5 border-zinc-800/80 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
              <Shield className="w-4 h-4 text-emerald-400" />
              Integrity & Forensics
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              Active
            </Badge>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Run automated code similarity checks, inspect structural overlap evidence, and review findings.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <Link href={`/hackathons/${hackathonId}/integrity`}>
              <Button size="sm" variant="accent">
                Integrity Portal
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
