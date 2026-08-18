'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Card, Badge, Skeleton } from '@almosthack/ui';
import {
  ArrowLeft,
  Edit3,
  Eye,
  Save,
  Lock,
  Users,
  GraduationCap,
  Bot,
  GitBranch,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  HackathonEntity,
  HackathonLifecycleResponse,
  HackathonRulesResponse,
} from '@almosthack/types';

export default function HackathonRulesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  const [isEditingRules, setIsEditingRules] = useState<boolean>(false);
  const [rulesMarkdown, setRulesMarkdown] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Queries
  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery<HackathonEntity>({
    queryKey: ['hackathon', hackathonId],
    queryFn: () => apiClient.getHackathon(hackathonId),
  });

  const { data: lifecycle } = useQuery<HackathonLifecycleResponse>({
    queryKey: ['hackathon-lifecycle', hackathonId],
    queryFn: () => apiClient.getHackathonLifecycle(hackathonId),
    enabled: !!hackathonId,
  });

  const { data: rulesData, isLoading: isLoadingRules } = useQuery<HackathonRulesResponse>({
    queryKey: ['hackathon-rules', hackathonId],
    queryFn: () => apiClient.getHackathonRules(hackathonId),
    enabled: !!hackathonId,
  });

  useEffect(() => {
    if (rulesData?.rulesMarkdown !== undefined) {
      setRulesMarkdown(rulesData.rulesMarkdown || '');
    }
  }, [rulesData]);

  const effectiveStatus = lifecycle?.hackathonStatus || hackathon?.status || 'DRAFT';
  const isLocked = effectiveStatus === 'LIVE' || effectiveStatus === 'COMPLETED' || effectiveStatus === 'ARCHIVED';

  const updateMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      setSuccessMsg(null);
      return apiClient.updateHackathonRules(hackathonId, {
        rulesMarkdown: rulesMarkdown || null,
      });
    },
    onSuccess: () => {
      setSuccessMsg('Hackathon rules content updated successfully.');
      setIsEditingRules(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon-rules', hackathonId] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to update rules markdown.');
    },
  });

  if (isLoadingHackathon || isLoadingRules || !hackathon || !rulesData) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Controls & Breadcrumbs */}
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: 'Platform' },
            { label: 'Hackathons', href: '/hackathons' },
            { label: hackathon.name, href: `/hackathons/${hackathonId}` },
            { label: 'Rules & Guidelines' },
          ]}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight flex items-center gap-2">
              Participant Rules & Guidelines
              <Badge variant="accent">{effectiveStatus}</Badge>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Official participation requirements, policies, and human-readable code of conduct for {hackathon.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push(`/hackathons/${hackathonId}`)}
            >
              Overview
            </Button>
            {!isLocked && (
              <Button
                variant={isEditingRules ? 'secondary' : 'accent'}
                size="sm"
                leftIcon={isEditingRules ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                onClick={() => setIsEditingRules(!isEditingRules)}
              >
                {isEditingRules ? 'View Presentation' : 'Edit Rules Document'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs font-mono text-amber-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Rules document is <strong>LOCKED</strong> in state <strong className="uppercase">{effectiveStatus}</strong>.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs font-mono text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* POLICY OVERVIEW CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Participation Card */}
        <Card className="p-4 bg-zinc-900/80 border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <Users className="w-4 h-4" /> Participation Mode
          </div>
          <p className="text-sm font-bold text-zinc-100 font-heading">
            {rulesData.participationMode}
          </p>
          <p className="text-[11px] font-mono text-zinc-400">
            {rulesData.participationMode === 'INDIVIDUAL'
              ? 'Solo participation only'
              : `Team size: ${rulesData.minTeamSize ?? 1} - ${rulesData.maxTeamSize ?? 4} members`}
          </p>
        </Card>

        {/* Eligibility Card */}
        <Card className="p-4 bg-zinc-900/80 border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <GraduationCap className="w-4 h-4" /> Eligibility Scope
          </div>
          <p className="text-sm font-bold text-zinc-100 font-heading">
            {rulesData.eligibilityType}
          </p>
          <p className="text-[11px] font-mono text-zinc-400 truncate">
            {rulesData.allowedBranches.length > 0
              ? `Branches: ${rulesData.allowedBranches.join(', ')}`
              : 'All branches eligible'}
          </p>
        </Card>

        {/* AI Policy Card */}
        <Card className="p-4 bg-zinc-900/80 border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <Bot className="w-4 h-4" /> AI Policy
          </div>
          <p className="text-sm font-bold text-zinc-100 font-heading">
            {rulesData.aiUsagePolicy}
          </p>
          <p className="text-[11px] font-mono text-zinc-400">
            {rulesData.aiDisclosureRequired ? 'Disclosure required' : 'Standard usage permitted'}
          </p>
        </Card>

        {/* Repository Policy Card */}
        <Card className="p-4 bg-zinc-900/80 border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <GitBranch className="w-4 h-4" /> GitHub & Repo
          </div>
          <p className="text-sm font-bold text-zinc-100 font-heading">
            {rulesData.repositoryPolicy}
          </p>
          <p className="text-[11px] font-mono text-zinc-400">
            {rulesData.githubRequired ? 'GitHub integration required' : 'Optional GitHub link'}
          </p>
        </Card>
      </div>

      {/* ADDITIONAL POLICY DETAILS SUMMARY */}
      <Card className="p-6 bg-zinc-900/60 border-zinc-800 space-y-4">
        <h2 className="text-md font-bold text-zinc-100 font-heading border-b border-zinc-800 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Development Invariants & Policy Directives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 space-y-1">
            <span className="text-zinc-500">Pre-Existing Code</span>
            <p className="text-zinc-200 font-bold">{rulesData.preExistingCodePolicy}</p>
          </div>
          <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 space-y-1">
            <span className="text-zinc-500">Open-Source Libraries</span>
            <p className="text-zinc-200 font-bold">{rulesData.openSourcePolicy}</p>
          </div>
          <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 space-y-1">
            <span className="text-zinc-500">Graduation Year Scope</span>
            <p className="text-zinc-200 font-bold">
              {rulesData.graduationYearFrom || rulesData.graduationYearTo
                ? `${rulesData.graduationYearFrom || 'Any'} - ${rulesData.graduationYearTo || 'Any'}`
                : 'Unrestricted'}
            </p>
          </div>
        </div>
      </Card>

      {/* HUMAN READABLE RULES DOCUMENT */}
      <Card className="p-6 bg-zinc-900/60 border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-zinc-100 font-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Official Rules Document
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            Last updated: {new Date(rulesData.updatedAt).toLocaleString()}
          </span>
        </div>

        {isEditingRules && !isLocked ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Markdown Rules Content (Max 100,000 chars)
              </label>
              <textarea
                rows={16}
                value={rulesMarkdown}
                onChange={(e) => setRulesMarkdown(e.target.value)}
                placeholder="Write official hackathon rules in Markdown format..."
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-4 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setIsEditingRules(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                isLoading={updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
              >
                Save Rules Document
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950/80 p-6 rounded-lg border border-zinc-800 min-h-[200px] whitespace-pre-wrap">
            {rulesData.rulesMarkdown || (
              <p className="text-zinc-500 italic">
                No human-readable rules document has been published for this hackathon yet. Persisted machine-enforceable policies above govern event participation.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
