'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button, Breadcrumbs } from '@almosthack/ui';
import {
  Award,
  ArrowLeft,
  RotateCw,
  FileCode2,
  ChevronDown,
} from 'lucide-react';
import { useTransparentJudging } from './use-transparent-judging';
import { ParticipantPreviewBanner } from './ParticipantPreviewBanner';
import { ScoreSummaryCard } from './ScoreSummaryCard';
import { CriteriaBreakdownLedger } from './CriteriaBreakdownLedger';
import { JudgingFeedbackSection } from './JudgingFeedbackSection';
import { EvaluationTimeline } from './EvaluationTimeline';
import { TransparencyGuaranteesCard } from './TransparencyGuaranteesCard';

export interface TransparentJudgingViewProps {
  hackathonId: string;
  submissionId?: string;
  initialViewMode?: 'PARTICIPANT' | 'ORGANIZER_AUDIT';
}

export const TransparentJudgingView: React.FC<TransparentJudgingViewProps> = ({
  hackathonId,
  submissionId,
  initialViewMode = 'PARTICIPANT',
}) => {
  const router = useRouter();

  // Fetch hackathon identity
  const { data: hackathon } = useQuery({
    queryKey: ['hackathon', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathon(hackathonId);
      } catch {
        return {
          id: hackathonId,
          name: 'Hack The Future 2026',
          slug: 'hack-the-future-2026',
          status: 'PUBLISHED',
        };
      }
    },
  });

  const {
    viewMode,
    toggleViewMode,
    isParticipantPreview,
    activeSubmissionId,
    setActiveSubmissionId,
    allSubmissions,
    submission,
    isLoading,
  } = useTransparentJudging({
    hackathonId,
    initialSubmissionId: submissionId,
    initialViewMode,
  });

  const breadcrumbs = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon?.name || 'Workspace', href: `/hackathons/${hackathonId}` },
    { label: 'Judging', href: `/hackathons/${hackathonId}/judging` },
    { label: 'Transparent Judging', active: true },
  ];

  return (
    <div
      className="space-y-6 max-w-5xl mx-auto text-left"
      role="region"
      aria-label="Transparent Judging Ledger"
    >
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 pb-3 border-b border-[#DCDDD3]">
        <Breadcrumbs items={breadcrumbs} className="text-xs" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171914] tracking-tight truncate">
                Transparent Evaluation Ledger
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E2EBDD] text-[#028051] px-2.5 py-0.5 rounded-[6px] border border-[#B8CEB0]">
                Verified Consensus
              </span>
            </div>
            <p className="text-xs text-[#6D7068] font-body">
              Auditable evaluation trace and normalized rubric breakdown for project submissions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Project Submission Selector (for multi-submission browsing) */}
            <div className="relative">
              <select
                value={activeSubmissionId}
                onChange={(e) => setActiveSubmissionId(e.target.value)}
                className="bg-[#FFFDF8] border border-[#DCDDD3] rounded-[6px] py-1.5 pl-3 pr-7 text-xs font-mono text-[#171914] focus:outline-none focus:border-[#028051] cursor-pointer"
              >
                {allSubmissions.map((s) => (
                  <option key={s.submissionId} value={s.submissionId}>
                    {s.projectTitle} ({s.teamName})
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/hackathons/${hackathonId}/judging`)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-mono h-8"
            >
              Judging Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Participant Preview Mode Notice Banner */}
      <ParticipantPreviewBanner
        isParticipantPreview={isParticipantPreview}
        onToggleViewMode={toggleViewMode}
      />

      {/* Hero Score Summary Card */}
      <ScoreSummaryCard submission={submission} />

      {/* Criteria Breakdown Ledger */}
      <CriteriaBreakdownLedger
        criteria={submission.criteriaBreakdown}
        finalScore={submission.finalScore}
        maxScore={submission.maxScore}
      />

      {/* Evaluator Qualitative Feedback */}
      <JudgingFeedbackSection
        feedbackList={submission.feedbackList}
        isPublished={submission.isPublished}
      />

      {/* Evaluation Lifecycle Timeline */}
      <EvaluationTimeline timeline={submission.timeline} />

      {/* Trust & Transparency Guarantees */}
      <TransparencyGuaranteesCard />
    </div>
  );
};
