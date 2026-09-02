'use client';

import React from 'react';
import { MessageSquare, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';
import { ReviewerFeedbackItem } from './transparent-judging-types';

export interface JudgingFeedbackSectionProps {
  feedbackList: ReviewerFeedbackItem[];
  isPublished: boolean;
}

export const JudgingFeedbackSection: React.FC<JudgingFeedbackSectionProps> = ({
  feedbackList,
  isPublished,
}) => {
  if (!isPublished) {
    return (
      <div className="p-6 rounded-[12px] border border-dashed border-[#DCDDD3] bg-[#FFFDF8] text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-[#FFF4DC] text-[#D97706] flex items-center justify-center mx-auto">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-heading font-extrabold text-[#171914]">
          Feedback Pending Final Publication
        </h4>
        <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
          Evaluator comments will be unlocked once the organizer officially publishes results for this hackathon.
        </p>
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="p-6 rounded-[12px] border border-dashed border-[#DCDDD3] bg-[#FFFDF8] text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-[#EAE7DC] text-[#6D7068] flex items-center justify-center mx-auto">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-heading font-extrabold text-[#171914]">
          No Public Comments Published
        </h4>
        <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
          No qualitative feedback was published for this submission.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-[12px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs text-left space-y-4">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-sm font-heading font-extrabold text-[#171914] uppercase tracking-wider">
              Evaluator Feedback
            </h3>
            <p className="text-xs text-[#6D7068] font-body">
              Anonymized qualitative evaluations from verified track judges.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-[#028051] font-bold flex items-center gap-1 bg-[#E2EBDD] px-2 py-0.5 rounded border border-[#B8CEB0]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Double-Blind Verified
        </span>
      </div>

      <div className="space-y-4">
        {feedbackList.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-[10px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-3"
          >
            {/* Reviewer Header */}
            <div className="flex items-center justify-between border-b border-[#DCDDD3]/70 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-heading font-bold text-[#171914] block">
                    {item.reviewerDisplay}
                  </span>
                  {item.reviewerRole && (
                    <span className="text-[10px] font-mono text-[#6D7068] block">
                      {item.reviewerRole}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#6D7068]">
                {new Date(item.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* General Feedback */}
            {item.generalComment && (
              <p className="text-xs text-[#171914] font-body leading-relaxed">
                &ldquo;{item.generalComment}&rdquo;
              </p>
            )}

            {/* Criterion Specific Comments */}
            {item.criterionComments.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-[#DCDDD3]/50">
                {item.criterionComments.map((cc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-[6px] bg-[#FFFDF8] border border-[#DCDDD3] text-xs space-y-0.5"
                  >
                    <span className="text-[10px] font-mono font-bold uppercase text-[#028051]">
                      {cc.criterionName}
                    </span>
                    <p className="text-[11px] text-[#6D7068] font-body">
                      {cc.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
