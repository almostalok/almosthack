'use client';

import React from 'react';
import { Card, Button } from '@almosthack/ui';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Rocket,
  Save,
  Building2,
  Calendar,
  Users,
  Layers,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { StepBasicInfoData } from './StepBasicInfo';
import { StepScheduleData } from './StepSchedule';
import { StepParticipationData } from './StepParticipation';
import { StepTeamSettingsData } from './StepTeamSettings';
import { TrackItem } from './StepTracks';
import { StepJudgingData } from './StepJudging';

export interface StepReviewLaunchProps {
  basicInfo: StepBasicInfoData;
  schedule: StepScheduleData;
  participation: StepParticipationData;
  teams: StepTeamSettingsData;
  tracks: TrackItem[];
  judging: StepJudgingData;
  organizationName: string;
  onJumpToStep: (stepId: number) => void;
  onSaveDraft: () => void;
  onLaunch: () => void;
  isSubmitting: boolean;
}

export const StepReviewLaunch: React.FC<StepReviewLaunchProps> = ({
  basicInfo,
  schedule,
  participation,
  teams,
  tracks,
  judging,
  organizationName,
  onJumpToStep,
  onSaveDraft,
  onLaunch,
  isSubmitting,
}) => {
  // Compute checklist items
  const isNameValid = basicInfo.name.trim().length >= 2;
  const isScheduleValid =
    schedule.registrationStartsAt &&
    schedule.registrationEndsAt &&
    schedule.startsAt &&
    schedule.endsAt &&
    new Date(schedule.registrationStartsAt).getTime() < new Date(schedule.registrationEndsAt).getTime() &&
    new Date(schedule.registrationEndsAt).getTime() <= new Date(schedule.startsAt).getTime() &&
    new Date(schedule.startsAt).getTime() < new Date(schedule.endsAt).getTime();

  const isTracksValid = tracks.length > 0;
  const totalWeight = judging.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isJudgingValid = judging.criteria.length > 0 && totalWeight === 100;

  const checklist = [
    {
      id: 1,
      title: 'Basic Information & Identity',
      summary: `${basicInfo.name || 'Unnamed Hackathon'} · ${organizationName}`,
      valid: isNameValid,
      missingMsg: 'Event name is required (min 2 chars).',
      icon: Building2,
    },
    {
      id: 2,
      title: 'Schedule & Timezone Sequence',
      summary: `${schedule.timezone} · Registration & Hacking windows`,
      valid: isScheduleValid,
      missingMsg: 'Dates must be configured in chronological sequence.',
      icon: Calendar,
    },
    {
      id: 3,
      title: 'Eligibility & Scope',
      summary: `${participation.eligibilityType} participation policy`,
      valid: true,
      missingMsg: '',
      icon: ShieldCheck,
    },
    {
      id: 4,
      title: 'Team Formation Sizing',
      summary:
        teams.participationMode === 'INDIVIDUAL'
          ? 'Solo builders only'
          : `Teams of ${teams.minTeamSize}–${teams.maxTeamSize} builders`,
      valid: true,
      missingMsg: '',
      icon: Users,
    },
    {
      id: 5,
      title: 'Tracks & Challenge Categories',
      summary: `${tracks.length} ${tracks.length === 1 ? 'Track' : 'Tracks'} configured`,
      valid: isTracksValid,
      missingMsg: 'At least one prize track is recommended.',
      icon: Layers,
    },
    {
      id: 6,
      title: 'Double-Blind Judging Rubrics',
      summary: `${judging.criteria.length} criteria · Total weight: ${totalWeight}%`,
      valid: isJudgingValid,
      missingMsg: 'Rubric criteria weights must total exactly 100%.',
      icon: Scale,
    },
  ];

  const allValid = isNameValid && isScheduleValid && isTracksValid && isJudgingValid;
  const invalidCount = checklist.filter((item) => !item.valid).length;

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#171914]">
              Step 7: Pre-Flight Checklist & Readiness
            </h2>
            <p className="text-xs text-[#6D7068] font-body mt-0.5">
              Review operational setup before persisting draft state or publishing to live discovery.
            </p>
          </div>

          <span
            className={`self-start sm:self-auto px-3 py-1 rounded-[6px] text-xs font-mono font-bold border ${
              allValid
                ? 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]'
                : 'bg-[#FFF4DC] text-[#785A12] border-[#F0D597]'
            }`}
          >
            {allValid ? '✓ READY TO LAUNCH' : `⚠ ${invalidCount} ITEMS NEED ATTENTION`}
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {checklist.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-[8px] border transition-colors flex items-center justify-between gap-3 ${
                item.valid
                  ? 'bg-[#FFFDF8] border-[#DCDDD3] hover:border-[#B8CEB0]'
                  : 'bg-[#FBE6E3]/50 border-[#F3C9B2]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 ${
                    item.valid
                      ? 'bg-[#E2EBDD] text-[#028051]'
                      : 'bg-[#FBE6E3] text-[#8B2C24]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-heading font-bold text-[#171914]">
                      {item.title}
                    </span>
                    {item.valid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#028051] shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[#8B2C24] bg-[#FBE6E3] px-1.5 py-0.2 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-body text-[#6D7068] truncate">
                    {item.valid ? item.summary : item.missingMsg}
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onJumpToStep(item.id)}
                className="text-xs font-mono py-1 px-2.5 h-7 shrink-0 text-[#6D7068] hover:text-[#171914]"
              >
                <span>Edit</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#DCDDD3] flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={onSaveDraft}
          disabled={!isNameValid || isSubmitting}
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4 text-[#6D7068]" />}
          className="w-full sm:w-auto text-xs font-mono h-9 px-4"
        >
          Save as Draft
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onLaunch}
          disabled={!allValid || isSubmitting}
          isLoading={isSubmitting}
          leftIcon={<Rocket className="w-4 h-4" />}
          className="w-full sm:w-auto text-xs font-mono h-9 px-5 bg-[#028051] hover:bg-[#355C45] shadow-xs"
        >
          Publish Hackathon
        </Button>
      </div>
    </Card>
  );
};
