'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Building2, Plus, Users, Globe, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react';

export default function OrganizationsPage() {
  const { data: orgs, isLoading, isError, error } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: async () => {
      return apiClient.getUserOrganizations<
        Array<{
          organization: {
            id: string;
            name: string;
            slug: string;
            description?: string;
            logoUrl?: string;
            websiteUrl?: string;
            createdAt: string;
          };
          role: 'OWNER' | 'ADMIN' | 'MEMBER';
          status: 'ACTIVE' | 'SUSPENDED';
          joinedAt: string;
        }>
      >();
    },
  });

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ADMIN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 font-heading tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Organizations
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Manage your persistent organization identity, memberships, roles, and authorization boundaries.
          </p>
        </div>
        <Link
          href="/organizations/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-mono hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Organization
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-zinc-800" />
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-xs font-mono flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Failed to load organizations</p>
            <p className="text-[11px] text-rose-400/80 mt-0.5">
              {(error as Error)?.message || 'Unable to connect to service'}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && orgs?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">No organizations found</h3>
            <p className="text-xs text-zinc-500 font-mono mt-1 max-w-md">
              You are not currently a member of any organization. Create a new organization to begin hosting hackathons and managing teams.
            </p>
          </div>
          <Link
            href="/organizations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-mono hover:bg-emerald-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Organization
          </Link>
        </div>
      )}

      {/* Organization Grid */}
      {!isLoading && !isError && (orgs?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs?.map(({ organization: org, role, status }) => (
            <Link
              key={org.id}
              href={`/organizations/${org.id}`}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold font-mono text-emerald-400">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors font-heading">
                        {org.name}
                      </h2>
                      <p className="text-[11px] font-mono text-zinc-500">
                        /{org.slug}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadgeStyle(
                      role
                    )}`}
                  >
                    {role}
                  </span>
                </div>

                {org.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                    {org.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
                <div className="flex items-center gap-2">
                  {org.websiteUrl && (
                    <span className="flex items-center gap-1 hover:text-zinc-300">
                      <Globe className="w-3 h-3 text-zinc-400" />
                      Website
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
