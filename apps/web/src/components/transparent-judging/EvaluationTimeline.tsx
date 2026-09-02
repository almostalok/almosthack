'use client';

import React from 'react';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import { EvaluationTimelineStep } from './transparent-judging-types';

export interface EvaluationTimelineProps {
  timeline: EvaluationTimelineStep[];
}

export const EvaluationTimeline: React.FC<EvaluationTimelineProps> = ({
  timeline,
}) => {
  return (
    <div className="p-6 rounded-[12px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs text-left space-y-4">
      <div className="flex items-center gap-2 border-b border-[#DCDDD3] pb-3">
        <Clock className="w-4 h-4 text-[#028051]" />
        <div>
          <h3 className="text-sm font-heading font-extrabold text-[#171914] uppercase tracking-wider">
            Evaluation Lifecycle
          </h3>
          <p className="text-xs text-[#6D7068] font-body">
            Cryptographically audited consensus and scoring milestone trace.
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCDDD3]">
        {timeline.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';

          return (
            <div key={step.id} className="relative space-y-1">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isDone
                    ? 'bg-[#E2EBDD] text-[#028051]'
                    : isInProgress
                    ? 'bg-[#FFF4DC] text-[#D97706]'
                    : 'bg-[#EAE7DC] text-[#9A9C94]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3 fill-current" />
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span
                  className={`text-xs font-heading font-bold ${
                    isDone ? 'text-[#171914]' : 'text-[#6D7068]'
                  }`}
                >
                  {step.title}
                </span>
                {step.timestamp && (
                  <span className="text-[10px] font-mono text-[#6D7068]">
                    {new Date(step.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
