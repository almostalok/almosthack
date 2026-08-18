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
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  HackathonEntity,
  HackathonLifecycleResponse,
  HackathonTrackEntity,
  HackathonChallengeEntity,
  ParticipantRegistrationEntity,
  ParticipantRegistrationStatus,
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

  // Fetch hackathon details
  const {
    data: hackathon,
    isLoading: isLoadingHackathon,
    error: hackathonError,
  } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
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
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to withdraw from hackathon');
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: 'Platform' },
            { label: 'Hackathons', href: '/hackathons' },
            { label: hackathon.name },
          ]}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {hackathon.logoUrl && (
              <img
                src={hackathon.logoUrl}
                alt={hackathon.name}
                className="w-10 h-10 rounded-lg object-contain bg-zinc-950 p-1 border border-zinc-800"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
                {hackathon.name}
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Slug: <span className="text-emerald-400">{hackathon.slug}</span> | Timezone: {hackathon.timezone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hackathon.status === 'DRAFT' && (
              <Button
                variant="accent"
                size="sm"
                leftIcon={<Send className="w-4 h-4" />}
                isLoading={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
              >
                Publish Hackathon
              </Button>
            )}

            {effectiveHackathonStatus === 'COMPLETED' && hackathon.status !== 'ARCHIVED' && (
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Archive className="w-4 h-4" />}
                isLoading={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate()}
              >
                Archive Hackathon
              </Button>
            )}

            <Link href={`/hackathons/${hackathonId}/tracks`}>
              <Button variant="accent" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
                Tracks & Challenges
              </Button>
            </Link>

            <Link href={`/hackathons/${hackathonId}/configuration`}>
              <Button variant="secondary" size="sm" leftIcon={<Sliders className="w-4 h-4" />}>
                Configuration
              </Button>
            </Link>

            <Link href={`/hackathons/${hackathonId}/rules`}>
              <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
                Rules
              </Button>
            </Link>

            <Link href={`/hackathons/${hackathonId}/settings`}>
              <Button variant="secondary" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* DISTINCT LIFECYCLE & REGISTRATION STATUS DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hackathon Event Lifecycle Box */}
        <Card className="p-5 border-zinc-800 bg-zinc-900/80 space-y-2">
          <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">
            HACKATHON LIFECYCLE
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-heading text-zinc-100">
              {effectiveHackathonStatus}
            </span>
            {effectiveHackathonStatus === 'LIVE' && <Badge variant="success">LIVE</Badge>}
            {effectiveHackathonStatus === 'PUBLISHED' && <Badge variant="accent">PUBLISHED</Badge>}
            {effectiveHackathonStatus === 'DRAFT' && <Badge variant="warning">DRAFT</Badge>}
            {effectiveHackathonStatus === 'COMPLETED' && <Badge variant="default">COMPLETED</Badge>}
            {effectiveHackathonStatus === 'ARCHIVED' && <Badge variant="outline">ARCHIVED</Badge>}
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Authoritative macro state derived from schedule & lifecycle actions.
          </p>
        </Card>

        {/* Registration Window Box */}
        <Card className="p-5 border-zinc-800 bg-zinc-900/80 space-y-2">
          <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">
            REGISTRATION WINDOW
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-heading text-zinc-100">
              {effectiveRegistrationStatus}
            </span>
            {effectiveRegistrationStatus === 'OPEN' && <Badge variant="success">OPEN</Badge>}
            {effectiveRegistrationStatus === 'CLOSED' && <Badge variant="default">CLOSED</Badge>}
            {effectiveRegistrationStatus === 'NOT_OPEN' && <Badge variant="warning">NOT OPEN</Badge>}
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Independent state derived from registration start and end timestamps.
          </p>
        </Card>
      </div>

      {/* Core Hackathon Information */}
      <Card className="p-6 bg-zinc-900/60 border-zinc-800 space-y-6">
        <h2 className="text-lg font-bold text-zinc-100 font-heading border-b border-zinc-800 pb-3">
          Event Core Schedule & Metadata
        </h2>

        {hackathon.description && (
          <div>
            <span className="text-xs font-mono text-zinc-400">Description</span>
            <p className="text-sm text-zinc-300 font-mono mt-1 leading-relaxed">
              {hackathon.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Registration Timestamps */}
          <div className="space-y-3 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-zinc-200">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Registration Window
            </div>
            <div className="space-y-1.5 text-xs font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>Starts At:</span>
                <span className="text-zinc-200">{new Date(hackathon.registrationStartsAt).toUTCString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Ends At:</span>
                <span className="text-zinc-200">{new Date(hackathon.registrationEndsAt).toUTCString()}</span>
              </div>
            </div>
          </div>

          {/* Event Schedule Timestamps */}
          <div className="space-y-3 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-zinc-200">
              <Clock className="w-4 h-4 text-emerald-400" />
              Event Schedule
            </div>
            <div className="space-y-1.5 text-xs font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>Starts At:</span>
                <span className="text-zinc-200">{new Date(hackathon.startsAt).toUTCString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Ends At:</span>
                <span className="text-zinc-200">{new Date(hackathon.endsAt).toUTCString()}</span>
              </div>
            </div>
          </div>
        </div>

        {hackathon.websiteUrl && (
          <div className="pt-2 flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Globe className="w-4 h-4 text-zinc-500" />
            <span>Website:</span>
            <a
              href={hackathon.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              {hackathon.websiteUrl} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </Card>

      {/* S2-04: PARTICIPANT REGISTRATION CARD */}
      <Card className="p-6 bg-gradient-to-br from-zinc-900/90 to-zinc-950 border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 font-heading">
                Participant Registration
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Server-authoritative enrollment, track selection, and withdrawal management.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoadingRegistration ? (
              <Badge variant="outline">Checking status...</Badge>
            ) : registration?.status === ParticipantRegistrationStatus.REGISTERED ? (
              <Badge variant="success" className="px-3 py-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> REGISTERED
              </Badge>
            ) : registration?.status === ParticipantRegistrationStatus.WITHDRAWN ? (
              <Badge variant="warning" className="px-3 py-1 text-xs">
                <UserX className="w-3.5 h-3.5 mr-1 inline" /> WITHDRAWN
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1 text-xs">
                NOT REGISTERED
              </Badge>
            )}
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs font-mono text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {registration?.status === ParticipantRegistrationStatus.REGISTERED ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" /> You are registered for this hackathon
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-zinc-300 pt-1">
                <div>
                  <span className="text-zinc-500 block">Registered At:</span>
                  <span className="text-zinc-200">{new Date(registration.registeredAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Selected Track:</span>
                  <span className="text-zinc-200">{registration.track?.name || 'General / Unassigned'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Selected Challenge:</span>
                  <span className="text-zinc-200">{registration.challenge?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Selection Update & Withdrawal Controls */}
            {effectiveHackathonStatus !== 'COMPLETED' && effectiveHackathonStatus !== 'ARCHIVED' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Update Track & Challenge Selection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Track</label>
                    <select
                      value={selectedTrackId}
                      onChange={(e) => {
                        setSelectedTrackId(e.target.value);
                        setSelectedChallengeId('');
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">No Track Selected</option>
                      {tracks.filter((t) => t.isActive).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Challenge</label>
                    <select
                      value={selectedChallengeId}
                      onChange={(e) => setSelectedChallengeId(e.target.value)}
                      disabled={!effectiveTrackId}
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

                <div className="flex items-center justify-between pt-2">
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
                    Save Selection Changes
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    isLoading={withdrawMutation.isPending}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to withdraw your registration from this hackathon?')) {
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
          /* NOT REGISTERED OR WITHDRAWN FORM */
          <div className="space-y-4">
            {effectiveRegistrationStatus === 'OPEN' && effectiveHackathonStatus !== 'DRAFT' && effectiveHackathonStatus !== 'COMPLETED' && effectiveHackathonStatus !== 'ARCHIVED' ? (
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
                    {registration?.status === ParticipantRegistrationStatus.WITHDRAWN ? 'Re-register for Hackathon' : 'Register for Hackathon'}
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

        <Card className="p-5 border-zinc-800/80 bg-zinc-950/40 space-y-2 opacity-60">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono font-bold">
            <Award className="w-4 h-4 text-zinc-500" />
            Judging & Leaderboards
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Auditable scorelines & judging panel belong to future sprints.
          </p>
        </Card>
      </div>
    </div>
  );
}
