import React from 'react';
import { Badge, BadgeVariant } from './Badge';
import { cn } from '@almosthack/utils';

export type HackathonLifecycleState =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'LIVE'
  | 'SUBMISSION_OPEN'
  | 'SUBMISSION_CLOSED'
  | 'JUDGING'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface HackathonStatusProps {
  status: HackathonLifecycleState | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HackathonStatus: React.FC<HackathonStatusProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const getVariant = (st: string): BadgeVariant => {
    switch (st.toUpperCase()) {
      case 'LIVE':
      case 'RUNNING':
        return 'LIVE';
      case 'JUDGING':
      case 'EVALUATING':
        return 'JUDGING';
      case 'COMPLETED':
      case 'ENDED':
        return 'COMPLETED';
      case 'DRAFT':
        return 'default';
      case 'PUBLISHED':
      case 'REGISTRATION_OPEN':
      case 'OPEN':
        return 'OPEN';
      default:
        return 'accent';
    }
  };

  const getLabel = (st: string): string => {
    return st.replace(/_/g, ' ');
  };

  return (
    <Badge
      variant={getVariant(status)}
      size={size}
      dot={status.toUpperCase() === 'LIVE'}
      className={cn('tracking-wider', className)}
    >
      {getLabel(status)}
    </Badge>
  );
};
