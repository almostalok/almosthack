'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Input, Card, Skeleton } from '@almosthack/ui';
import { ArrowLeft, Save, Send, Archive, Globe, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { HackathonEntity, HackathonLifecycleResponse } from '@almosthack/types';

const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Singapore',
];

export default function HackathonSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('UTC');
  const [regStartsAt, setRegStartsAt] = useState<string>('');
  const [regEndsAt, setRegEndsAt] = useState<string>('');
  const [startsAt, setStartsAt] = useState<string>('');
  const [endsAt, setEndsAt] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch hackathon details
  const { data: hackathon, isLoading } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
  });

  // Fetch lifecycle
  const { data: lifecycle } = useQuery<HackathonLifecycleResponse>({
    queryKey: ['hackathon-lifecycle', hackathonId],
    queryFn: () => apiClient.getHackathonLifecycle(hackathonId),
    enabled: !!hackathonId,
  });

  useEffect(() => {
    if (hackathon) {
      setName(hackathon.name || '');
      setSlug(hackathon.slug || '');
      setDescription(hackathon.description || '');
      setLogoUrl(hackathon.logoUrl || '');
      setWebsiteUrl(hackathon.websiteUrl || '');
      setTimezone(hackathon.timezone || 'UTC');

      setRegStartsAt(
        hackathon.registrationStartsAt
          ? new Date(hackathon.registrationStartsAt).toISOString().slice(0, 16)
          : ''
      );
      setRegEndsAt(
        hackathon.registrationEndsAt
          ? new Date(hackathon.registrationEndsAt).toISOString().slice(0, 16)
          : ''
      );
      setStartsAt(
        hackathon.startsAt ? new Date(hackathon.startsAt).toISOString().slice(0, 16) : ''
      );
      setEndsAt(
        hackathon.endsAt ? new Date(hackathon.endsAt).toISOString().slice(0, 16) : ''
      );
    }
  }, [hackathon]);

  const effectiveStatus = lifecycle?.hackathonStatus || hackathon?.status || 'DRAFT';

  const isReadOnly = effectiveStatus === 'ARCHIVED' || effectiveStatus === 'COMPLETED';
  const isScheduleDisabled = isReadOnly || effectiveStatus === 'LIVE';

  const updateMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      setSuccessMsg(null);
      const body: any = {
        name,
        slug: slug || undefined,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        timezone,
      };

      if (!isScheduleDisabled) {
        body.registrationStartsAt = new Date(regStartsAt).toISOString();
        body.registrationEndsAt = new Date(regEndsAt).toISOString();
        body.startsAt = new Date(startsAt).toISOString();
        body.endsAt = new Date(endsAt).toISOString();
      }

      return apiClient.updateHackathon(hackathonId, body);
    },
    onSuccess: () => {
      setSuccessMsg('Hackathon settings updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-lifecycle', hackathonId] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to update hackathon settings');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => apiClient.publishHackathon(hackathonId),
    onSuccess: () => {
      setSuccessMsg('Hackathon published successfully!');
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-lifecycle', hackathonId] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.archiveHackathon(hackathonId),
    onSuccess: () => {
      setSuccessMsg('Hackathon archived successfully.');
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-lifecycle', hackathonId] });
    },
  });

  if (isLoading || !hackathon) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: 'Platform' },
            { label: 'Hackathons', href: '/hackathons' },
            { label: hackathon.name, href: `/hackathons/${hackathonId}` },
            { label: 'Settings' },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Hackathon Settings
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Edit hackathon configuration. Allowed fields are governed by current status ({effectiveStatus}).
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push(`/hackathons/${hackathonId}`)}
          >
            Back to Overview
          </Button>
        </div>
      </div>

      {isReadOnly && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs font-mono text-amber-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          Hackathon is in <strong className="uppercase">{effectiveStatus}</strong> state. Operational modifications are disabled.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs font-mono text-rose-300">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs font-mono text-emerald-300">
          {successMsg}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="space-y-6"
      >
        <Card className="p-6 space-y-4 bg-zinc-900/60 border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100 font-heading border-b border-zinc-800 pb-3">
            General Metadata
          </h2>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isReadOnly}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-3 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Logo URL</label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Website URL</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 bg-zinc-900/60 border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100 font-heading border-b border-zinc-800 pb-3">
            Timezone & Schedule
          </h2>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              IANA Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={isReadOnly}
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Registration Starts</label>
              <input
                type="datetime-local"
                value={regStartsAt}
                onChange={(e) => setRegStartsAt(e.target.value)}
                disabled={isScheduleDisabled}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Registration Ends</label>
              <input
                type="datetime-local"
                value={regEndsAt}
                onChange={(e) => setRegEndsAt(e.target.value)}
                disabled={isScheduleDisabled}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Event Starts</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                disabled={isScheduleDisabled}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Event Ends</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                disabled={isScheduleDisabled}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>
        </Card>

        {/* Explicit Lifecycle Operations */}
        <Card className="p-6 space-y-4 bg-zinc-900/60 border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100 font-heading border-b border-zinc-800 pb-3">
            Explicit Lifecycle Actions
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {hackathon.status === 'DRAFT' && (
              <Button
                type="button"
                variant="accent"
                leftIcon={<Send className="w-4 h-4" />}
                isLoading={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
              >
                Publish Hackathon
              </Button>
            )}

            {effectiveStatus === 'COMPLETED' && hackathon.status !== 'ARCHIVED' && (
              <Button
                type="button"
                variant="destructive"
                leftIcon={<Archive className="w-4 h-4" />}
                isLoading={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate()}
              >
                Archive Hackathon
              </Button>
            )}

            {hackathon.status !== 'DRAFT' && effectiveStatus !== 'COMPLETED' && (
              <p className="text-xs font-mono text-zinc-400">
                No explicit lifecycle action available for status: <strong className="text-zinc-200">{effectiveStatus}</strong>
              </p>
            )}
          </div>
        </Card>

        {!isReadOnly && (
          <div className="flex items-center justify-end gap-3">
            <Button
              type="submit"
              variant="accent"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
