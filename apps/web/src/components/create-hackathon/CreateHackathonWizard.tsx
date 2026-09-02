'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { WizardStepIndicator, StepItem } from './WizardStepIndicator';
import { StepBasicInfo, StepBasicInfoData } from './StepBasicInfo';
import { StepSchedule, StepScheduleData } from './StepSchedule';
import { StepParticipation, StepParticipationData } from './StepParticipation';
import { StepTeamSettings, StepTeamSettingsData } from './StepTeamSettings';
import { StepTracks, TrackItem } from './StepTracks';
import { StepJudging, StepJudgingData } from './StepJudging';
import { StepReviewLaunch } from './StepReviewLaunch';
import { Button } from '@almosthack/ui';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

const WIZARD_STEPS: StepItem[] = [
  { id: 1, title: 'Basics', description: 'Name & Identity' },
  { id: 2, title: 'Schedule', description: 'Phase Dates' },
  { id: 3, title: 'Eligibility', description: 'Participation' },
  { id: 4, title: 'Teams', description: 'Sizing Rules' },
  { id: 5, title: 'Tracks', description: 'Themes & Prizes' },
  { id: 6, title: 'Judging', description: 'Rubric Weights' },
  { id: 7, title: 'Launch', description: 'Review & Seal' },
];

export const CreateHackathonWizard: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState(1);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch user organizations
  const { data: rawOrgs = [] } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: async () => {
      try {
        const orgs = await apiClient.getUserOrganizations();
        return Array.isArray(orgs) ? orgs : [];
      } catch {
        return [{ id: 'org_default', name: 'AlmostHack Community Organization' }];
      }
    },
  });

  const organizations = React.useMemo(() => {
    return rawOrgs.length > 0
      ? rawOrgs.map((o: any) => ({ id: o.id, name: o.name }))
      : [{ id: 'org_default', name: 'AlmostHack Community Organization' }];
  }, [rawOrgs]);

  // Step 1: Basic info
  const [basicInfo, setBasicInfo] = useState<StepBasicInfoData>({
    name: '',
    slug: '',
    organizationId: organizations[0]?.id || '',
    description: '',
    format: 'ONLINE',
    location: '',
    timezone: 'UTC',
    websiteUrl: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (organizations.length > 0 && !basicInfo.organizationId) {
      setBasicInfo((prev) => ({ ...prev, organizationId: organizations[0].id }));
    }
  }, [organizations, basicInfo.organizationId]);

  // Step 2: Schedule
  const [schedule, setSchedule] = useState<StepScheduleData>({
    registrationStartsAt: '',
    registrationEndsAt: '',
    startsAt: '',
    endsAt: '',
    timezone: 'UTC',
  });

  // Sync timezone
  useEffect(() => {
    setSchedule((prev) => ({ ...prev, timezone: basicInfo.timezone }));
  }, [basicInfo.timezone]);

  // Step 3: Participation
  const [participation, setParticipation] = useState<StepParticipationData>({
    eligibilityType: 'OPEN',
    allowedBranchesText: '',
    allowedCollegesText: '',
    graduationYearFrom: '',
    graduationYearTo: '',
  });

  // Step 4: Teams
  const [teams, setTeams] = useState<StepTeamSettingsData>({
    participationMode: 'BOTH',
    minTeamSize: 1,
    maxTeamSize: 4,
  });

  // Step 5: Tracks
  const [tracks, setTracks] = useState<TrackItem[]>([
    {
      id: 'trk_1',
      name: 'Open Innovation / Systems',
      description: 'General track for all verified engineering submissions.',
      prizes: 25000,
    },
  ]);

  // Step 6: Judging
  const [judging, setJudging] = useState<StepJudgingData>({
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

  // Inline errors
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!basicInfo.name.trim() || basicInfo.name.trim().length < 2) {
        errors.name = 'Hackathon name is required (min 2 characters).';
      }
      if (!basicInfo.organizationId) {
        errors.organizationId = 'Please select a host organization.';
      }
    }

    if (step === 2) {
      if (!schedule.registrationStartsAt) {
        errors.registrationStartsAt = 'Registration start date is required.';
      }
      if (!schedule.registrationEndsAt) {
        errors.registrationEndsAt = 'Registration end date is required.';
      }
      if (!schedule.startsAt) {
        errors.startsAt = 'Hackathon start date is required.';
      }
      if (!schedule.endsAt) {
        errors.endsAt = 'Hackathon end date is required.';
      }
      if (
        schedule.registrationStartsAt &&
        schedule.registrationEndsAt &&
        new Date(schedule.registrationStartsAt).getTime() >= new Date(schedule.registrationEndsAt).getTime()
      ) {
        errors.registrationStartsAt = 'Registration start must be before registration end.';
      }
      if (
        schedule.registrationEndsAt &&
        schedule.startsAt &&
        new Date(schedule.registrationEndsAt).getTime() > new Date(schedule.startsAt).getTime()
      ) {
        errors.registrationEndsAt = 'Registration must end on or before hackathon start.';
      }
      if (
        schedule.startsAt &&
        schedule.endsAt &&
        new Date(schedule.startsAt).getTime() >= new Date(schedule.endsAt).getTime()
      ) {
        errors.startsAt = 'Hackathon start must be strictly before hackathon end.';
      }
    }

    if (step === 6) {
      const total = judging.criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
      if (total !== 100) {
        errors.judging = `Total criteria weights must equal 100% (currently ${total}%).`;
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setGlobalError(null);
      const nextStep = Math.min(7, currentStep + 1);
      setCurrentStep(nextStep);
      setMaxCompletedStep((prev) => Math.max(prev, currentStep));
    }
  };

  const handlePrev = () => {
    setGlobalError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= maxCompletedStep + 1) {
      setGlobalError(null);
      setCurrentStep(stepId);
    }
  };

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: async ({ shouldPublish }: { shouldPublish: boolean }) => {
      setGlobalError(null);

      // 1. Create hackathon
      const payload: any = {
        name: basicInfo.name.trim(),
        slug: basicInfo.slug.trim() || undefined,
        description: basicInfo.description.trim() || undefined,
        logoUrl: basicInfo.logoUrl.trim() || undefined,
        websiteUrl: basicInfo.websiteUrl.trim() || undefined,
        timezone: basicInfo.timezone,
        registrationStartsAt: schedule.registrationStartsAt || new Date().toISOString(),
        registrationEndsAt: schedule.registrationEndsAt || new Date(Date.now() + 86400000 * 7).toISOString(),
        startsAt: schedule.startsAt || new Date(Date.now() + 86400000 * 8).toISOString(),
        endsAt: schedule.endsAt || new Date(Date.now() + 86400000 * 14).toISOString(),
      };

      const orgId = basicInfo.organizationId || organizations[0]?.id || 'org_default';
      const createdHackathon = await apiClient.createHackathon<{ id: string; slug: string }>(
        orgId,
        payload
      );

      const hackathonId = createdHackathon?.id || `hack_${Date.now()}`;

      // 2. Save configuration policies
      try {
        const branches = participation.allowedBranchesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const colleges = participation.allowedCollegesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        await apiClient.updateHackathonConfiguration(hackathonId, {
          participationMode: teams.participationMode,
          minTeamSize: teams.participationMode === 'INDIVIDUAL' ? null : teams.minTeamSize,
          maxTeamSize: teams.participationMode === 'INDIVIDUAL' ? null : teams.maxTeamSize,
          eligibilityType: participation.eligibilityType,
          allowedBranches: branches,
          allowedColleges: colleges,
          graduationYearFrom: participation.graduationYearFrom ? Number(participation.graduationYearFrom) : null,
          graduationYearTo: participation.graduationYearTo ? Number(participation.graduationYearTo) : null,
          aiDisclosureRequired: judging.aiDisclosureRequired,
        });
      } catch (err) {
        console.warn('Configuration save note:', err);
      }

      // 3. Publish if requested
      if (shouldPublish) {
        try {
          await apiClient.publishHackathon(hackathonId);
        } catch (err) {
          console.warn('Publish note:', err);
        }
      }

      return { hackathonId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-hackathon'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-overview'] });
      router.push(`/hackathons/${data.hackathonId}`);
    },
    onError: (err: any) => {
      setGlobalError(err?.message || 'Failed to create hackathon. Please check your form parameters.');
    },
  });

  const selectedOrgName =
    organizations.find((o) => o.id === basicInfo.organizationId)?.name ||
    'AlmostHack Community';

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left" role="region" aria-label="Create Hackathon Wizard">
      {/* Top Breadcrumb & Step Stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight">
              Create New Hackathon
            </h1>
            <p className="text-xs text-[#6D7068] font-body mt-0.5">
              Launch a verifiable hackathon with calibrated double-blind scoring in 7 guided steps.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/hackathons')}
            className="text-xs font-mono h-8"
          >
            Exit Setup
          </Button>
        </div>

        <WizardStepIndicator
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          maxCompletedStep={maxCompletedStep}
        />
      </div>

      {globalError && (
        <div className="p-3.5 bg-[#FBE6E3] border border-[#F3C9B2] rounded-[8px] flex items-center gap-2.5 text-xs font-mono text-[#8B2C24]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#8B2C24]" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Step Components */}
      <div>
        {currentStep === 1 && (
          <StepBasicInfo
            data={basicInfo}
            onChange={(d) => setBasicInfo((prev) => ({ ...prev, ...d }))}
            organizations={organizations}
            errors={stepErrors}
          />
        )}

        {currentStep === 2 && (
          <StepSchedule
            data={schedule}
            onChange={(d) => setSchedule((prev) => ({ ...prev, ...d }))}
            errors={stepErrors}
          />
        )}

        {currentStep === 3 && (
          <StepParticipation
            data={participation}
            onChange={(d) => setParticipation((prev) => ({ ...prev, ...d }))}
            errors={stepErrors}
          />
        )}

        {currentStep === 4 && (
          <StepTeamSettings
            data={teams}
            onChange={(d) => setTeams((prev) => ({ ...prev, ...d }))}
            errors={stepErrors}
          />
        )}

        {currentStep === 5 && (
          <StepTracks
            tracks={tracks}
            onChange={(t) => setTracks(t)}
            errors={stepErrors}
          />
        )}

        {currentStep === 6 && (
          <StepJudging
            data={judging}
            onChange={(d) => setJudging((prev) => ({ ...prev, ...d }))}
            errors={stepErrors}
          />
        )}

        {currentStep === 7 && (
          <StepReviewLaunch
            basicInfo={basicInfo}
            schedule={schedule}
            participation={participation}
            teams={teams}
            tracks={tracks}
            judging={judging}
            organizationName={selectedOrgName}
            onJumpToStep={(id) => setCurrentStep(id)}
            onSaveDraft={() => createMutation.mutate({ shouldPublish: false })}
            onLaunch={() => createMutation.mutate({ shouldPublish: true })}
            isSubmitting={createMutation.isPending}
          />
        )}
      </div>

      {/* Navigation Footer Controls (For Steps 1-6) */}
      {currentStep < 7 && (
        <div className="flex items-center justify-between pt-2 border-t border-[#DCDDD3]">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrev}
            disabled={currentStep === 1}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs font-mono h-9 px-4"
          >
            Previous
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="text-xs font-mono h-9 px-5 bg-[#028051] hover:bg-[#355C45]"
          >
            Continue to {WIZARD_STEPS[currentStep]?.title || 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
};
