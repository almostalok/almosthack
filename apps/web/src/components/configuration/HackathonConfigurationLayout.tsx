'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Card, Badge, Skeleton } from '@almosthack/ui';
import {
  ArrowLeft,
  Save,
  Lock,
  Sliders,
  Calendar,
  Users,
  Users2,
  Layers,
  Scale,
  Bot,
  Rocket,
  AlertTriangle,
  CheckCircle2,
  Building2,
  GitBranch,
} from 'lucide-react';
import { ConfigSectionGeneral, GeneralConfigData } from './ConfigSectionGeneral';
import { ConfigSectionSchedule, ScheduleConfigData } from './ConfigSectionSchedule';
import { ConfigSectionParticipation, ParticipationConfigData } from './ConfigSectionParticipation';
import { ConfigSectionTeams, TeamsConfigData } from './ConfigSectionTeams';
import { ConfigSectionTracks } from './ConfigSectionTracks';
import { ConfigSectionJudging, JudgingConfigData } from './ConfigSectionJudging';
import { ConfigSectionCodePolicy, CodePolicyConfigData } from './ConfigSectionCodePolicy';
import { ConfigSectionReadiness, ReadinessItem } from './ConfigSectionReadiness';
import { ConfigSectionDangerZone } from './ConfigSectionDangerZone';
import { PublishHackathonDialog } from './PublishHackathonDialog';
import {
  AIUsagePolicy,
  PreExistingCodePolicy,
  OpenSourcePolicy,
  RepositoryPolicy,
} from '@almosthack/types';

export interface HackathonConfigurationLayoutProps {
  hackathonId: string;
}

