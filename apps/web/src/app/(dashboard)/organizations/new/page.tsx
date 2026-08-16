'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Building2, ArrowLeft, Loader2, ShieldAlert, Check } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-slug generator preview helper
  const generatedSlugPreview = slug.trim()
    ? slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      slug?: string;
      description?: string;
      websiteUrl?: string;
      logoUrl?: string;
    }) => {
      return apiClient.createOrganization<{ id: string; slug: string }>(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      router.push(`/organizations/${data.id}`);
    },
    onError: (err: any) => {
      setErrorMessage(
        err?.message || 'Failed to create organization. Please check input parameters.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Organization name is required');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      slug: slug.trim() ? generatedSlugPreview : undefined,
      description: description.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/organizations"
          className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 font-heading tracking-tight">
            Create New Organization
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Establish a persistent organization domain to organize hackathons and manage team members.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-xs font-mono flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <p className="font-semibold">Creation Error</p>
            <p className="text-[11px] text-rose-300/80 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-5 backdrop-blur">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
            Organization Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AlmostHack Community"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
          />
        </div>

        {/* Custom Slug Input */}
        <div>
          <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
            Organization Slug <span className="text-zinc-500 font-normal">(Optional)</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-mono text-zinc-500">
              /
            </span>
            <input
              type="text"
              placeholder="e.g. almosthack-community"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-7 pr-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
          {generatedSlugPreview && (
            <p className="text-[11px] font-mono text-zinc-500 mt-1.5 flex items-center gap-1">
              Slug preview: <span className="text-emerald-400">/{generatedSlugPreview}</span>
            </p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
            Description <span className="text-zinc-500 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview of the organization's mission and activities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
          />
        </div>

        {/* Website & Logo URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
              Website URL
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
              Logo Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Link
            href="/organizations"
            className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-mono hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Organization
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
