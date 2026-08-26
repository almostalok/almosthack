import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '@almosthack/utils';
import { GitBranch, Star, CheckCircle2 } from 'lucide-react';

export interface RepositoryCardProps {
  name: string;
  owner: string;
  description?: string;
  stars?: number;
  commitHash?: string;
  verifiedAudit?: boolean;
  language?: string;
  onClick?: () => void;
  className?: string;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  name,
  owner,
  description,
  stars = 0,
  commitHash,
  verifiedAudit = true,
  language = 'TypeScript',
  onClick,
  className,
}) => {
  return (
    <Card hoverable={!!onClick} onClick={onClick} className={cn('flex flex-col gap-3 font-body text-left', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#355C45]" />
          <span className="text-sm font-mono font-bold text-[#171914]">{owner} / {name}</span>
        </div>
        {verifiedAudit ? (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#274535]" /> Audit Verified
          </Badge>
        ) : (
          <Badge variant="outline" size="sm">Unverified</Badge>
        )}
      </div>

      {description && <p className="text-xs font-body text-[#6D7068] line-clamp-2 leading-relaxed">{description}</p>}

      <div className="flex items-center justify-between text-[11px] font-mono text-[#6D7068] pt-2 border-t border-[#DCDDD3]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#355C45]" />
            {language}
          </span>
          {stars > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#785A12]" />
              {stars}
            </span>
          )}
        </div>
        {commitHash && (
          <span className="font-mono text-[#171914] bg-[#F7F4EA] px-2 py-0.5 rounded-[4px] border border-[#DCDDD3]">
            {commitHash.substring(0, 7)}
          </span>
        )}
      </div>
    </Card>
  );
};
