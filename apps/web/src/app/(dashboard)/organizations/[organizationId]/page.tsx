'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import {
  Building2,
  Users,
  Settings,
  ShieldAlert,
  Globe,
  Plus,
  Trash2,
  UserCheck,
  ArrowLeft,
  Loader2,
  Check,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const organizationId = params.organizationId as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'members' | 'danger'>('overview');

  // Form states for settings
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Add Member state
  const [addUserId, setAddUserId] = useState('');
  const [addRole, setAddRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Transfer Ownership state
  const [transferTargetId, setTransferTargetId] = useState('');

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch Organization Details
  const {
    data: org,
    isLoading: isLoadingOrg,
    isError: isErrorOrg,
    error: errorOrg,
  } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: async () => {
      const res = await apiClient.getOrganization<{
        id: string;
        name: string;
        slug: string;
        description?: string;
        logoUrl?: string;
        websiteUrl?: string;
        createdAt: string;
      }>(organizationId);

      // Populate edit states
      setEditName(res.name);
      setEditSlug(res.slug);
      setEditDescription(res.description || '');
      setEditWebsiteUrl(res.websiteUrl || '');
      setEditLogoUrl(res.logoUrl || '');
      return res;
    },
  });

  // Fetch Current User Organizations to determine caller role
  const { data: myOrgs } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: async () => {
      return apiClient.getUserOrganizations<
        Array<{
          organization: { id: string };
          role: 'OWNER' | 'ADMIN' | 'MEMBER';
        }>
      >();
    },
  });

  const callerRole = myOrgs?.find((item) => item.organization.id === org?.id)?.role;
  const isOwner = callerRole === 'OWNER';
  const isAdminOrOwner = callerRole === 'OWNER' || callerRole === 'ADMIN';

  // Fetch Members List
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      return apiClient.getOrganizationMembers<
        Array<{
          id: string;
          userId: string;
          role: 'OWNER' | 'ADMIN' | 'MEMBER';
          status: 'ACTIVE' | 'SUSPENDED';
          joinedAt: string;
          user?: {
            id: string;
            name: string;
            email: string;
            avatarUrl?: string;
          };
        }>
      >(organizationId);
    },
    enabled: !!org,
  });

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      return apiClient.updateOrganization(organizationId, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
        description: editDescription.trim() || undefined,
        websiteUrl: editWebsiteUrl.trim() || undefined,
        logoUrl: editLogoUrl.trim() || undefined,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      if (updated.id !== organizationId) {
        router.push(`/organizations/${updated.id}`);
      }
    },
  });

  // Add Member Mutation
  const addMemberMutation = useMutation({
    mutationFn: async () => {
      return apiClient.addOrganizationMember(organizationId, {
        userId: addUserId.trim(),
        role: addRole,
      });
    },
    onSuccess: () => {
      setAddUserId('');
      setAddMemberError(null);
      refetchMembers();
    },
    onError: (err: any) => {
      setAddMemberError(err?.message || 'Failed to add member.');
    },
  });

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ targetUserId, role }: { targetUserId: string; role: 'ADMIN' | 'MEMBER' }) => {
      return apiClient.updateOrganizationMemberRole(organizationId, targetUserId, { role });
    },
    onSuccess: () => {
      refetchMembers();
    },
  });

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return apiClient.removeOrganizationMember(organizationId, targetUserId);
    },
    onSuccess: () => {
      refetchMembers();
    },
  });

  // Transfer Ownership Mutation
  const transferOwnershipMutation = useMutation({
    mutationFn: async () => {
      return apiClient.transferOrganizationOwnership(organizationId, {
        newOwnerId: transferTargetId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      refetchMembers();
      setTransferTargetId('');
    },
  });

  // Delete Organization Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.deleteOrganization(organizationId, {
        confirmation: deleteConfirmation.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      router.push('/organizations');
    },
    onError: (err: any) => {
      setDeleteError(err?.message || 'Failed to delete organization.');
    },
  });

  if (isLoadingOrg) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-500" />
        Loading organization details...
      </div>
    );
  }

  if (isErrorOrg || !org) {
    return (
      <div className="max-w-xl mx-auto rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 font-mono text-xs text-rose-300 space-y-3">
        <ShieldAlert className="w-6 h-6 text-rose-400" />
        <h2 className="text-sm font-bold">Organization Not Found</h2>
        <p className="text-rose-400/80">
          {(errorOrg as Error)?.message || 'You do not have access to this organization.'}
        </p>
        <Link href="/organizations" className="inline-block px-3 py-1.5 rounded bg-zinc-900 text-zinc-200 hover:bg-zinc-800">
          Return to Organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/organizations"
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-800" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-lg text-emerald-400 font-mono">
                {org.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100 font-heading">{org.name}</h1>
                {callerRole && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 uppercase">
                    {callerRole}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-400">/{org.slug}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'members'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Members ({members?.length ?? 0})
        </button>
        {isAdminOrOwner && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Settings
          </button>
        )}
        {isOwner && (
          <button
            onClick={() => setActiveTab('danger')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'danger'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-zinc-500 hover:text-rose-400'
            }`}
          >
            Danger Zone
          </button>
        )}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-200 font-heading">About Organization</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {org.description || 'No description provided.'}
            </p>
            {org.websiteUrl && (
              <div className="pt-2">
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {org.websiteUrl}
                </a>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-4 font-mono text-xs">
            <h2 className="text-sm font-bold text-zinc-200 font-heading">Metadata</h2>
            <div className="space-y-3">
              <div>
                <span className="text-zinc-500 block">Organization ID</span>
                <span className="text-zinc-300 select-all text-[11px]">{org.id}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Members</span>
                <span className="text-zinc-200 font-semibold">{members?.length ?? 0} active</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Created On</span>
                <span className="text-zinc-300">{new Date(org.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Add Member Form (Admin/Owner) */}
          {isAdminOrOwner && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
              <h3 className="text-xs font-mono font-semibold text-zinc-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Add Member by Target User ID
              </h3>
              {addMemberError && (
                <div className="text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2 rounded">
                  {addMemberError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Target User UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)"
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:border-emerald-500 focus:outline-none"
                />
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 font-mono focus:border-emerald-500 focus:outline-none"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button
                  onClick={() => addMemberMutation.mutate()}
                  disabled={!addUserId.trim() || addMemberMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-mono hover:bg-emerald-400 disabled:opacity-50 transition-colors shrink-0"
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          )}

          {/* Members List Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined</th>
                  {isAdminOrOwner && <th className="p-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {members?.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/40">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {m.user?.avatarUrl ? (
                          <img src={m.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                            {m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-zinc-200 font-sans">{m.user?.name || 'User'}</p>
                          <p className="text-[10px] text-zinc-500">{m.user?.email || m.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded border border-zinc-700/60 bg-zinc-800 text-[10px]">
                        {m.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-emerald-400 text-[10px]">{m.status}</span>
                    </td>
                    <td className="p-3.5 text-zinc-400 text-[11px]">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                    {isAdminOrOwner && (
                      <td className="p-3.5 text-right space-x-2">
                        {m.role !== 'OWNER' && (
                          <>
                            <select
                              value={m.role}
                              onChange={(e) =>
                                updateRoleMutation.mutate({
                                  targetUserId: m.userId,
                                  role: e.target.value as 'ADMIN' | 'MEMBER',
                                })
                              }
                              className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300 font-mono"
                            >
                              <option value="MEMBER">MEMBER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>

                            <button
                              onClick={() => removeMemberMutation.mutate(m.userId)}
                              className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-[10px]"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transfer Ownership Section (OWNER only) */}
          {isOwner && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <h3 className="text-xs font-mono font-semibold text-amber-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Transfer Organization Ownership
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Transfer ultimate ownership to another active member. You will automatically become an ADMIN.
              </p>
              <div className="flex gap-3">
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 font-mono"
                >
                  <option value="">Select new owner...</option>
                  {members
                    ?.filter((m) => m.role !== 'OWNER')
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.name} ({m.user?.email || m.userId})
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => transferOwnershipMutation.mutate()}
                  disabled={!transferTargetId || transferOwnershipMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs font-mono hover:bg-amber-400 disabled:opacity-50"
                >
                  {transferOwnershipMutation.isPending ? 'Transferring...' : 'Transfer Ownership'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS (Admin/Owner) */}
      {activeTab === 'settings' && isAdminOrOwner && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateSettingsMutation.mutate();
          }}
          className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4"
        >
          {settingsSuccess && (
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4" />
              Settings updated successfully!
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
              Organization Slug
            </label>
            <input
              type="text"
              required
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={editWebsiteUrl}
                onChange={(e) => setEditWebsiteUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={editLogoUrl}
                onChange={(e) => setEditLogoUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="px-5 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-mono hover:bg-emerald-400 disabled:opacity-50"
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: DANGER ZONE (Owner only) */}
      {activeTab === 'danger' && isOwner && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-4 font-mono">
          <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Organization
          </h2>
          <p className="text-xs text-zinc-400">
            This action is irreversible. All memberships and organization records will be permanently deleted.
          </p>

          {deleteError && (
            <div className="p-3 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
              {deleteError}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <label className="block text-xs text-zinc-300">
              Type <span className="text-emerald-400 font-bold">{org.slug}</span> to confirm deletion:
            </label>
            <input
              type="text"
              placeholder={org.slug}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full max-w-md rounded-lg border border-rose-500/30 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
            />
            <div>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteConfirmation !== org.slug || deleteMutation.isPending}
                className="px-5 py-2 rounded-lg bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Permanently Delete Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
