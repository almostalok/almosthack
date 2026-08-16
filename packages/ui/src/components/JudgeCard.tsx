import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '@almosthack/utils';
import { Award, ShieldCheck } from 'lucide-react';

export interface JudgeCardProps {
  name: string;
  role: string;
  avatarUrl?: string;
  assignedCount: number;
  completedCount: number;
  calibrationScore?: number;
  className?: string;
}

export const JudgeCard: React.FC<JudgeCardProps> = ({
  name,
  role,
  avatarUrl,
  assignedCount,
  completedCount,
  calibrationScore = 98.4,
  className,
}) => {
  const percentage = Math.round((completedCount / (assignedCount || 1)) * 100);

  return (
    <Card hoverable className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-zinc-200">
          {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" /> : name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-zinc-100 font-heading">{name}</h4>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xs text-zinc-400 font-mono">{role}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 bg-zinc-900/60 rounded border border-zinc-800/80 font-mono text-xs">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase block">Evaluated</span>
          <span className="font-bold text-zinc-200">{completedCount} / {assignedCount} ({percentage}%)</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase block">Calibration</span>
          <span className="font-bold text-emerald-400">{calibrationScore}%</span>
        </div>
      </div>
    </Card>
  );
};
