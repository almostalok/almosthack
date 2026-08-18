'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs, Button, Input, Card, Badge, Skeleton } from '@almosthack/ui';
import {
  ArrowLeft,
  Save,
  Lock,
  Users,
  GraduationCap,
  GitBranch,
  Bot,
  FileCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  HackathonEntity,
  HackathonLifecycleResponse,
  HackathonConfigurationEntity,
  ParticipationMode,
  EligibilityType,
  AIUsagePolicy,
  PreExistingCodePolicy,
  OpenSourcePolicy,
  RepositoryPolicy,
} from '@almosthack/types';

export default function HackathonConfigurationPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hackathonId = params.hackathonId as string;

  // Form State
  const [participationMode, setParticipationMode] = useState<ParticipationMode>(ParticipationMode.BOTH);
  const [minTeamSize, setMinTeamSize] = useState<number>(1);
  const [maxTeamSize, setMaxTeamSize] = useState<number>(4);
  const [eligibilityType, setEligibilityType] = useState<EligibilityType>(EligibilityType.OPEN);
  const [allowedBranchesText, setAllowedBranchesText] = useState<string>('');
  const [allowedCollegesText, setAllowedCollegesText] = useState<string>('');
  const [graduationYearFrom, setGraduationYearFrom] = useState<string>('');
  const [graduationYearTo, setGraduationYearTo] = useState<string>('');
  const [aiUsagePolicy, setAiUsagePolicy] = useState<AIUsagePolicy>(AIUsagePolicy.ALLOWED);
  const [aiDisclosureRequired, setAiDisclosureRequired] = useState<boolean>(false);
  const [preExistingCodePolicy, setPreExistingCodePolicy] = useState<PreExistingCodePolicy>(PreExistingCodePolicy.PROHIBITED);
  const [openSourcePolicy, setOpenSourcePolicy] = useState<OpenSourcePolicy>(OpenSourcePolicy.ALLOWED_WITH_ATTRIBUTION);
  const [githubRequired, setGithubRequired] = useState<boolean>(true);
  const [repositoryPolicy, setRepositoryPolicy] = useState<RepositoryPolicy>(RepositoryPolicy.PLATFORM_MANAGED);

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

  const { data: config, isLoading: isLoadingConfig } = useQuery<HackathonConfigurationEntity>({
    queryKey: ['hackathon-config', hackathonId],
    queryFn: () => apiClient.getHackathonConfiguration(hackathonId),
    enabled: !!hackathonId,
  });

  useEffect(() => {
    if (config) {
      setParticipationMode(config.participationMode);
      setMinTeamSize(config.minTeamSize ?? 1);
      setMaxTeamSize(config.maxTeamSize ?? 4);
      setEligibilityType(config.eligibilityType);
      setAllowedBranchesText(config.allowedBranches.join(', '));
      setAllowedCollegesText(config.allowedColleges.join(', '));
      setGraduationYearFrom(config.graduationYearFrom ? String(config.graduationYearFrom) : '');
      setGraduationYearTo(config.graduationYearTo ? String(config.graduationYearTo) : '');
      setAiUsagePolicy(config.aiUsagePolicy);
      setAiDisclosureRequired(config.aiDisclosureRequired);
      setPreExistingCodePolicy(config.preExistingCodePolicy);
      setOpenSourcePolicy(config.openSourcePolicy);
      setGithubRequired(config.githubRequired);
      setRepositoryPolicy(config.repositoryPolicy);
    }
  }, [config]);

  const effectiveStatus = lifecycle?.hackathonStatus || hackathon?.status || 'DRAFT';
  const isLocked = effectiveStatus === 'LIVE' || effectiveStatus === 'COMPLETED' || effectiveStatus === 'ARCHIVED';

  const updateMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      setSuccessMsg(null);

      const branches = allowedBranchesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const colleges = allowedCollegesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const body: any = {
        participationMode,
        minTeamSize: participationMode === ParticipationMode.INDIVIDUAL ? null : Number(minTeamSize),
        maxTeamSize: participationMode === ParticipationMode.INDIVIDUAL ? null : Number(maxTeamSize),
        eligibilityType,
        allowedBranches: branches,
        allowedColleges: colleges,
        graduationYearFrom: graduationYearFrom ? Number(graduationYearFrom) : null,
        graduationYearTo: graduationYearTo ? Number(graduationYearTo) : null,
        aiUsagePolicy,
        aiDisclosureRequired,
        preExistingCodePolicy,
        openSourcePolicy,
        githubRequired,
        repositoryPolicy,
      };

      return apiClient.updateHackathonConfiguration(hackathonId, body);
    },
    onSuccess: () => {
      setSuccessMsg('Hackathon configuration saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['hackathon-config', hackathonId] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || 'Failed to update configuration.');
    },
  });

  if (isLoadingHackathon || isLoadingConfig || !hackathon) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar & Breadcrumbs */}
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: 'Platform' },
            { label: 'Hackathons', href: '/hackathons' },
            { label: hackathon.name, href: `/hackathons/${hackathonId}` },
            { label: 'Configuration' },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-zinc-100 tracking-tight flex items-center gap-2">
              Hackathon Configuration
              {isLocked ? (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> LOCKED ({effectiveStatus})
                </Badge>
              ) : (
                <Badge variant="success">EDITABLE ({effectiveStatus})</Badge>
              )}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Define static participation, eligibility, AI policy, code rules, and repository requirements.
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
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileCheck className="w-4 h-4" />}
              onClick={() => router.push(`/hackathons/${hackathonId}/rules`)}
            >
              Public Rules
            </Button>
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs font-mono text-amber-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Core policies are <strong>LOCKED</strong> in state <strong className="uppercase">{effectiveStatus}</strong> to protect event integrity and ensure participant fairness.
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="space-y-6"
      >
        {/* Section 1: Participation Rules */}
        <Card className="p-6 space-y-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100 font-heading">
              Participation & Team Size Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Participation Mode</label>
              <select
                value={participationMode}
                onChange={(e) => setParticipationMode(e.target.value as ParticipationMode)}
                disabled={isLocked}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={ParticipationMode.BOTH}>INDIVIDUAL & TEAM (BOTH)</option>
                <option value={ParticipationMode.TEAM}>TEAM ONLY</option>
                <option value={ParticipationMode.INDIVIDUAL}>INDIVIDUAL ONLY</option>
              </select>
            </div>

            {participationMode !== ParticipationMode.INDIVIDUAL && (
              <>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Min Team Size</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(Number(e.target.value))}
                    disabled={isLocked}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Max Team Size</label>
                  <Input
                    type="number"
                    min={minTeamSize}
                    max={100}
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    disabled={isLocked}
                    required
                  />
                </div>
              </>
            )}
          </div>
          {participationMode === ParticipationMode.INDIVIDUAL && (
            <p className="text-[11px] font-mono text-zinc-400 bg-zinc-950/60 p-2.5 rounded border border-zinc-800">
              Note: Under INDIVIDUAL mode, team formation is disabled. Team size parameters are automatically set to null.
            </p>
          )}
        </Card>

        {/* Section 2: Eligibility Rules */}
        <Card className="p-6 space-y-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100 font-heading">
              Eligibility & Academic Restrictions
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Eligibility Scope</label>
              <select
                value={eligibilityType}
                onChange={(e) => setEligibilityType(e.target.value as EligibilityType)}
                disabled={isLocked}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={EligibilityType.OPEN}>OPEN (Anyone can participate)</option>
                <option value={EligibilityType.STUDENTS_ONLY}>STUDENTS ONLY</option>
                <option value={EligibilityType.INVITE_ONLY}>INVITE ONLY (Policy declaration)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Allowed Branches (comma separated, leave blank for all)
                </label>
                <Input
                  placeholder="e.g. CSE, ECE, IT, Mechanical"
                  value={allowedBranchesText}
                  onChange={(e) => setAllowedBranchesText(e.target.value)}
                  disabled={isLocked}
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Allowed Colleges (comma separated, leave blank for all)
                </label>
                <Input
                  placeholder="e.g. MIT, Stanford, IIT Bombay"
                  value={allowedCollegesText}
                  onChange={(e) => setAllowedCollegesText(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Graduation Year (From)</label>
                <Input
                  type="number"
                  placeholder="e.g. 2024"
                  value={graduationYearFrom}
                  onChange={(e) => setGraduationYearFrom(e.target.value)}
                  disabled={isLocked}
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Graduation Year (To)</label>
                <Input
                  type="number"
                  placeholder="e.g. 2028"
                  value={graduationYearTo}
                  onChange={(e) => setGraduationYearTo(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: AI & Development Policy */}
        <Card className="p-6 space-y-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100 font-heading">
              AI, Code & Open-Source Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">AI Usage Policy</label>
              <select
                value={aiUsagePolicy}
                onChange={(e) => setAiUsagePolicy(e.target.value as AIUsagePolicy)}
                disabled={isLocked}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={AIUsagePolicy.ALLOWED}>ALLOWED (AI tools permitted)</option>
                <option value={AIUsagePolicy.RESTRICTED}>RESTRICTED (Limited AI usage)</option>
                <option value={AIUsagePolicy.PROHIBITED}>PROHIBITED (No AI assistance)</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiDisclosureRequired}
                  onChange={(e) => setAiDisclosureRequired(e.target.checked)}
                  disabled={isLocked}
                  className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                Mandatory AI Tool & Prompt Disclosure Required
              </label>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Pre-Existing Code Policy</label>
              <select
                value={preExistingCodePolicy}
                onChange={(e) => setPreExistingCodePolicy(e.target.value as PreExistingCodePolicy)}
                disabled={isLocked}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={PreExistingCodePolicy.PROHIBITED}>PROHIBITED (All code built during hackathon)</option>
                <option value={PreExistingCodePolicy.ALLOWED}>ALLOWED</option>
                <option value={PreExistingCodePolicy.ALLOWED_WITH_DISCLOSURE}>ALLOWED WITH DISCLOSURE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Open-Source Policy</label>
              <select
                value={openSourcePolicy}
                onChange={(e) => setOpenSourcePolicy(e.target.value as OpenSourcePolicy)}
                disabled={isLocked}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={OpenSourcePolicy.ALLOWED_WITH_ATTRIBUTION}>ALLOWED WITH ATTRIBUTION</option>
                <option value={OpenSourcePolicy.ALLOWED}>ALLOWED (Unrestricted)</option>
                <option value={OpenSourcePolicy.RESTRICTED}>RESTRICTED (Specific licenses only)</option>
                <option value={OpenSourcePolicy.PROHIBITED}>PROHIBITED (No third-party libraries)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 4: GitHub & Repository Policy */}
        <Card className="p-6 space-y-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100 font-heading">
              GitHub Integration & Repository Requirements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center pt-2">
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={githubRequired}
                  onChange={(e) => setGithubRequired(e.target.checked)}
                  disabled={isLocked}
                  className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                Mandatory GitHub Integration Required
              </label>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Repository Provisioning Policy</label>
              <select
                value={repositoryPolicy}
                onChange={(e) => setRepositoryPolicy(e.target.value as RepositoryPolicy)}
                disabled={isLocked}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={RepositoryPolicy.PLATFORM_MANAGED}>PLATFORM MANAGED (AlmostHack creates mandatory repo)</option>
                <option value={RepositoryPolicy.EXTERNAL_ALLOWED}>EXTERNAL ALLOWED (Participants link external repo)</option>
              </select>
            </div>
          </div>
        </Card>

        {!isLocked && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="accent"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={updateMutation.isPending}
            >
              Save Configuration Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
