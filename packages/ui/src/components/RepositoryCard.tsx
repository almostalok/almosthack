import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '@almosthack/utils';
import { GitBranch, Star, Lock, CheckCircle2 } from 'lucide-react';

export interface RepositoryCardProps {
  name: string;
  owner: string;
  description?: string;
  stars?: number;
  commitHash?: string;
  verifiedAudit?: boolean;
  language?: string;
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
  className,
}) => {
  return (
    <Card hoverable className={cn('flex flex-col gap-3 font-mono', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-zinc-100">{owner} / {name}</span>
        </div>
        {verifiedAudit ? (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3" /> Audit Verified
          </Badge>
        ) : (
          <Badge variant="outline" size="sm">Unverified</Badge>
        )}
      </div>

      {description && <p className="text-xs font-sans text-zinc-400 line-clamp-2">{description}</p>}

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />{language}</span>
          {stars > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{stars}</span>}
        </div>
        {commitHash && (
          <span className="font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
            {commitHash.substring(0, 7)}
          </span>
        )}
      </div>
    </Card>
  );
};
