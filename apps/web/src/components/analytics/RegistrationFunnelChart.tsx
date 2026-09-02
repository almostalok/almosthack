'use client';

import React from 'react';
import { Filter, CheckCircle2, ArrowDownRight, Layers } from 'lucide-react';
import { RegistrationFunnelStage } from './analytics-types';

export interface RegistrationFunnelChartProps {
  stages: RegistrationFunnelStage[];
  viewMode?: 'CHARTS' | 'TABLES';
}

export const RegistrationFunnelChart: React.FC<RegistrationFunnelChartProps> = ({
  stages,
  viewMode = 'CHARTS',
}) => {
  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-4">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
              Participant Conversion Funnel
            </h3>
            <p className="text-[11px] text-[#6D7068] font-body">
              Stage-by-stage drop-off from onboarding to final submission.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#028051] bg-[#E2EBDD] px-2.5 py-1 rounded border border-[#B8CEB0]">
          55.2% End-to-End Yield
        </span>
      </div>

      {viewMode === 'TABLES' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] text-[10px] uppercase font-bold text-[#6D7068]">
              <tr>
                <th className="px-3 py-2">Funnel Stage</th>
                <th className="px-3 py-2">Participants</th>
                <th className="px-3 py-2">Conversion %</th>
                <th className="px-3 py-2 text-right">Stage Drop-off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {stages.map((st) => (
                <tr key={st.stage} className="hover:bg-[#F7F4EA]/50">
                  <td className="px-3 py-2 font-bold">{st.stage}</td>
                  <td className="px-3 py-2">{st.count}</td>
                  <td className="px-3 py-2 text-[#028051] font-bold">{st.percentage}%</td>
                  <td className="px-3 py-2 text-right text-[#D97706]">
                    {st.dropoffPercentage > 0 ? `-${st.dropoffPercentage}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {stages.map((st, idx) => {
            return (
              <div key={st.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#F7F4EA] border border-[#DCDDD3] flex items-center justify-center font-bold text-[10px] text-[#171914]">
                      {idx + 1}
                    </span>
                    <span className="font-heading font-bold text-[#171914]">
                      {st.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {st.dropoffPercentage > 0 && (
                      <span className="text-[10px] text-[#D97706] flex items-center gap-0.5">
                        <ArrowDownRight className="w-3 h-3" />
                        -{st.dropoffPercentage}% drop
                      </span>
                    )}
                    <span className="font-bold text-[#171914]">
                      {st.count}{' '}
                      <span className="text-[10px] text-[#6D7068] font-normal">
                        ({st.percentage}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-2 w-full bg-[#EAE7DC] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={st.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${st.stage} conversion progress`}
                  aria-valuetext={`${st.stage}: ${st.count} participants (${st.percentage}%)`}
                >
                  <div
                    style={{ width: `${st.percentage}%` }}
                    className="h-full bg-[#028051] rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
