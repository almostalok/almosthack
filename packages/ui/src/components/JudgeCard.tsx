import React from 'react';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { cn } from '@almosthack/utils';
import { ShieldCheck } from 'lucide-react';

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
    <Card hoverable className={cn('flex flex-col gap-3 text-left', className)}>
      <div className="flex items-center gap-3">
        <Avatar src={avatarUrl} name={name} size="md" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#171914] font-heading">{name}</h4>
            <ShieldCheck className="w-3.5 h-3.5 text-[#355C45]" />
          </div>
          <span className="text-xs text-[#6D7068] font-mono">{role}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F7F4EA] rounded-[10px] border border-[#DCDDD3] font-mono text-xs">
        <div>
          <span className="text-[10px] text-[#6D7068] uppercase block">Evaluated</span>
          <span className="font-bold text-[#171914]">
            {completedCount} / {assignedCount} ({percentage}%)
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#6D7068] uppercase block">Calibration</span>
          <span className="font-bold text-[#355C45]">{calibrationScore}%</span>
        </div>
      </div>
    </Card>
  );
};
