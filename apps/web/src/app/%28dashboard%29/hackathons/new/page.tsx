'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Breadcrumbs, Button, Input, Card } from '@almosthack/ui';
import { ArrowLeft, Plus, Calendar, Clock, Globe, ShieldAlert, CheckCircle } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

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

export default function CreateHackathonPage() {
  const router = useRouter();

  const [organizationId, setOrganizationId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');

  // Dates stored in YYYY-MM-DDTHH:mm local datetime-local format for inputs
  const now = new Date();
  const defaultRegStart = new Date(now.getTime() + 86400000).toISOString().slice(0, 16);
  const defaultRegEnd = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 16);
  const defaultStart = new Date(now.getTime() + 10 * 86400000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 12 * 86400000).toISOString().slice(0, 16);

  const [regStartsAt, setRegStartsAt] = useState<string>(defaultRegStart);
  const [regEndsAt, setRegEndsAt] = useState<string>(defaultRegEnd);
  const [startsAt, setStartsAt] = useState<string>(defaultStart);
  const [endsAt, setEndsAt] = useState<string>(defaultEnd);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch user organizations
  const { data: userOrgs, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: () => apiClient.getUserOrganizations(),
  });

  useEffect(() => {
    if (userOrgs && userOrgs.length > 0 && !organizationId) {
      setOrganizationId(userOrgs[0].organization.id);
    }
  }, [userOrgs, organizationId]);

  // Live slug auto-generation preview
  const autoSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const effectiveSlug = slug || autoSlug;

  // Date Invariant Validation
  const dRegStarts = new Date(regStartsAt);
  const dRegEnds = new Date(regEndsAt);
  const dStarts = new Date(startsAt);
  const dEnds = new Date(endsAt);

  const dateErrors: string[] = [];
  if (dRegStarts.getTime() >= dRegEnds.getTime()) {
    dateErrors.push('Registration start must be strictly before registration end.');
  }
  if (dRegEnds.getTime() > dStarts.getTime()) {
    dateErrors.push('Registration end must be on or before event start.');
  }
  if (dStarts.getTime() >= dEnds.getTime()) {
    dateErrors.push('Event start must be strictly before event end.');
  }

  const isFormValid = name.trim().length >= 2 && organizationId && dateErrors.length === 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      return apiClient.createHackathon(organizationId, {
        name,
        slug: effectiveSlug,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        timezone,
        registrationStartsAt: new Date(regStartsAt).toISOString(),
        registrationEndsAt: new Date(regEndsAt).toISOString(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
    },
    onSuccess: (data: any) => {
      router.push(`/hackathons/${data.id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to create hackathon');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: 'Platform' },
            { label: 'Hackathons', href: '/hackathons' },
            { label: 'Create New' },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Create Hackathon
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Configure core hackathon identity, IANA timezone, and chronological schedule.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push('/hackathons')}
          >
            Back
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6 bg-zinc-900/60 border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100 font-heading border-b border-zinc-800 pb-3">
            1. Organization & Identity
          </h2>

          <div className="space-y-4">
            {/* Organization Selector */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Target Organization <span className="text-rose-400">*</span>
              </label>
              {isLoadingOrgs ? (
                <div className="text-xs text-zinc-500 font-mono">Loading organizations...</div>
              ) : !userOrgs || userOrgs.length === 0 ? (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded text-xs text-amber-300 font-mono">
                  You must create an organization before launching a hackathon.
                </div>
              ) : (
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                >
                  {userOrgs.map((item: any) => (
                    <option key={item.organization.id} value={item.organization.id}>
                      {item.organization.name} ({item.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Hackathon Name */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Hackathon Name <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. AlmostHack Security & AI Sprint 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Slug & Preview */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Custom Slug (Optional)
              </label>
              <Input
                placeholder="e.g. security-ai-sprint-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="text-[11px] text-zinc-400 font-mono mt-1">
                Slug preview: <span className="text-emerald-400 font-bold">{effectiveSlug || 'my-hackathon'}</span>
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Detailed objectives, challenges, and rules for participants..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-3 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Branding URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Logo URL</label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Website URL</label>
                <Input
                  placeholder="https://example.com/hackathon"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Timezone & Schedule */}
        <Card className="p-6 space-y-6 bg-zinc-900/60 border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100 font-heading border-b border-zinc-800 pb-3">
            2. Timezone & Chronological Schedule
          </h2>

          <div className="space-y-4">
            {/* IANA Timezone */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                IANA Timezone <span className="text-rose-400">*</span>
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Registration Starts At (UTC) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={regStartsAt}
                  onChange={(e) => setRegStartsAt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Registration Ends At (UTC) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={regEndsAt}
                  onChange={(e) => setRegEndsAt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Event Starts At (UTC) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Event Ends At (UTC) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Live Date Chronological Warnings */}
            {dateErrors.length > 0 && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs font-mono text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  Chronological Date Invariant Errors:
                </div>
                {dateErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs font-mono text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/hackathons')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            disabled={!isFormValid || createMutation.isPending}
            isLoading={createMutation.isPending}
          >
            Create Hackathon (DRAFT)
          </Button>
        </div>
      </form>
    </div>
  );
}
