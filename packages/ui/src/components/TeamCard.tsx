import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import { cn } from '@almosthack/utils';
import { Crown, GitBranch, Users, ChevronRight } from 'lucide-react';

export interface TeamMemberPreview {
  id: string;
  name: string;
  avatarUrl?: string;
  isCaptain?: boolean;
  role?: string;
}

export interface TeamCardProps {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  members: TeamMemberPreview[];
  maxMembers?: number;
  trackName?: string;
  repositoryUrl?: string;
  onClick?: () => void;
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  name,
  slug,
  description,
  members = [],
  maxMembers = 4,
  trackName,
  repositoryUrl,
  onClick,
  className,
}) => {
  const captain = members.find((m) => m.isCaptain);

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={cn('flex flex-col justify-between gap-4 text-left group', className)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-bold font-heading text-[#171914] group-hover:text-[#355C45] transition-colors">
              {name}
            </h4>
            {slug && <span className="text-[11px] font-mono text-[#6D7068]">@{slug}</span>}
          </div>
          {trackName && (
            <Badge variant="accent" size="sm">
              {trackName}
            </Badge>
          )}
        </div>

        {description && (
          <p className="text-xs text-[#6D7068] font-body line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Members & Repository Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#DCDDD3]/80">
        <div className="flex items-center gap-2">
          <AvatarGroup max={3} size="sm">
            {members.map((m) => (
              <Avatar key={m.id} src={m.avatarUrl} name={m.name} size="sm" />
            ))}
          </AvatarGroup>
          <span className="text-[11px] font-mono text-[#6D7068]">
            {members.length} / {maxMembers}
          </span>
          {captain && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#785A12] bg-[#FAF3D1] px-1.5 py-0.5 rounded-[4px] border border-[#E9E5A8]">
              <Crown className="w-2.5 h-2.5" /> {captain.name}
            </span>
          )}
        </div>

        {repositoryUrl ? (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-[#355C45] font-semibold">
            <GitBranch className="w-3.5 h-3.5" /> Repo Linked
          </span>
        ) : onClick ? (
          <ChevronRight className="w-4 h-4 text-[#9A9C94] group-hover:text-[#355C45] group-hover:translate-x-0.5 transition-transform" />
        ) : null}
      </div>
    </Card>
  );
};
