'use client';

import React from 'react';
import { Eye, CheckCircle2, Award, FileCode2 } from 'lucide-react';
import { EvaluationItem } from './judging-types';

export interface EvaluationsTableProps {
  evaluations: EvaluationItem[];
  onViewDetails: (evaluation: EvaluationItem) => void;
}

export const EvaluationsTable: React.FC<EvaluationsTableProps> = ({
  evaluations,
  onViewDetails,
}) => {
  if (evaluations.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FFFDF8] rounded-[12px] border border-dashed border-[#DCDDD3] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] text-[#6D7068] flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-extrabold text-[#171914]">
            No Evaluations Submitted Yet
          </h3>
          <p className="text-xs text-[#6D7068] font-body max-w-sm mx-auto">
            Completed evaluations by judges will appear here in real-time as scoring proceeds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-body text-[#171914]">
          <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Project & Team</th>
              <th className="px-4 py-3">Judge</th>
              <th className="px-4 py-3">Score Breakdown</th>
              <th className="px-4 py-3">Total Score</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDDD3]/70">
            {evaluations.map((evalItem) => (
              <tr
                key={evalItem.id}
                className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
              >
                {/* Project & Team */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[5px] bg-[#E2EBDD] text-[#028051] flex items-center justify-center shrink-0">
                      <FileCode2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-[#171914] block truncate">
                        {evalItem.projectTitle}
                      </span>
                      <span className="text-[11px] font-body text-[#6D7068] block truncate">
                        Team: {evalItem.teamName}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Judge */}
                <td className="px-4 py-3.5 font-mono text-xs text-[#171914]">
                  {evalItem.judgeName}
                </td>

                {/* Score Breakdown */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {evalItem.criterionScores.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F7F4EA] border border-[#DCDDD3]"
                        title={`${c.criterionName}: ${c.score}/${c.maxScore}`}
                      >
                        {c.score}/{c.maxScore}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Total Score */}
                <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                  <span className="font-heading font-extrabold text-sm text-[#028051]">
                    {evalItem.totalScore}{' '}
                    <span className="text-[10px] text-[#6D7068] font-normal">/ {evalItem.maxScore}</span>
                  </span>
                </td>

                {/* Submitted */}
                <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#6D7068]">
                  {evalItem.submittedAt
                    ? new Date(evalItem.submittedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Draft'}
                </td>

                {/* Action */}
                <td className="px-4 py-3.5 whitespace-nowrap text-right">
                  <button
                    type="button"
                    onClick={() => onViewDetails(evalItem)}
                    className="p-1.5 rounded-[5px] bg-[#E2EBDD] text-[#028051] hover:bg-[#B8CEB0] transition-colors cursor-pointer"
                    title="Inspect Evaluation"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
