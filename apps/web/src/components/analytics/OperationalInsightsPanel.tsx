'use client';

import React from 'react';
import Link from 'next/link';
import { Lightbulb, ArrowRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { OperationalInsightItem } from './analytics-types';

export interface OperationalInsightsPanelProps {
  insights: OperationalInsightItem[];
}

export const OperationalInsightsPanel: React.FC<OperationalInsightsPanelProps> = ({
  insights,
}) => {
  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#D97706]" />
          <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
            Operational Insights & Action Recommendations
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#6D7068]">
          Derived from Active Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {insights.map((ins) => {
          const isHigh = ins.impact === 'HIGH';

          return (
            <div
              key={ins.id}
              className={`p-4 rounded-[10px] bg-[#FFFDF8] border shadow-xs flex flex-col justify-between gap-3 text-xs ${
                isHigh ? 'border-[#D97706]/50 bg-[#FFFDF8]' : 'border-[#DCDDD3]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isHigh
                        ? 'bg-[#FFF4DC] text-[#785A12] border border-[#F0D597]'
                        : 'bg-[#F7F4EA] text-[#6D7068] border border-[#DCDDD3]'
                    }`}
                  >
                    {ins.category} · {ins.impact} IMPACT
                  </span>
                  <span className="font-mono font-bold text-xs text-[#028051]">
                    {ins.metric}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-xs text-[#171914]">
                  {ins.title}
                </h4>

                <p className="text-[11px] text-[#6D7068] font-body leading-relaxed">
                  {ins.description}
                </p>
              </div>

              {ins.actionUrl && ins.actionLabel && (
                <div className="pt-2 border-t border-[#DCDDD3]/60 font-mono text-[11px]">
                  <Link
                    href={ins.actionUrl}
                    className="text-[#028051] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>{ins.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
