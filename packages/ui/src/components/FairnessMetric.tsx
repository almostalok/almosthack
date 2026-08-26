import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '@almosthack/utils';
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface FairnessMetricProps {
  score: number; // e.g. 98.4%
  deviation: number; // e.g. 0.12
  consensusDelta?: number;
  anomalyDetected?: boolean;
  sampleSize?: number;
  className?: string;
}

export const FairnessMetric: React.FC<FairnessMetricProps> = ({
  score = 98.4,
  deviation = 0.12,
  consensusDelta = 0.04,
  anomalyDetected = false,
  sampleSize = 42,
  className,
}) => {
  return (
    <Card variant="editorial" className={cn('flex flex-col gap-4 text-left font-body', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#355C45]" />
          <span className="text-xs font-mono font-bold uppercase text-[#6D7068] tracking-wider">
            Fairness & Calibration Engine
          </span>
        </div>
        {anomalyDetected ? (
          <Badge variant="destructive" size="sm" className="gap-1">
            <AlertTriangle className="w-3 h-3" /> Anomaly Flagged
          </Badge>
        ) : (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3" /> Calibrated High Confidence
          </Badge>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold font-heading text-[#355C45]">
            {score}%
          </span>
          <span className="text-xs font-mono text-[#6D7068] block mt-0.5">
            Inter-Judge Consensus Index
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#DCDDD3]/80 font-mono text-xs">
        <div className="p-2.5 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3]">
          <span className="text-[10px] text-[#6D7068] uppercase block">Std Deviation</span>
          <span className="font-bold text-[#171914]">σ = {deviation}</span>
        </div>
        <div className="p-2.5 bg-[#F7F4EA] rounded-[8px] border border-[#DCDDD3]">
          <span className="text-[10px] text-[#6D7068] uppercase block">Consensus Delta</span>
          <span className="font-bold text-[#171914]">± {consensusDelta}</span>
        </div>
      </div>

      <p className="text-[11px] text-[#6D7068] font-mono leading-relaxed">
        Based on {sampleSize} pairwise double-blind evaluations across active rubric tracks.
      </p>
    </Card>
  );
};
