'use client';

import React from 'react';
import { useJudgeWorkspace } from './use-judge-workspace';
import { JudgeHeader } from './JudgeHeader';
import { JudgeSummaryCards } from './JudgeSummaryCards';
import { JudgeAssignmentList } from './JudgeAssignmentList';
import { JudgeSubmissionReview } from './JudgeSubmissionReview';
import { JudgeEvaluationPanel } from './JudgeEvaluationPanel';
import { JudgeConflictModal } from './JudgeConflictModal';
import { JudgeSubmitConfirmModal } from './JudgeSubmitConfirmModal';

export interface JudgeWorkspaceViewProps {
  hackathonId?: string;
}

export const JudgeWorkspaceView: React.FC<JudgeWorkspaceViewProps> = ({
  hackathonId,
}) => {
  const {
    assignments,
    filteredAssignments,
    activeAssignment,
    setActiveAssignmentId,
    criteria,
    metrics,
    filters,
    setFilters,
    scoresMap,
    generalFeedback,
    setGeneralFeedback,
    handleScoreChange,
    handleCommentChange,
    calculatedTotalPercent,
    // Modals
    isConflictModalOpen,
    setIsConflictModalOpen,
    isSubmitConfirmOpen,
    setIsSubmitConfirmOpen,
    actionError,
    // Mutations
    saveDraftMutation,
    submitEvaluationMutation,
    declareConflictMutation,
  } = useJudgeWorkspace({ hackathonId });

  const handleContinueNext = () => {
    const nextPending = assignments.find((a) => a.status !== 'COMPLETED');
    if (nextPending) {
      setActiveAssignmentId(nextPending.id);
    }
  };

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto text-left"
      role="region"
      aria-label="Judge Evaluation Workstation"
    >
      {/* Header & Progress Barometer */}
      <JudgeHeader
        metrics={metrics}
        onContinueNext={handleContinueNext}
      />

      {/* Summary KPI Cards */}
      <JudgeSummaryCards metrics={metrics} />

      {/* Main Split Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Assignment List Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <JudgeAssignmentList
            assignments={filteredAssignments}
            activeAssignmentId={activeAssignment?.id || ''}
            onSelectAssignment={setActiveAssignmentId}
            filters={filters}
            onUpdateFilters={(updates) =>
              setFilters((prev) => ({ ...prev, ...updates }))
            }
          />
        </div>

        {/* Right / Center: Active Submission Context & Evaluation Panel */}
        <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {activeAssignment ? (
            <>
              {/* Project Review */}
              <div className="xl:col-span-7">
                <JudgeSubmissionReview
                  assignment={activeAssignment}
                  onDeclareConflict={() => setIsConflictModalOpen(true)}
                />
              </div>

              {/* Evaluation Panel */}
              <div className="xl:col-span-5">
                <JudgeEvaluationPanel
                  criteria={criteria}
                  scoresMap={scoresMap}
                  onScoreChange={handleScoreChange}
                  onCommentChange={handleCommentChange}
                  generalFeedback={generalFeedback}
                  onGeneralFeedbackChange={setGeneralFeedback}
                  calculatedTotalPercent={calculatedTotalPercent}
                  isSubmitting={submitEvaluationMutation.isPending}
                  isSavingDraft={saveDraftMutation.isPending}
                  onSaveDraft={() => saveDraftMutation.mutate()}
                  onSubmitEvaluation={() => setIsSubmitConfirmOpen(true)}
                  isEvaluated={activeAssignment.evaluation?.status === 'SUBMITTED'}
                  actionError={actionError}
                />
              </div>
            </>
          ) : (
            <div className="col-span-12 p-12 text-center rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-2">
              <h3 className="font-heading font-extrabold text-sm text-[#171914]">
                No Active Assignment Selected
              </h3>
              <p className="text-xs font-mono text-[#6D7068]">
                Select a submission from the sidebar to begin your rubric review.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conflict Modal */}
      <JudgeConflictModal
        isOpen={isConflictModalOpen}
        assignment={activeAssignment}
        onClose={() => setIsConflictModalOpen(false)}
        onConfirm={async (reason) => {
          await declareConflictMutation.mutateAsync(reason);
        }}
        isSubmitting={declareConflictMutation.isPending}
      />

      {/* Submit Confirmation Modal */}
      <JudgeSubmitConfirmModal
        isOpen={isSubmitConfirmOpen}
        assignment={activeAssignment}
        criteria={criteria}
        scoresMap={scoresMap}
        calculatedTotalPercent={calculatedTotalPercent}
        generalFeedback={generalFeedback}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={async () => {
          await submitEvaluationMutation.mutateAsync();
        }}
        isSubmitting={submitEvaluationMutation.isPending}
      />
    </div>
  );
};
