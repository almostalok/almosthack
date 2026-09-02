'use client';

import React from 'react';
import {
  Scale,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sliders,
  MessageSquare,
} from 'lucide-react';

export interface HackerJudgingVisibilityProps {
  isJudgingActive: boolean;
  isResultsPublished: boolean;
  score?: number;
  rank?: number;
}

export const HackerJudgingVisibility: React.FC<HackerJudgingVisibilityProps> = ({
  isJudgingActive,
  isResultsPublished,
  score = 88.5,
  rank = 12,
}) => {
  const criteria = [
    {
      name: 'Technical Architecture & Execution',
      weight: '35%',
      maxScore: 10,
      description: 'Code quality, systems design, test coverage, and soundness of implementation.',
      score: isResultsPublished ? 9.0 : null,
      feedback: isResultsPublished ? 'Exceptional concurrency model with robust WASM execution.' : null,
    },
    {
      name: 'Novelty & Innovation',
      weight: '25%',
      maxScore: 10,
      description: 'Originality of idea, unique problem formulation, and creative technical execution.',
      score: isResultsPublished ? 8.5 : null,
      feedback: isResultsPublished ? 'Novel verifiable DAG topology.' : null,
    },
    {
      name: 'Real-World Impact & Utility',
      weight: '25%',
      maxScore: 10,
      description: 'Practical utility, commercial viability, scalability, and target market impact.',
      score: isResultsPublished ? 8.5 : null,
      feedback: isResultsPublished ? 'High direct utility for Layer 2 rollups.' : null,
    },
    {
      name: 'Design & User Experience',
      weight: '15%',
      maxScore: 10,
      description: 'Intuitive user interface, polish, accessibility, and documentation clarity.',
      score: isResultsPublished ? 8.0 : null,
      feedback: isResultsPublished ? 'Clean developer CLI tooling.' : null,
    },
  ];

  return (
    <div className="p-6 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD3] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#028051]" />
            <h3 className="font-heading font-extrabold text-base text-[#171914]">
              Transparent Judging & Rubrics
            </h3>
          </div>
          <p className="text-xs font-mono text-[#6D7068]">
            Authoritative evaluation criteria configured by hackathon organizers
          </p>
        </div>

        <div>
          {isResultsPublished ? (
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Evaluations Published
            </span>
          ) : isJudgingActive ? (
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FFF4DC] border border-[#F0D597] text-[#785A12]">
              <Clock className="w-3.5 h-3.5" />
              Judging Underway
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#F7F4EA] border border-[#DCDDD3] text-[#6D7068]">
              Awaiting Submissions
            </span>
          )}
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="space-y-3">
        {criteria.map((c, idx) => (
          <div
            key={idx}
            className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-2 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-heading font-extrabold text-xs text-[#171914]">
                  {c.name}
                </h4>
                <p className="text-[11px] font-body text-[#6D7068] mt-0.5">
                  {c.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[11px] text-[#6D7068] block">
                  Weight: <strong className="text-[#171914]">{c.weight}</strong>
                </span>
                {c.score !== null && (
                  <span className="font-heading font-extrabold text-xs text-[#028051] block mt-0.5">
                    {c.score} / {c.maxScore}
                  </span>
                )}
              </div>
            </div>

            {c.feedback && (
              <div className="p-2.5 rounded-[4px] bg-[#FFFDF8] border border-[#DCDDD3] text-[11px] font-body text-[#43463E] flex items-start gap-1.5 mt-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#028051] shrink-0 mt-0.5" />
                <span>{c.feedback}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
