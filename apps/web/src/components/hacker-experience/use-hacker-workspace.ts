'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../providers/auth-provider';
import {
  HackathonEntity,
  TeamEntity,
  SubmissionEntity,
  JudgingCriterionEntity,
  AnnouncementEntity,
  HackathonStatus,
} from '@almosthack/types';
import { CertificateItem } from '../certificates/certificates-types';
import {
  HackerNextAction,
  HackerMilestoneState,
  HackerSubmissionFormState,
} from './hacker-types';
import {
  MOCK_HACKER_HACKATHONS,
  MOCK_HACKER_TEAM,
  MOCK_INCOMING_INVITATIONS,
  MOCK_HACKER_SUBMISSION,
  MOCK_HACKER_ANNOUNCEMENTS,
  MOCK_HACKER_CERTIFICATES,
} from './hacker-mock-data';

export interface UseHackerWorkspaceOptions {
  initialHackathonId?: string;
}

export function useHackerWorkspace({
  initialHackathonId,
}: UseHackerWorkspaceOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeHackathonId, setActiveHackathonId] = useState<string>(
    initialHackathonId || ''
  );
  const [activeTab, setActiveTab] = useState<
    'overview' | 'team' | 'submission' | 'judging' | 'results' | 'certificates' | 'announcements'
  >('overview');

  // Fetch Hacker's Hackathons
  const {
    data: hackathons = [],
    isLoading: isLoadingHackathons,
  } = useQuery<HackathonEntity[]>({
    queryKey: ['hacker-hackathons'],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathons();
        if (Array.isArray(res) && res.length > 0) {
          return res;
        }
        return MOCK_HACKER_HACKATHONS;
      } catch {
        return MOCK_HACKER_HACKATHONS;
      }
    },
  });

  // Effective Active Hackathon
  const activeHackathon = useMemo(() => {
    if (activeHackathonId) {
      const found = hackathons.find((h) => h.id === activeHackathonId);
      if (found) return found;
    }
    return hackathons[0] || MOCK_HACKER_HACKATHONS[0];
  }, [hackathons, activeHackathonId]);

  useEffect(() => {
    if (!activeHackathonId && hackathons.length > 0) {
      setActiveHackathonId(hackathons[0].id);
    }
  }, [hackathons, activeHackathonId]);

  const effectiveHackathonId = activeHackathon?.id || 'htf-2026';

  // Fetch Hacker's Team in this Hackathon
  const {
    data: team = null,
    isLoading: isLoadingTeam,
    refetch: refetchTeam,
  } = useQuery<TeamEntity | null>({
    queryKey: ['hacker-my-team', effectiveHackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getMyTeam(effectiveHackathonId);
        if (res && res.id) {
          return res;
        }
        return MOCK_HACKER_TEAM;
      } catch {
        return MOCK_HACKER_TEAM;
      }
    },
    enabled: !!effectiveHackathonId,
  });

  // Fetch Pending Invitations for this Hackathon
  const {
    data: incomingInvitations = [],
    refetch: refetchInvitations,
  } = useQuery<any[]>({
    queryKey: ['hacker-team-invitations', effectiveHackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getMyTeamInvitations(effectiveHackathonId);
        if (Array.isArray(res)) {
          return res;
        }
        return MOCK_INCOMING_INVITATIONS;
      } catch {
        return MOCK_INCOMING_INVITATIONS;
      }
    },
    enabled: !!effectiveHackathonId,
  });

  // Fetch Team Submission Draft / Status
  const {
    data: submission = null,
    isLoading: isLoadingSubmission,
    refetch: refetchSubmission,
  } = useQuery<SubmissionEntity | null>({
    queryKey: ['hacker-team-submission', team?.id],
    queryFn: async () => {
      if (!team?.id) return null;
      try {
        const res = await apiClient.getTeamSubmission(team.id);
        if (res && res.id) {
          return res;
        }
        return MOCK_HACKER_SUBMISSION;
      } catch {
        return MOCK_HACKER_SUBMISSION;
      }
    },
    enabled: !!team?.id,
  });

  // Fetch Hackathon Announcements
  const { data: announcements = [] } = useQuery<AnnouncementEntity[]>({
    queryKey: ['hacker-announcements', effectiveHackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonAnnouncements(effectiveHackathonId);
        if (Array.isArray(res) && res.length > 0) {
          return res;
        }
        return MOCK_HACKER_ANNOUNCEMENTS;
      } catch {
        return MOCK_HACKER_ANNOUNCEMENTS;
      }
    },
    enabled: !!effectiveHackathonId,
  });

  // Fetch User Certificates
  const { data: certificates = [] } = useQuery<CertificateItem[]>({
    queryKey: ['hacker-certificates', user?.id],
    queryFn: async () => {
      if (!user?.id) return MOCK_HACKER_CERTIFICATES;
      try {
        const res = await apiClient.getUserCertificates(user.id);
        if (Array.isArray(res) && res.length > 0) {
          return res;
        }
        return MOCK_HACKER_CERTIFICATES;
      } catch {
        return MOCK_HACKER_CERTIFICATES;
      }
    },
  });

  // Submission Form State
  const [submissionForm, setSubmissionForm] = useState<HackerSubmissionFormState>({
    title: '',
    description: '',
    trackId: '',
    demoUrl: '',
    videoUrl: '',
    repositoryUrl: '',
  });
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [submissionSuccessMessage, setSubmissionSuccessMessage] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Sync submission form when submission data loads
  useEffect(() => {
    if (submission) {
      setSubmissionForm({
        title: submission.title || '',
        description: submission.description || '',
        trackId: submission.trackId || '',
        demoUrl: submission.demoUrl || '',
        videoUrl: '',
        repositoryUrl: submission.repository?.repositoryUrl || '',
      });
    }
  }, [submission]);

  // Submission required fields checklist calculation
  const submissionChecklist = useMemo(() => {
    const checks = [
      { id: 'title', label: 'Project Name', isComplete: !!submissionForm.title.trim() },
      { id: 'description', label: 'Project Description', isComplete: submissionForm.description.trim().length >= 20 },
      { id: 'track', label: 'Track Selected', isComplete: !!submissionForm.trackId },
      { id: 'repo', label: 'Repository Connected', isComplete: !!(submissionForm.repositoryUrl || submission?.repository?.repositoryUrl) },
      { id: 'demo', label: 'Live Demo URL', isComplete: !!submissionForm.demoUrl.trim() },
      { id: 'commit', label: 'Deterministic Commit SHA', isComplete: !!submission?.commitSha },
    ];

    const completedItems = checks.filter((c) => c.isComplete).length;
    const totalItems = checks.length;
    const completionPercent = Math.round((completedItems / totalItems) * 100);

    return {
      checks,
      completedItems,
      totalItems,
      completionPercent,
      isReadyToSubmit: completedItems === totalItems,
    };
  }, [submissionForm, submission]);

  // Milestone Progress State Engine
  const milestones: HackerMilestoneState = useMemo(() => {
    const isRegistered = !!activeHackathon;
    const isTeamFormed = !!team && (team.memberCount || 0) > 0;
    const isRepoConnected = !!(submission?.repository || team?.members);
    const submissionStatus = submission?.status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT';
    const isJudging = activeHackathon?.status === HackathonStatus.COMPLETED || submission?.status === 'SUBMITTED';
    const isResultsPublished = activeHackathon?.status === HackathonStatus.COMPLETED;
    const certificateIssued = certificates.some((c) => c.hackathonId === effectiveHackathonId);

    return {
      registration: isRegistered ? 'COMPLETED' : 'PENDING',
      team: isTeamFormed ? 'COMPLETED' : 'PENDING',
      repository: isRepoConnected ? 'COMPLETED' : 'PENDING',
      submission: {
        status: submissionStatus,
        completionPercent: submissionStatus === 'SUBMITTED' ? 100 : submissionChecklist.completionPercent,
        completedItems: submissionStatus === 'SUBMITTED' ? submissionChecklist.totalItems : submissionChecklist.completedItems,
        totalItems: submissionChecklist.totalItems,
      },
      judging: isJudging ? (isResultsPublished ? 'COMPLETED' : 'IN_PROGRESS') : 'NOT_STARTED',
      results: isResultsPublished ? 'PUBLISHED' : 'UNPUBLISHED',
      certificate: certificateIssued ? 'ISSUED' : (isResultsPublished ? 'ELIGIBLE' : 'NONE'),
    };
  }, [activeHackathon, team, submission, submissionChecklist, certificates, effectiveHackathonId]);

  // Next Action Engine
  const nextAction: HackerNextAction = useMemo(() => {
    // 1. Check registration
    if (!activeHackathon) {
      return {
        type: 'COMPLETE_REGISTRATION',
        title: 'Complete Your Registration',
        description: 'You are not yet registered for this hackathon. Confirm participation to start.',
        actionLabel: 'Register Now',
        actionTarget: 'registration',
        priority: 'URGENT',
      };
    }

    // 2. Check team
    if (!team) {
      return {
        type: 'CREATE_OR_JOIN_TEAM',
        title: 'Form or Join a Team',
        description: 'Create your squad or accept an invite to collaborate and submit.',
        actionLabel: 'Open Team Workspace',
        actionTarget: 'team',
        priority: 'HIGH',
      };
    }

    // 3. Check repository
    if (!submission?.repository && !team.description) {
      return {
        type: 'CONNECT_REPOSITORY',
        title: 'Connect GitHub Repository',
        description: 'Link your GitHub repo to enable automatic commit SHA verification and integrity scans.',
        actionLabel: 'Connect Repository',
        actionTarget: 'submission',
        priority: 'HIGH',
      };
    }

    // 4. Check submission status
    if (submission?.status !== 'SUBMITTED') {
      if (submissionChecklist.isReadyToSubmit) {
        return {
          type: 'SUBMIT_PROJECT',
          title: 'Ready for Final Submission',
          description: 'All 6 required fields are complete. Review and finalize before the deadline!',
          actionLabel: 'Review & Submit Project',
          actionTarget: 'submission',
          progressPercent: 100,
          priority: 'URGENT',
        };
      }

      return {
        type: 'COMPLETE_SUBMISSION',
        title: 'Complete Your Submission',
        description: `${submissionChecklist.completedItems} of ${submissionChecklist.totalItems} requirements complete. Keep building!`,
        actionLabel: 'Continue Submission',
        actionTarget: 'submission',
        progressPercent: submissionChecklist.completionPercent,
        priority: 'NORMAL',
      };
    }

    // 5. Results & Certificates
    if (milestones.results === 'PUBLISHED') {
      return {
        type: 'VIEW_RESULTS',
        title: 'Official Results Published!',
        description: 'Rankings and awards have been published by the organizers. Check your placement!',
        actionLabel: 'View Official Results',
        actionTarget: 'results',
        priority: 'HIGH',
      };
    }

    // 6. Default: Awaiting judging
    return {
      type: 'AWAIT_JUDGING',
      title: 'Submission Received · In Evaluation',
      description: 'Your project is locked and being reviewed by the judging panel. Watch for announcements.',
      actionLabel: 'View Judging Status',
      actionTarget: 'judging',
      priority: 'NORMAL',
    };
  }, [activeHackathon, team, submission, submissionChecklist, milestones]);

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!team?.id) return;
      return apiClient.createOrUpdateSubmissionDraft(team.id, {
        title: submissionForm.title,
        description: submissionForm.description,
        trackId: submissionForm.trackId || undefined,
        demoUrl: submissionForm.demoUrl || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hacker-team-submission', team?.id] });
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to save submission draft');
    },
  });

  const finalizeSubmissionMutation = useMutation({
    mutationFn: async () => {
      if (!submission?.id) return;
      return apiClient.finalizeSubmission(submission.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hacker-team-submission', team?.id] });
      setIsSubmitConfirmOpen(false);
      setSubmissionSuccessMessage(
        `Project "${submissionForm.title}" submitted successfully on ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`
      );
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to finalize submission');
    },
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return apiClient.acceptTeamInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hacker-my-team', effectiveHackathonId] });
      queryClient.invalidateQueries({ queryKey: ['hacker-team-invitations', effectiveHackathonId] });
    },
  });

  const declineInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return apiClient.declineTeamInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hacker-team-invitations', effectiveHackathonId] });
    },
  });

  return {
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
    // Modals & Messages
    isSubmitConfirmOpen,
    setIsSubmitConfirmOpen,
    isInviteModalOpen,
    setIsInviteModalOpen,
    submissionSuccessMessage,
    setSubmissionSuccessMessage,
    actionError,
    // Mutations
    saveDraftMutation,
    finalizeSubmissionMutation,
    acceptInvitationMutation,
    declineInvitationMutation,
    isLoading: isLoadingHackathons || isLoadingTeam || isLoadingSubmission,
    refetchTeam,
    refetchSubmission,
  };
}
