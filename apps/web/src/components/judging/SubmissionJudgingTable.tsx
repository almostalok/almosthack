'use client';

import React from 'react';
import { Button } from '@almosthack/ui';
import {
  FileCode2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  Layers,
  Award,
} from 'lucide-react';
import { SubmissionJudgingItem } from './judging-types';

export interface SubmissionJudgingTableProps {
  submissions: SubmissionJudgingItem[];
  onAssignJudge: (submission: SubmissionJudgingItem) => void;
}

export const SubmissionJudgingTable: React.FC<SubmissionJudgingTableProps> = ({
  submissions,
  onAssignJudge,
}) => {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[#DCDDD3] bg-[#FFFDF8] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-body text-[#171914]">
          <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] font-mono text-[11px] font-bold text-[#6D7068] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Project & Team</th>
              <th className="px-4 py-3">Track</th>
              <th className="px-4 py-3">Assigned Evaluators</th>
              <th className="px-4 py-3">Evaluations Status</th>
              <th className="px-4 py-3">Average Score</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCDDD3]/70">
            {submissions.map((sub) => {
              const isComplete = sub.completedEvaluations >= sub.requiredEvaluations;

              return (
                <tr
                  key={sub.id}
                  className="hover:bg-[#F7F4EA]/70 transition-colors duration-100"
                >
                  {/* Project & Team */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#E2EBDD] text-[#028051] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#B8CEB0]">
                        <FileCode2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-heading font-bold text-[#171914] block truncate">
                          {sub.projectTitle}
                        </span>
                        <span className="text-[11px] font-body text-[#6D7068] block truncate">
                          Team: {sub.teamName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Track */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {sub.trackName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#171914]">
                        <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span className="max-w-[130px] truncate" title={sub.trackName}>
                          {sub.trackName}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#9A9C94]">General Track</span>
                    )}
                  </td>

                  {/* Assigned Evaluators */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {sub.assignedJudges.map((j, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                            j.status === 'COMPLETED'
                              ? 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]'
                              : 'bg-[#FFF4DC] text-[#785A12] border-[#F0D597]'
                          }`}
                        >
                          {j.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#028051]" />
                          ) : (
                            <Clock className="w-2.5 h-2.5 text-[#D97706]" />
                          )}
                          <span>{j.judgeName.split(' ')[0]}</span>
                          {j.score !== undefined && (
                            <strong className="text-[#171914]">({j.score})</strong>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Evaluations Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
                        isComplete
                          ? 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]'
                          : 'bg-[#FFF4DC] text-[#785A12] border-[#F0D597]'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-3 h-3 text-[#028051]" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                      )}
                      <span>
                        {sub.completedEvaluations} / {sub.requiredEvaluations} Evaluations
                      </span>
                    </span>
                  </td>

                  {/* Average Score */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                    {sub.averageScore !== undefined ? (
                      <span className="font-heading font-extrabold text-sm text-[#028051]">
                        {sub.averageScore.toFixed(1)}{' '}
                        <span className="text-[10px] text-[#6D7068] font-normal">/ 100</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#9A9C94] font-mono">Pending</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onAssignJudge(sub)}
                      leftIcon={<UserPlus className="w-3.5 h-3.5 text-[#028051]" />}
                      className="text-xs font-mono h-7 px-2 border-[#B8CEB0] text-[#028051] hover:bg-[#E2EBDD]"
                    >
                      Assign
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
