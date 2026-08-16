'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs, Button, Input, Badge, Card, EmptyState, Skeleton } from '@almosthack/ui';
import { Search, Plus, Calendar, Globe, Building, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { HackathonEntity } from '@almosthack/types';

export default function HackathonsPage() {
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fetch user organizations
  const { data: userOrgs, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: () => apiClient.getUserOrganizations(),
  });

  const activeOrgId = selectedOrgId || (userOrgs && userOrgs.length > 0 ? userOrgs[0].organization.id : '');

  // Fetch hackathons for active organization
  const {
    data: hackathons,
    isLoading: isLoadingHackathons,
  } = useQuery<HackathonEntity[]>({
    queryKey: ['organization-hackathons', activeOrgId],
    queryFn: () => (activeOrgId ? apiClient.getOrganizationHackathons(activeOrgId) : Promise.resolve([])),
    enabled: !!activeOrgId,
  });

  const filteredHackathons = (hackathons || []).filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <Badge variant="success">LIVE</Badge>;
      case 'PUBLISHED':
        return <Badge variant="accent">PUBLISHED</Badge>;
      case 'DRAFT':
        return <Badge variant="warning">DRAFT</Badge>;
      case 'COMPLETED':
        return <Badge variant="default">COMPLETED</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline">ARCHIVED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'Hackathons' }]} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight">
              Hackathon Operating Shell
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Auditable lifecycle management from registration to verifiable completion.
            </p>
          </div>
          <Link href="/hackathons/new">
            <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Hackathon
            </Button>
          </Link>
        </div>
      </div>

      {/* Organization Selector Toolbar */}
      {userOrgs && userOrgs.length > 0 && (
        <div className="flex items-center gap-3 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
          <Building className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-zinc-400">Organization:</span>
          <select
            value={activeOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          >
            {userOrgs.map((item: any) => (
              <option key={item.organization.id} value={item.organization.id}>
                {item.organization.name} ({item.role})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-950/60 p-3 border border-zinc-800 rounded-lg">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Filter by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-zinc-500" />}
          />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span>Status:</span>
          {['ALL', 'DRAFT', 'PUBLISHED', 'LIVE', 'COMPLETED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold'
                  : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Hackathons Grid */}
      {isLoadingOrgs || isLoadingHackathons ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : filteredHackathons.length === 0 ? (
        <EmptyState
          title="No Hackathons Found"
          description={
            userOrgs?.length === 0
              ? 'You must create or join an organization first.'
              : 'No hackathons exist for the selected criteria.'
          }
          actionLabel="Create Hackathon"
          onAction={() => router.push('/hackathons/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHackathons.map((h) => (
            <Link key={h.id} href={`/hackathons/${h.id}`}>
              <Card className="hover:border-zinc-700 transition-all p-5 h-full flex flex-col justify-between group bg-zinc-900/50 hover:bg-zinc-900/80">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold font-heading text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {h.name}
                    </h3>
                    {getStatusBadge(h.status)}
                  </div>
                  <p className="text-xs text-zinc-400 font-mono line-clamp-2">
                    {h.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-2 text-xs font-mono text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      Timezone
                    </span>
                    <span className="text-zinc-200">{h.timezone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Starts
                    </span>
                    <span className="text-zinc-200">
                      {new Date(h.startsAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-zinc-500">Slug: {h.slug}</span>
                    <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Manage <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
