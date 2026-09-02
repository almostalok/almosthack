'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users2,
  FileCode2,
  Scale,
  Award,
  Megaphone,
  Stamp,
  ShieldCheck,
  Send,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@almosthack/ui';
import { useHackerWorkspace } from './use-hacker-workspace';
import { HackerHeroCommandCenter } from './HackerHeroCommandCenter';
import { HackerProgressMilestones } from './HackerProgressMilestones';
import { HackerTeamWorkspace } from './HackerTeamWorkspace';
import { HackerRepositoryCard } from './HackerRepositoryCard';
import { HackerSubmissionWorkspace } from './HackerSubmissionWorkspace';
import { HackerJudgingVisibility } from './HackerJudgingVisibility';
import { HackerResultsAndAwards } from './HackerResultsAndAwards';
import { HackerAnnouncementsCard } from './HackerAnnouncementsCard';

export interface HackerDashboardViewProps {
  hackathonId?: string;
  initialTab?: 'overview' | 'team' | 'submission' | 'judging' | 'results' | 'certificates' | 'announcements';
}

export const HackerDashboardView: React.FC<HackerDashboardViewProps> = ({
  hackathonId,
  initialTab = 'overview',
}) => {
  const {
    hackathons,
    activeHackathon,
    setActiveHackathonId,
    team,
    incomingInvitations,
    submission,
    announcements,
    certificates,
    submissionForm,
    setSubmissionForm,
    submissionChecklist,
    milestones,
    nextAction,
    activeTab,
    setActiveTab,
    isSubmitConfirmOpen,
    setIsSubmitConfirmOpen,
    submissionSuccessMessage,
    actionError,
    saveDraftMutation,
    finalizeSubmissionMutation,
    acceptInvitationMutation,
    declineInvitationMutation,
  } = useHackerWorkspace({ initialHackathonId: hackathonId });

  // Handle Next Action trigger click
  const handleTriggerNextAction = () => {
    switch (nextAction.actionTarget) {
      case 'team':
        setActiveTab('team');
        break;
      case 'submission':
        setActiveTab('submission');
        break;
      case 'judging':
        setActiveTab('judging');
        break;
      case 'results':
      case 'certificates':
        setActiveTab('results');
        break;
      default:
        setActiveTab('overview');
        break;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    {
      id: 'team',
      label: 'My Team',
      icon: Users2,
      badge: incomingInvitations.length > 0 ? String(incomingInvitations.length) : undefined,
    },
    {
      id: 'submission',
      label: 'My Submission',
      icon: FileCode2,
      badge: submission?.status === 'SUBMITTED' ? '✓' : `${submissionChecklist.completionPercent}%`,
    },
    { id: 'judging', label: 'Judging & Rubrics', icon: Scale },
    { id: 'results', label: 'Results & Certificates', icon: Award },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Hacker Workspace Portal"
    >
      {/* Hero Command Center Banner */}
      <HackerHeroCommandCenter
        activeHackathon={activeHackathon}
        hackathons={hackathons}
        onSelectHackathon={setActiveHackathonId}
        nextAction={nextAction}
        onTriggerNextAction={handleTriggerNextAction}
      />

      {/* Progress Milestone Barometer */}
      <HackerProgressMilestones milestones={milestones} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#DCDDD3] pb-1 text-xs font-mono font-bold">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-[6px] transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#028051] text-white shadow-xs'
                  : 'bg-[#FFFDF8] border border-[#DCDDD3] text-[#6D7068] hover:text-[#171914]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#E2EBDD] text-[#028051] border border-[#B8CEB0]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Content Views */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Primary Column */}
          <div className="lg:col-span-8 space-y-6">
            <HackerSubmissionWorkspace
              submission={submission ?? null}
              formState={submissionForm}
              onChangeForm={(updates) =>
                setSubmissionForm((prev) => ({ ...prev, ...updates }))
              }
              checklist={submissionChecklist}
              isSavingDraft={saveDraftMutation.isPending}
              isSubmitting={finalizeSubmissionMutation.isPending}
              onSaveDraft={() => saveDraftMutation.mutate()}
              onSubmitFinal={() => setIsSubmitConfirmOpen(true)}
              successMessage={submissionSuccessMessage}
              actionError={actionError}
            />

            <HackerRepositoryCard
              repositoryUrl={submission?.repository?.repositoryUrl}
              repositoryFullName={submission?.repository?.repositoryFullName}
              defaultBranch={submission?.repository?.defaultBranch}
              commitSha={submission?.commitSha || undefined}
            />
          </div>

          {/* Right / Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <HackerTeamWorkspace
              team={team ?? null}
              incomingInvitations={incomingInvitations}
              onAcceptInvitation={async (id) => {
                await acceptInvitationMutation.mutateAsync(id);
              }}
              onDeclineInvitation={async (id) => {
                await declineInvitationMutation.mutateAsync(id);
              }}
              isAccepting={acceptInvitationMutation.isPending}
              isDeclining={declineInvitationMutation.isPending}
            />

            <HackerAnnouncementsCard announcements={announcements} />
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <HackerTeamWorkspace
          team={team ?? null}
          incomingInvitations={incomingInvitations}
          onAcceptInvitation={async (id) => {
            await acceptInvitationMutation.mutateAsync(id);
          }}
          onDeclineInvitation={async (id) => {
            await declineInvitationMutation.mutateAsync(id);
          }}
          isAccepting={acceptInvitationMutation.isPending}
          isDeclining={declineInvitationMutation.isPending}
        />
      )}

      {activeTab === 'submission' && (
        <div className="space-y-6">
          <HackerSubmissionWorkspace
            submission={submission ?? null}
            formState={submissionForm}
            onChangeForm={(updates) =>
              setSubmissionForm((prev) => ({ ...prev, ...updates }))
            }
            checklist={submissionChecklist}
            isSavingDraft={saveDraftMutation.isPending}
            isSubmitting={finalizeSubmissionMutation.isPending}
            onSaveDraft={() => saveDraftMutation.mutate()}
            onSubmitFinal={() => setIsSubmitConfirmOpen(true)}
            successMessage={submissionSuccessMessage}
            actionError={actionError}
          />

          <HackerRepositoryCard
            repositoryUrl={submission?.repository?.repositoryUrl}
            repositoryFullName={submission?.repository?.repositoryFullName}
            defaultBranch={submission?.repository?.defaultBranch}
            commitSha={submission?.commitSha || undefined}
          />
        </div>
      )}

      {activeTab === 'judging' && (
        <HackerJudgingVisibility
          isJudgingActive={activeHackathon.status === 'LIVE' || activeHackathon.status === 'COMPLETED'}
          isResultsPublished={milestones.results === 'PUBLISHED'}
        />
      )}

      {activeTab === 'results' && (
        <HackerResultsAndAwards
          isPublished={milestones.results === 'PUBLISHED'}
          certificates={certificates}
        />
      )}

      {activeTab === 'announcements' && (
        <HackerAnnouncementsCard announcements={announcements} />
      )}

      {/* Consequential Final Submission Confirmation Dialog */}
      {isSubmitConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-dialog-title"
        >
          <div className="w-full max-w-lg bg-[#FFFDF8] border border-[#DCDDD3] rounded-[12px] shadow-2xl p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
              <div className="flex items-center gap-2 text-[#028051]">
                <Send className="w-5 h-5" />
                <h3
                  id="submit-dialog-title"
                  className="font-heading font-extrabold text-base text-[#171914]"
                >
                  Confirm Final Project Submission
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="p-1 text-[#6D7068] hover:text-[#171914] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-3.5 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-2 text-xs font-mono">
              <div className="font-heading font-extrabold text-sm text-[#171914]">
                {submissionForm.title}
              </div>
              <div className="text-[#6D7068]">
                Team: <strong className="text-[#171914]">{team?.name || 'My Squad'}</strong>
              </div>
              <div className="text-[#6D7068] truncate">
                Live Demo: <strong className="text-[#171914]">{submissionForm.demoUrl}</strong>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="p-3 rounded-[6px] bg-[#FFF4DC] border border-[#F0D597] text-xs font-mono text-[#785A12] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Submission Lock Notice:</strong> Submitting finalizes your project. After server confirmation, your submission will be locked and assigned to judges for evaluation.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD3]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="text-xs font-mono"
              >
                Back to Edit
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await finalizeSubmissionMutation.mutateAsync();
                }}
                isLoading={finalizeSubmissionMutation.isPending}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="text-xs font-mono font-bold"
              >
                Confirm & Submit Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
