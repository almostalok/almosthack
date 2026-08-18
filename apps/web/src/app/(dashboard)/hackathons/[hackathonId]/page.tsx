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
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { HackathonEntity, HackathonLifecycleResponse } from '@almosthack/types';

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

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