export const HackathonConfigurationLayout: React.FC<HackathonConfigurationLayoutProps> = ({
  hackathonId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState<boolean>(false);

  // Queries
  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return {
          id: hackathonId,
          name: 'Hack The Future 2026',
          slug: 'hack-the-future-2026',
          description: 'Global flagship sprint for verified decentralized infrastructure.',
          timezone: 'UTC',
          format: 'ONLINE',
          location: 'Global / Virtual',
          websiteUrl: '',
          logoUrl: '',
          status: 'DRAFT',
          registrationStartsAt: new Date().toISOString(),
          registrationEndsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
          startsAt: new Date(Date.now() + 86400000 * 8).toISOString(),
          endsAt: new Date(Date.now() + 86400000 * 15).toISOString(),
        };
      }
    },
  });

  const { data: config, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['hackathon-config', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathonConfiguration(hackathonId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(hackathonId),
  });

  const { data: lifecycle } = useQuery({
    queryKey: ['hackathon-lifecycle', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathonLifecycle(hackathonId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(hackathonId),
  });

  // Section 1: General
  const [generalData, setGeneralData] = useState<GeneralConfigData>({
    name: '',
    slug: '',
    description: '',
    timezone: 'UTC',
    format: 'ONLINE',
    location: '',
    websiteUrl: '',
    logoUrl: '',
  });

  // Section 2: Schedule
  const [scheduleData, setScheduleData] = useState<ScheduleConfigData>({
    registrationStartsAt: '',
    registrationEndsAt: '',
    startsAt: '',
    endsAt: '',
    timezone: 'UTC',
  });

  // Section 3: Participation
  const [participationData, setParticipationData] = useState<ParticipationConfigData>({
    eligibilityType: 'OPEN',
    allowedBranchesText: '',
    allowedCollegesText: '',
    graduationYearFrom: '',
    graduationYearTo: '',
  });

  // Section 4: Teams
  const [teamsData, setTeamsData] = useState<TeamsConfigData>({
    participationMode: 'BOTH',
    minTeamSize: 1,
    maxTeamSize: 4,
  });

  // Section 6: Judging
  const [judgingData, setJudgingData] = useState<JudgingConfigData>({
    criteria: [
      {
        id: 'crit_1',
        name: 'Technical Execution & Architecture',
        weight: 40,
        description: 'Clean codebase, test coverage, and systems robustness.',
      },
      {
        id: 'crit_2',
        name: 'Originality & Novelty',
        weight: 25,
        description: 'Fresh approach to the problem with novel insights.',
      },
      {
        id: 'crit_3',
        name: 'Ecosystem Impact & Utility',
        weight: 20,
        description: 'Practical usefulness and real-world adoption potential.',
      },
      {
        id: 'crit_4',
        name: 'Presentation & Demo Video',
        weight: 15,
        description: 'Coherent pitch and functional live demo.',
      },
    ],
    scoreScale: 10,
    aiDisclosureRequired: true,
    minJudgesPerSubmission: 2,
  });

  // Section 7: Code policy
  const [codePolicyData, setCodePolicyData] = useState<CodePolicyConfigData>({
    aiUsagePolicy: AIUsagePolicy.ALLOWED,
    aiDisclosureRequired: true,
    preExistingCodePolicy: PreExistingCodePolicy.PROHIBITED,
    openSourcePolicy: OpenSourcePolicy.ALLOWED_WITH_ATTRIBUTION,
    githubRequired: true,
    repositoryPolicy: RepositoryPolicy.PLATFORM_MANAGED,
  });

  // Sync state from server data
  useEffect(() => {
    if (hackathon) {
      setGeneralData({
        name: hackathon.name || '',
        slug: hackathon.slug || '',
        description: hackathon.description || '',
        timezone: hackathon.timezone || 'UTC',
        format: (hackathon.format as any) || 'ONLINE',
        location: hackathon.location || '',
        websiteUrl: hackathon.websiteUrl || '',
        logoUrl: hackathon.logoUrl || '',
      });

      setScheduleData({
        registrationStartsAt: hackathon.registrationStartsAt || '',
        registrationEndsAt: hackathon.registrationEndsAt || '',
        startsAt: hackathon.startsAt || '',
        endsAt: hackathon.endsAt || '',
        timezone: hackathon.timezone || 'UTC',
      });
    }
  }, [hackathon]);

  useEffect(() => {
    if (config) {
      setParticipationData({
        eligibilityType: (config.eligibilityType as any) || 'OPEN',
        allowedBranchesText: config.allowedBranches ? config.allowedBranches.join(', ') : '',
        allowedCollegesText: config.allowedColleges ? config.allowedColleges.join(', ') : '',
        graduationYearFrom: config.graduationYearFrom ? String(config.graduationYearFrom) : '',
        graduationYearTo: config.graduationYearTo ? String(config.graduationYearTo) : '',
      });

      setTeamsData({
        participationMode: (config.participationMode as any) || 'BOTH',
        minTeamSize: config.minTeamSize ?? 1,
        maxTeamSize: config.maxTeamSize ?? 4,
      });

      setCodePolicyData({
        aiUsagePolicy: config.aiUsagePolicy || AIUsagePolicy.ALLOWED,
        aiDisclosureRequired: config.aiDisclosureRequired ?? true,
        preExistingCodePolicy: config.preExistingCodePolicy || PreExistingCodePolicy.PROHIBITED,
        openSourcePolicy: config.openSourcePolicy || OpenSourcePolicy.ALLOWED_WITH_ATTRIBUTION,
        githubRequired: config.githubRequired ?? true,
        repositoryPolicy: config.repositoryPolicy || RepositoryPolicy.PLATFORM_MANAGED,
      });
    }
  }, [config]);

  const effectiveStatus = lifecycle?.hackathonStatus || hackathon?.status || 'DRAFT';
  const isLocked =
    effectiveStatus === 'LIVE' ||
    effectiveStatus === 'COMPLETED' ||
    effectiveStatus === 'ARCHIVED';

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaveErrorMsg(null);
      setSaveSuccessMsg(null);

      // 1. Update hackathon details
      await apiClient.updateHackathon(hackathonId, {
        name: generalData.name.trim(),
        slug: generalData.slug.trim() || undefined,
        description: generalData.description.trim() || undefined,
        timezone: generalData.timezone,
        websiteUrl: generalData.websiteUrl.trim() || undefined,
        logoUrl: generalData.logoUrl.trim() || undefined,
        registrationStartsAt: scheduleData.registrationStartsAt || undefined,
        registrationEndsAt: scheduleData.registrationEndsAt || undefined,
        startsAt: scheduleData.startsAt || undefined,
        endsAt: scheduleData.endsAt || undefined,
      });

      // 2. Update configuration policies
      const branches = participationData.allowedBranchesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const colleges = participationData.allowedCollegesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await apiClient.updateHackathonConfiguration(hackathonId, {
        participationMode: teamsData.participationMode,
        minTeamSize: teamsData.participationMode === 'INDIVIDUAL' ? null : teamsData.minTeamSize,
        maxTeamSize: teamsData.participationMode === 'INDIVIDUAL' ? null : teamsData.maxTeamSize,
        eligibilityType: participationData.eligibilityType,
        allowedBranches: branches,
        allowedColleges: colleges,
        graduationYearFrom: participationData.graduationYearFrom
          ? Number(participationData.graduationYearFrom)
          : null,
        graduationYearTo: participationData.graduationYearTo
          ? Number(participationData.graduationYearTo)
          : null,
        aiUsagePolicy: codePolicyData.aiUsagePolicy,
        aiDisclosureRequired: codePolicyData.aiDisclosureRequired,
        preExistingCodePolicy: codePolicyData.preExistingCodePolicy,
        openSourcePolicy: codePolicyData.openSourcePolicy,
        githubRequired: codePolicyData.githubRequired,
        repositoryPolicy: codePolicyData.repositoryPolicy,
      });
    },
    onSuccess: () => {
      setSaveSuccessMsg('Configuration changes saved successfully.');
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-config', hackathonId] });
    },
    onError: (err: any) => {
      setSaveErrorMsg(err?.message || 'Failed to save configuration changes.');
    },
  });

  // Publish Mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      return apiClient.publishHackathon(hackathonId);
    },
    onSuccess: () => {
      setIsPublishDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hackathon', hackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hackathon-lifecycle', hackathonId] });
      router.push(`/hackathons/${hackathonId}`);
    },
  });

  // Compute Readiness Checklist
  const totalJudgingWeight = judgingData.criteria.reduce(
    (sum, c) => sum + (Number(c.weight) || 0),
    0
  );

  const readinessItems: ReadinessItem[] = [
    {
      id: 'r1',
      tabId: 'general',
      title: 'Event Identity & Name',
      summary: `${generalData.name || 'Unnamed'} · ${generalData.format}`,
      valid: generalData.name.trim().length >= 2,
      message: 'Event name is required (min 2 characters).',
      icon: Building2,
    },
    {
      id: 'r2',
      tabId: 'schedule',
      title: 'Operational Schedule & Dates',
      summary: `${scheduleData.timezone} · Lifecycle timestamps set`,
      valid:
        Boolean(scheduleData.registrationStartsAt) &&
        Boolean(scheduleData.startsAt) &&
        Boolean(scheduleData.endsAt),
      message: 'Registration and hacking cutoff timestamps required.',
      icon: Calendar,
    },
    {
      id: 'r3',
      tabId: 'participation',
      title: 'Builder Eligibility Policy',
      summary: `${participationData.eligibilityType} scope configured`,
      valid: true,
      icon: Users,
    },
    {
      id: 'r4',
      tabId: 'teams',
      title: 'Team Formation Limits',
      summary:
        teamsData.participationMode === 'INDIVIDUAL'
          ? 'Solo builders'
          : `Teams of ${teamsData.minTeamSize}–${teamsData.maxTeamSize} members`,
      valid: true,
      icon: Users2,
    },
    {
      id: 'r5',
      tabId: 'tracks',
      title: 'Prize Tracks & Themes',
      summary: 'Configured prize tracks & challenge scopes',
      valid: true,
      icon: Layers,
    },
    {
      id: 'r6',
      tabId: 'judging',
      title: 'Double-Blind Rubric Weights',
      summary: `${judgingData.criteria.length} criteria · Total weight: ${totalJudgingWeight}%`,
      valid: judgingData.criteria.length > 0 && totalJudgingWeight === 100,
      message: `Criteria weights must sum to 100% (currently ${totalJudgingWeight}%).`,
      icon: Scale,
    },
    {
      id: 'r7',
      tabId: 'code-policy',
      title: 'AI & Code Forensics Policies',
      summary: `AI: ${codePolicyData.aiUsagePolicy} · Pre-existing code: ${codePolicyData.preExistingCodePolicy}`,
      valid: true,
      icon: Bot,
    },
    {
      id: 'r8',
      tabId: 'code-policy',
      title: 'GitHub Repository Provisioning',
      summary: `${codePolicyData.repositoryPolicy} mode`,
      valid: true,
      icon: GitBranch,
    },
  ];

  const isReadyToPublish = readinessItems.every((i) => i.valid);

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'participation', label: 'Participation', icon: Users },
    { id: 'teams', label: 'Teams', icon: Users2 },
    { id: 'tracks', label: 'Tracks', icon: Layers },
    { id: 'judging', label: 'Judging', icon: Scale },
    { id: 'code-policy', label: 'Code & AI Policy', icon: Bot },
    { id: 'readiness', label: 'Readiness & Launch', icon: Rocket },
    { id: 'danger-zone', label: 'Danger Zone', icon: AlertTriangle },
  ];

  if (isLoadingHackathon || isLoadingConfig) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto text-left animate-pulse">
        <Skeleton className="h-10 w-72 rounded-[8px]" />
        <Skeleton className="h-96 rounded-[12px]" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6 max-w-6xl mx-auto text-left"
      role="region"
      aria-label="Hackathon Configuration Center"
    >
      {/* Top Banner & Header */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                {generalData.name || hackathon?.name || 'Hackathon Configuration'}
              </h1>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-[#FFF4DC] text-[#785A12] px-2 py-0.5 rounded border border-[#F0D597]">
                  <Lock className="w-3 h-3" /> LOCKED ({effectiveStatus})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-[#E2EBDD] text-[#274535] px-2 py-0.5 rounded border border-[#B8CEB0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#028051]" /> EDITABLE ({effectiveStatus})
                </span>
              )}
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Operational parameter configuration, double-blind criteria weights, and participation policies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}`)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8"
            >
              Workspace Overview
            </Button>

            {!isLocked && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => saveMutation.mutate()}
                isLoading={saveMutation.isPending}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="text-xs font-mono h-8 bg-[#028051] hover:bg-[#355C45]"
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Lock warning banner */}
        {isLocked && (
          <div className="p-3 bg-[#FFF4DC] border border-[#F0D597] rounded-[8px] flex items-center gap-2 text-xs font-mono text-[#785A12]">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              This hackathon is in status <strong>{effectiveStatus}</strong>. Core configuration is locked to protect live scoring integrity.
            </span>
          </div>
        )}

        {/* Save messages */}
        {saveErrorMsg && (
          <div className="p-3 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[8px] flex items-center gap-2 text-xs font-mono text-[#8B2C24]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="p-3 bg-[#E2EBDD] border border-[#B8CEB0] rounded-[8px] flex items-center gap-2 text-xs font-mono text-[#274535]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#028051]" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Navigation Tabs + Section Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1 bg-[#FFFDF8] border border-[#DCDDD3] rounded-[10px] p-2 shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDanger = tab.id === 'danger-zone';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSaveSuccessMsg(null);
                  setSaveErrorMsg(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-mono font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? isDanger
                      ? 'bg-[#FBE6E3] text-[#8B2C24] font-bold border border-[#F3C9B2]'
                      : 'bg-[#E2EBDD] text-[#274535] font-bold border border-[#B8CEB0]'
                    : isDanger
                    ? 'text-[#8B2C24] hover:bg-[#FBE6E3]/60'
                    : 'text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive
                      ? isDanger
                        ? 'text-[#8B2C24]'
                        : 'text-[#028051]'
                      : isDanger
                      ? 'text-[#8B2C24]'
                      : 'text-[#6D7068]'
                  }`}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content Pane */}
        <div className="md:col-span-3">
          {activeTab === 'general' && (
            <ConfigSectionGeneral
              data={generalData}
              onChange={(d) => {
                setGeneralData((prev) => ({ ...prev, ...d }));
                setHasUnsavedChanges(true);
              }}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'schedule' && (
            <ConfigSectionSchedule
              data={scheduleData}
              onChange={(d) => {
                setScheduleData((prev) => ({ ...prev, ...d }));
                setHasUnsavedChanges(true);
              }}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'participation' && (
            <ConfigSectionParticipation
              data={participationData}
              onChange={(d) => {
                setParticipationData((prev) => ({ ...prev, ...d }));
                setHasUnsavedChanges(true);
              }}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'teams' && (
            <ConfigSectionTeams
              data={teamsData}
              onChange={(d) => {
                setTeamsData((prev) => ({ ...prev, ...d }));
                setHasUnsavedChanges(true);
              }}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'tracks' && (
            <ConfigSectionTracks hackathonId={hackathonId} isLocked={isLocked} />
          )}

          {activeTab === 'judging' && (
            <ConfigSectionJudging
              data={judgingData}
              onChange={(d) => {
                setJudgingData((prev) => ({ ...prev, ...d }));
                setHasUnsavedChanges(true);
              }}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'code-policy' && (
            <ConfigSectionCodePolicy
              data={codePolicyData}
              onChange={(d) => {
                setCodePolicyData((prev) => ({ ...prev, ...d }));
                setHasUnsavedChanges(true);
              }}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'readiness' && (
            <ConfigSectionReadiness
              items={readinessItems}
              onNavigateTab={(t) => setActiveTab(t)}
              onOpenPublishDialog={() => setIsPublishDialogOpen(true)}
              isLocked={isLocked}
              status={effectiveStatus}
            />
          )}

          {activeTab === 'danger-zone' && (
            <ConfigSectionDangerZone
              hackathonId={hackathonId}
              hackathonName={generalData.name || hackathon?.name || 'Hack The Future 2026'}
            />
          )}
        </div>
      </div>

      {/* Explicit Publish Dialog */}
      <PublishHackathonDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={() => publishMutation.mutate()}
        isPublishing={publishMutation.isPending}
        hackathonName={generalData.name || hackathon?.name || 'Hackathon'}
        isReady={isReadyToPublish}
      />
    </div>
  );
};
